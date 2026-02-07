import { AppData, WorkoutType, WorkoutSet, UserProfile, PublicProfileData, WorkoutSession } from '../types';
import { SyncService } from '../services/sync';
import { db } from '../db';
import { clearAuthData } from '../auth';

const STORAGE_KEY = 'gym_twa_data'; // Keeping for migration check

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WEBAPP = (window as any).Telegram?.WebApp;

const defaultData: AppData = {
    workoutTypes: [
        { id: '1', name: 'Жим лежа', updatedAt: new Date().toISOString() },
        { id: '2', name: 'Приседания', updatedAt: new Date().toISOString() },
        { id: '3', name: 'Становая тяга', updatedAt: new Date().toISOString() }
    ],
    logs: [],
    workouts: []
};

export type SyncStatus = 'idle' | 'saving' | 'success' | 'error';

export class StorageService {
    private onUpdateCallback?: () => void;
    private onSyncStatusChangeCallback?: (status: SyncStatus) => void;
    private status: SyncStatus = 'idle';

    constructor() {
        this.init();
    }

    async init() {
        await this.migrateFromLocalStorage();
        // Initial Sync (fire and forget)
        this.sync().catch(console.error);
    }

    private async migrateFromLocalStorage() {
        const json = localStorage.getItem(STORAGE_KEY);
        if (json) {
            try {
                const oldData = JSON.parse(json);
                const count = await db.workoutTypes.count();
                if (count === 0) {
                    console.log('Migrating from localStorage to IDB...');
                    const now = new Date().toISOString();

                    // Migrate Types
                    const types = (oldData.workoutTypes || defaultData.workoutTypes).map((t: Partial<WorkoutType>) => ({
                        ...t, updatedAt: now
                    }));
                    await db.workoutTypes.bulkPut(types);

                    // Migrate Logs
                    const logs = (oldData.logs || []).map((l: Partial<WorkoutSet>) => ({
                        ...l, updatedAt: now, workoutId: l.workoutId || 'legacy'
                    }));
                    await db.logs.bulkPut(logs);

                    // Migrate Workouts
                    const workouts = (oldData.workouts || []).map((w: Partial<WorkoutSession>) => ({
                        ...w, updatedAt: now
                    }));
                    await db.workouts.bulkPut(workouts);

                    // Migrate Profile
                    if (oldData.profile) {
                        // We use 'me' or just count on sync to restore profile.
                        // But better to save it. Profile table has 'id' key.
                        // Let's assume one profile for now or assign ID based on userId.
                        const profile = { ...oldData.profile, id: 'me', updatedAt: now };
                        await db.profile.put(profile);
                    }

                    // Clear LocalStorage after successful migration?
                    // localStorage.removeItem(STORAGE_KEY); 
                    // Keeping it for safety for now.
                }
            } catch (e) {
                console.error('Migration failed', e);
            }
        } else {
            const count = await db.workoutTypes.count();
            if (count === 0) {
                // Seed default types
                await db.workoutTypes.bulkPut(defaultData.workoutTypes);
            }
        }
    }

    onUpdate(callback: () => void) {
        this.onUpdateCallback = callback;
    }

    onSyncStatusChange(callback: (status: SyncStatus) => void) {
        this.onSyncStatusChangeCallback = callback;
    }

    private setStatus(status: SyncStatus) {
        this.status = status;
        this.onSyncStatusChangeCallback?.(status);

        if (status === 'success') {
            setTimeout(() => {
                if (this.status === 'success') {
                    this.setStatus('idle');
                }
            }, 2000);
        }
    }

    async sync() {
        // Early exit: if TMA auth is known to be broken and no web auth, don't even try
        const skipTmaAuth = localStorage.getItem('skip_tma_auth') === 'true';
        if (skipTmaAuth) {
            const webAuth = (await import('../auth')).getAuthString();
            if (!webAuth) {
                // No valid auth available, skip sync entirely
                this.setStatus('idle');
                return;
            }
        }

        try {
            this.setStatus('saving');
            await SyncService.sync();
            this.setStatus('success');
            this.onUpdateCallback?.();
        } catch (e: unknown) {
            console.error('Sync failed', e);
            const msg = (e instanceof Error ? e.message : String(e)).toLowerCase();
            if (msg.includes('unauthorized')) {
                // Check if we've already tried and failed
                if (skipTmaAuth) {
                    // Already failed before, don't reload again
                    this.setStatus('error');
                    return;
                }
                // First failure - ALWAYS set flag to skip TMA auth on next load
                localStorage.setItem('skip_tma_auth', 'true');
                clearAuthData();
                location.reload();
                return;
            }
            if (!(e instanceof Error && e.message === 'Offline')) {
                this.setStatus('error');
            } else {
                this.setStatus('idle'); // Offline is fine, just idle
            }
        }
    }

    // --- READ Methods ---

    // Note: These methods were synchronous before (returning arrays).
    // Dexie is async. We have two options:
    // 1. Refactor WHOLE app to use async getters.
    // 2. Cache data in memory in StorageService and keep it updated.
    // Given the app size, option 2 is easier to maintain backward compatibility for now,
    // BUT 'offline first' implies we should trust DB.
    // Because checking all call sites of getLogs() suggests it is used in render(),
    // making it async would require UI refactor (useEffect etc).
    // Let's implement an in-memory cache that mirrors DB.

    // CACHE
    private cache: AppData = { ...defaultData };

    // To make this work, we need to load cache on init and keep it updated.
    // We can use Dexie liveQuery or just update cache on mutations.

    // Let's try to load cache synchronously? No, IDB is async.
    // We will have to make getLogs() etc return values from 'cache', 
    // but ensures 'cache' is populated.
    // Initially cache is empty (or default).
    // After init() -> cache populated. page render might need to re-trigger.

    // For now, let's update cache on every mutation and on sync.
    // And on init.

    async reloadCache() {
        this.cache = await SyncService.readAll();
        this.onUpdateCallback?.();
    }

    // --- WRAPPERS ---

    getWorkoutTypes(): WorkoutType[] {
        return this.cache.workoutTypes.filter(i => !i.isDeleted);
    }

    getLogs(): WorkoutSet[] {
        return this.cache.logs.filter(i => !i.isDeleted);
    }

    getWorkouts(): WorkoutSession[] {
        return this.cache.workouts.filter(i => !i.isDeleted);
    }

    getActiveWorkout(): WorkoutSession | undefined {
        return this.cache.workouts.find(w => !w.isDeleted && (w.status === 'active' || w.status === 'paused'));
    }

    getProfile(): UserProfile | undefined {
        return this.cache.profile;
    }

    async addWorkoutType(name: string): Promise<WorkoutType> {
        const newType: WorkoutType = {
            id: Date.now().toString(),
            name,
            updatedAt: new Date().toISOString()
        };
        await db.workoutTypes.put(newType);
        await this.reloadCache();
        this.sync().catch(() => { });
        return newType;
    }

    async deleteWorkoutType(id: string): Promise<void> {
        const type = await db.workoutTypes.get(id);
        if (type) {
            type.isDeleted = true;
            type.updatedAt = new Date().toISOString();
            await db.workoutTypes.put(type);
            await this.reloadCache();
            this.sync().catch(() => { });
        }
    }

    async updateWorkoutType(id: string, name: string): Promise<void> {
        const type = await db.workoutTypes.get(id);
        if (type) {
            type.name = name;
            type.updatedAt = new Date().toISOString();
            await db.workoutTypes.put(type);
            await this.reloadCache();
            this.sync().catch(() => { });
        }
    }

    async startWorkout(name?: string): Promise<WorkoutSession> {
        const active = this.getActiveWorkout();
        if (active) {
            await this.finishWorkout();
        }

        const newWorkout: WorkoutSession = {
            id: Date.now().toString(),
            startTime: new Date().toISOString(),
            status: 'active',
            name,
            isManual: true,
            pauseIntervals: [],
            updatedAt: new Date().toISOString()
        };

        await db.workouts.put(newWorkout);
        await this.reloadCache();
        this.sync().catch(() => { });
        return newWorkout;
    }

    async pauseWorkout(): Promise<void> {
        const active = this.getActiveWorkout();
        if (active && active.status === 'active') {
            active.status = 'paused';
            active.pauseIntervals.push({ start: new Date().toISOString() });
            active.updatedAt = new Date().toISOString();
            await db.workouts.put(active);
            await this.reloadCache();
            this.sync().catch(() => { });
        }
    }

    async resumeWorkout(): Promise<void> {
        const active = this.getActiveWorkout();
        if (active && active.status === 'paused') {
            active.status = 'active';
            const lastPause = active.pauseIntervals[active.pauseIntervals.length - 1];
            if (lastPause && !lastPause.end) {
                lastPause.end = new Date().toISOString();
            }
            active.updatedAt = new Date().toISOString();
            await db.workouts.put(active);
            await this.reloadCache();
            this.sync().catch(() => { });
        }
    }

    async finishWorkout(): Promise<void> {
        const active = this.getActiveWorkout();
        if (active) {
            active.status = 'finished';
            active.endTime = new Date().toISOString();
            const lastPause = active.pauseIntervals[active.pauseIntervals.length - 1];
            if (lastPause && !lastPause.end) {
                lastPause.end = active.endTime;
            }
            active.updatedAt = new Date().toISOString();
            await db.workouts.put(active);
            await this.reloadCache();
            this.sync().catch(() => { });
        }
    }

    getWorkoutDuration(workout: WorkoutSession): number {
        const start = new Date(workout.startTime).getTime();
        const end = workout.endTime ? new Date(workout.endTime).getTime() : Date.now();
        let totalTime = end - start;

        workout.pauseIntervals.forEach(interval => {
            const pStart = new Date(interval.start).getTime();
            const pEnd = interval.end ? new Date(interval.end).getTime() : (workout.status === 'paused' ? Date.now() : end);
            if (pEnd > pStart) {
                totalTime -= (pEnd - pStart);
            }
        });

        const minutes = Math.floor(Math.max(0, totalTime) / 60000);
        return minutes;
    }

    private async ensureActiveWorkout(): Promise<string> {
        const active = this.getActiveWorkout();
        if (active) return active.id;

        const today = new Date().toISOString().split('T')[0];

        // Use cache for efficiency in implicit check, OR query DB.
        // For consistency via ensureActiveWorkout -> implicit creation...
        // Let's stick to cache since we await reloadCache on start/init.
        const workouts = this.getWorkouts();
        const todaysWorkouts = workouts.filter(w => w.startTime.startsWith(today));
        const lastWorkout = todaysWorkouts.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0];

        if (lastWorkout && !lastWorkout.isManual && lastWorkout.status === 'finished') {
            lastWorkout.endTime = new Date().toISOString();
            lastWorkout.updatedAt = new Date().toISOString();
            await db.workouts.put(lastWorkout);
            await this.reloadCache();
            this.sync().catch(() => { });
            return lastWorkout.id;
        }

        const id = `implicit_${today}_${Date.now()}`;
        const newWorkout: WorkoutSession = {
            id,
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            status: 'finished',
            isManual: false,
            pauseIntervals: [],
            updatedAt: new Date().toISOString()
        };
        await db.workouts.put(newWorkout);
        await this.reloadCache();
        this.sync().catch(() => { });
        return id;
    }

    private async updateImplicitWorkoutBounds(workoutId: string) {
        const workout = (await db.workouts.get(workoutId));
        if (!workout || workout.isManual) return;

        // Need fresh logs from DB to be accurate
        const workoutLogs = await db.logs.where('workoutId').equals(workoutId).toArray();
        const activeLogs = workoutLogs.filter(l => !l.isDeleted);

        if (activeLogs.length === 0) return;

        const sorted = activeLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        workout.startTime = sorted[0].date;
        workout.endTime = sorted[sorted.length - 1].date;
        workout.status = 'finished'; // ensure
        workout.updatedAt = new Date().toISOString();

        await db.workouts.put(workout);
        // no reloadCache called here, caller usually calls it or syncs
    }

    async addLog(log: Omit<WorkoutSet, 'id' | 'date' | 'workoutId' | 'updatedAt' | 'isDeleted'>): Promise<WorkoutSet> {
        const workoutId = await this.ensureActiveWorkout();

        const newLog: WorkoutSet = {
            ...log,
            id: Date.now().toString(),
            date: new Date().toISOString(),
            workoutId,
            updatedAt: new Date().toISOString()
        };

        await db.logs.put(newLog);
        await this.updateImplicitWorkoutBounds(workoutId);
        await this.reloadCache();
        this.sync().catch(() => { });
        return newLog;
    }

    async deleteLog(id: string): Promise<void> {
        const log = await db.logs.get(id);
        if (log) {
            const workoutId = log.workoutId;
            log.isDeleted = true;
            log.updatedAt = new Date().toISOString();
            await db.logs.put(log);

            if (workoutId) {
                await this.updateImplicitWorkoutBounds(workoutId);
            }
            await this.reloadCache();
            this.sync().catch(() => { });
        }
    }

    async updateLog(updatedLog: WorkoutSet): Promise<void> {
        // updatedLog comes from UI, likely doesn't have new updatedAt yet.
        const toSave = { ...updatedLog, updatedAt: new Date().toISOString() };
        await db.logs.put(toSave);
        await this.reloadCache();
        this.sync().catch(() => { });
    }

    getProfileIdentifier(): string {
        // Logic to get identifier from profile or webapp
        // This logic was relying on current cache.
        const profile = this.cache.profile;
        if (profile?.telegramUsername) {
            return profile.telegramUsername;
        }
        if (profile?.telegramUserId) {
            return `id_${profile.telegramUserId}`;
        }
        const userId = WEBAPP?.initDataUnsafe?.user?.id;
        return userId ? `id_${userId}` : '';
    }

    async updateProfileSettings(settings: Partial<UserProfile>): Promise<void> {
        const user = WEBAPP?.initDataUnsafe?.user;
        const userId = user?.id;

        // Check DB directly or cache?
        // Let's check cache for existence, but update DB
        let profile = this.cache.profile;

        if (!profile) {
            profile = {
                id: 'me', // Singleton ID
                isPublic: false,
                showFullHistory: false,
                telegramUserId: userId || 0,
                telegramUsername: user?.username,
                photoUrl: user?.photo_url,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            } as UserProfile;
        } else {
            if (user?.photo_url) {
                profile.photoUrl = user.photo_url;
            }
        }

        const merged = { ...profile, ...settings, updatedAt: new Date().toISOString() };
        await db.profile.put(merged);
        await this.reloadCache();
        this.sync().catch(() => { });
    }

    async getPublicProfile(identifier: string): Promise<PublicProfileData | null> {
        // This is a server call.
        try {
            // Keep using SERVER_URL from where? It was in file context but not exported.
            // Let's hardcode or import.
            const SERVER_URL = 'https://functions.yandexcloud.net/d4ehnqvq3a8fo55t7tj4';
            const response = await fetch(`${SERVER_URL}?profile=${encodeURIComponent(identifier)}`);
            if (!response.ok) return null;
            return await response.json();
        } catch {
            return null;
        }
    }
}

export const storage = new StorageService();
// Trigger initial load
storage.reloadCache().then(() => {
    // maybe notify listeners?
    // Storage initialized
});
