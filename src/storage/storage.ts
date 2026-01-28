import { AppData, WorkoutType, WorkoutSet } from '../types';

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

export class StorageService {
    private data: AppData;
    private onUpdateCallback?: () => void;

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
            }
        } catch (e) {
            console.error('Failed to sync from server', e);
        }
    }

    private async saveToServer() {
        try {
            await fetch(SERVER_URL, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(this.data)
            });
        } catch (e) {
            console.error('Failed to save to server', e);
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
}

export const storage = new StorageService();
