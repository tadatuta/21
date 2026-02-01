import { AppData, WorkoutType, WorkoutSet, UserProfile, PublicProfileData } from '../types';

const STORAGE_KEY = 'gym_twa_data';
const SERVER_URL = 'https://functions.yandexcloud.net/d4ehnqvq3a8fo55t7tj4';

const WEBAPP = (window as any).Telegram?.WebApp;

const defaultData: AppData = {
    workoutTypes: [
        { id: '1', name: 'Жим лежа' },
        { id: '2', name: 'Приседания' },
        { id: '3', name: 'Становая тяга' }
    ],
    logs: []
};

export type SyncStatus = 'idle' | 'saving' | 'success' | 'error';

export class StorageService {
    private data: AppData;
    private onUpdateCallback?: () => void;
    private onSyncStatusChangeCallback?: (status: SyncStatus) => void;
    private status: SyncStatus = 'idle';

    constructor() {
        this.data = this.loadLocal();
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
            return JSON.parse(json);
        } catch (e) {
            console.error('Failed to parse storage data', e);
            return defaultData;
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
                    this.data = remoteData;
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

    async addLog(log: Omit<WorkoutSet, 'id' | 'date'>): Promise<WorkoutSet> {
        const newLog: WorkoutSet = {
            ...log,
            id: Date.now().toString(),
            date: new Date().toISOString()
        };
        this.data.logs.push(newLog);
        await this.persist();
        return newLog;
    }

    async deleteLog(id: string): Promise<void> {
        this.data.logs = this.data.logs.filter(l => l.id !== id);
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
