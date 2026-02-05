import { AppData, WorkoutType, WorkoutSet, UserProfile, PublicProfileData, WorkoutSession } from '../types';

const STORAGE_KEY = 'gym_twa_data';
const SERVER_URL = 'https://functions.yandexcloud.net/d4ehnqvq3a8fo55t7tj4';

const WEBAPP = (window as any).Telegram?.WebApp;

const defaultData: AppData = {
    workoutTypes: [
        { id: '1', name: 'Жим лежа' },
        { id: '2', name: 'Приседания' },
        { id: '3', name: 'Становая тяга' }
    ],
    logs: [],
    workouts: []
};

export type SyncStatus = 'idle' | 'saving' | 'success' | 'error';

export class StorageService {
    private data: AppData;
    private onUpdateCallback?: () => void;
    private onSyncStatusChangeCallback?: (status: SyncStatus) => void;
    private status: SyncStatus = 'idle';

    constructor() {
        this.data = this.loadLocal();
        this.migrateData();
    }

    private getHeaders() {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (WEBAPP?.initData) {
            headers['X-Telegram-Init-Data'] = WEBAPP.initData;
        }
        return headers;
    }

    async init() {
        await this.syncFromServer();
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

    private loadLocal(): AppData {
        const json = localStorage.getItem(STORAGE_KEY);
        if (!json) return defaultData;
        try {
            const data = JSON.parse(json);
            return {
                ...defaultData,
                ...data,
                // Ensure workouts array exists if loading old data
                workouts: data.workouts || []
            };
        } catch (e) {
            console.error('Failed to parse storage data', e);
            return defaultData;
        }
    }

    private migrateData() {
        let hasChanges = false;

        // Migration: Group orphans logs into implicit workouts
        const logsWithoutWorkout = this.data.logs.filter(l => !l.workoutId);

        if (logsWithoutWorkout.length > 0) {
            hasChanges = true;
            // Group by day
            const logsByDay = new Map<string, WorkoutSet[]>();

            logsWithoutWorkout.forEach(log => {
                const dateKey = log.date.split('T')[0];
                if (!logsByDay.has(dateKey)) {
                    logsByDay.set(dateKey, []);
                }
                logsByDay.get(dateKey)!.push(log);
            });

            logsByDay.forEach((dayLogs, dateKey) => {
                // Create implicit workout for this day
                const sortedLogs = dayLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                const startTime = sortedLogs[0].date;
                const endTime = sortedLogs[sortedLogs.length - 1].date;

                const workoutId = `implicit_${dateKey}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

                const newWorkout: WorkoutSession = {
                    id: workoutId,
                    startTime,
                    endTime,
                    status: 'finished',
                    isManual: false,
                    pauseIntervals: []
                };

                this.data.workouts.push(newWorkout);

                // Update logs
                dayLogs.forEach(log => {
                    log.workoutId = workoutId;
                });
            });
        }

        if (hasChanges) {
            this.saveLocal();
        }
    }

    private saveLocal(): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }

    private async syncFromServer() {
        this.setStatus('saving');
        try {
            const response = await fetch(SERVER_URL, {
                headers: this.getHeaders()
            });

            if (response.ok) {
                const remoteData = await response.json();
                if (remoteData && (remoteData.workoutTypes || remoteData.logs)) {
                    this.data = {
                        ...this.data,
                        ...remoteData,
                        workouts: remoteData.workouts || this.data.workouts
                    };
                    this.migrateData(); // Run migration on synced data too
                    this.saveLocal();
                    this.onUpdateCallback?.();
                }
                this.setStatus('success');
            } else {
                this.setStatus('error');
            }
        } catch (e) {
            console.error('Failed to sync from server', e);
            this.setStatus('error');
        }
    }

    private async saveToServer() {
        this.setStatus('saving');
        try {
            await fetch(SERVER_URL, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(this.data)
            });
            this.setStatus('success');
        } catch (e) {
            console.error('Failed to save to server', e);
            this.setStatus('error');
        }
    }

    private async persist() {
        this.saveLocal();
        await this.saveToServer();
    }

    getWorkoutTypes(): WorkoutType[] {
        return this.data.workoutTypes;
    }

    async addWorkoutType(name: string): Promise<WorkoutType> {
        const newType: WorkoutType = {
            id: Date.now().toString(),
            name
        };
        this.data.workoutTypes.push(newType);
        await this.persist();
        return newType;
    }

    async deleteWorkoutType(id: string): Promise<void> {
        this.data.workoutTypes = this.data.workoutTypes.filter(t => t.id !== id);
        await this.persist();
    }

    getLogs(): WorkoutSet[] {
        return this.data.logs;
    }

    getWorkouts(): WorkoutSession[] {
        return this.data.workouts;
    }

    getActiveWorkout(): WorkoutSession | undefined {
        return this.data.workouts.find(w => w.status === 'active' || w.status === 'paused');
    }

    async startWorkout(name?: string): Promise<WorkoutSession> {
        // Finish any currently active workout
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
            pauseIntervals: []
        };

        this.data.workouts.push(newWorkout);
        await this.persist();
        return newWorkout;
    }

    async pauseWorkout(): Promise<void> {
        const active = this.getActiveWorkout();
        if (active && active.status === 'active') {
            active.status = 'paused';
            active.pauseIntervals.push({ start: new Date().toISOString() });
            await this.persist();
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
            await this.persist();
        }
    }

    async finishWorkout(): Promise<void> {
        const active = this.getActiveWorkout();
        if (active) {
            active.status = 'finished';
            active.endTime = new Date().toISOString();

            // Close any open pause interval
            const lastPause = active.pauseIntervals[active.pauseIntervals.length - 1];
            if (lastPause && !lastPause.end) {
                lastPause.end = active.endTime;
            }

            await this.persist();
        }
    }

    getWorkoutDuration(workout: WorkoutSession): number {
        const start = new Date(workout.startTime).getTime();
        const end = workout.endTime ? new Date(workout.endTime).getTime() : Date.now();
        let totalTime = end - start;

        // Subtract pause intervals
        workout.pauseIntervals.forEach(interval => {
            const pStart = new Date(interval.start).getTime();
            const pEnd = interval.end ? new Date(interval.end).getTime() : (workout.status === 'paused' ? Date.now() : end);
            // Verify interval is within [start, end] to be safe, though usage implies it is.
            if (pEnd > pStart) {
                totalTime -= (pEnd - pStart);
            }
        });

        // Ensure non-negative (clock skew safety)
        const minutes = Math.floor(Math.max(0, totalTime) / 60000);

        // If it's less than 1 minute but has started, maybe show 1? Or 0 is fine.
        return minutes;
    }

    private ensureActiveWorkout(): string {
        const active = this.getActiveWorkout();
        if (active) return active.id;

        const today = new Date().toISOString().split('T')[0];
        const workouts = this.data.workouts;

        // Check if the last workout of the day is implicit
        // Sort workouts by startTime
        const todaysWorkouts = workouts.filter(w => w.startTime.startsWith(today));
        const lastWorkout = todaysWorkouts.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0];

        if (lastWorkout && !lastWorkout.isManual && lastWorkout.status === 'finished') {
            // Reuse it. Update endTime to now
            lastWorkout.endTime = new Date().toISOString();
            this.saveLocal();
            return lastWorkout.id;
        }

        // Create new implicit workout
        const id = `implicit_${today}_${Date.now()}`;
        const newWorkout: WorkoutSession = {
            id,
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            status: 'finished', // Implicit ones are always "done" until extended
            isManual: false,
            pauseIntervals: []
        };
        this.data.workouts.push(newWorkout);

        return id;
    }

    async addLog(log: Omit<WorkoutSet, 'id' | 'date' | 'workoutId'>): Promise<WorkoutSet> {
        const workoutId = this.ensureActiveWorkout();

        const newLog: WorkoutSet = {
            ...log,
            id: Date.now().toString(),
            date: new Date().toISOString(),
            workoutId
        };

        this.data.logs.push(newLog);

        // Update workout end time if it matches the log's workout
        const workout = this.data.workouts.find(w => w.id === workoutId);
        if (workout && !workout.isManual) {
            workout.endTime = newLog.date;
        }

        await this.persist();
        return newLog;
    }

    async deleteLog(id: string): Promise<void> {
        this.data.logs = this.data.logs.filter(l => l.id !== id);
        // We generally don't delete workouts even if empty? Or maybe cleanup?
        // Let's leave workouts for now.
        await this.persist();
    }

    async updateLog(updatedLog: WorkoutSet): Promise<void> {
        const index = this.data.logs.findIndex(l => l.id === updatedLog.id);
        if (index !== -1) {
            this.data.logs[index] = updatedLog;
            await this.persist();
        }
    }

    // --- Profile methods ---

    getProfile(): UserProfile | undefined {
        return this.data.profile;
    }

    getProfileIdentifier(): string {
        const profile = this.data.profile;
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
        const username = user?.username;
        const photoUrl = user?.photo_url;

        if (!this.data.profile) {
            this.data.profile = {
                isPublic: false,
                showFullHistory: false,
                telegramUserId: userId || 0,
                telegramUsername: username,
                photoUrl: photoUrl,
                createdAt: new Date().toISOString(),
            };
        } else {
            // Update photo URL if it's available and different
            if (photoUrl) {
                this.data.profile.photoUrl = photoUrl;
            }
        }

        this.data.profile = { ...this.data.profile, ...settings };
        await this.persist();
        this.onUpdateCallback?.();
    }

    async getPublicProfile(identifier: string): Promise<PublicProfileData | null> {
        try {
            const response = await fetch(`${SERVER_URL}?profile=${encodeURIComponent(identifier)}`);
            if (!response.ok) {
                return null;
            }
            return await response.json();
        } catch (e) {
            console.error('Failed to fetch public profile', e);
            return null;
        }
    }
}

export const storage = new StorageService();
