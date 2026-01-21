import { AppData, WorkoutType, WorkoutSet } from '../types';

const STORAGE_KEY = 'gym_twa_data';

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

    constructor() {
        this.data = this.load();
    }

    private load(): AppData {
        const json = localStorage.getItem(STORAGE_KEY);
        if (!json) return defaultData;
        try {
            return JSON.parse(json);
        } catch (e) {
            console.error('Failed to parse storage data', e);
            return defaultData;
        }
    }

    private save(): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }

    getWorkoutTypes(): WorkoutType[] {
        return this.data.workoutTypes;
    }

    addWorkoutType(name: string): WorkoutType {
        const newType: WorkoutType = {
            id: Date.now().toString(),
            name
        };
        this.data.workoutTypes.push(newType);
        this.save();
        return newType;
    }

    deleteWorkoutType(id: string): void {
        this.data.workoutTypes = this.data.workoutTypes.filter(t => t.id !== id);
        // Also cleanup logs if needed, but maybe keep them
        this.save();
    }

    getLogs(): WorkoutSet[] {
        return this.data.logs;
    }

    addLog(log: Omit<WorkoutSet, 'id' | 'date'>): WorkoutSet {
        const newLog: WorkoutSet = {
            ...log,
            id: Date.now().toString(),
            date: new Date().toISOString()
        };
        this.data.logs.push(newLog);
        this.save();
        return newLog;
    }

    deleteLog(id: string): void {
        this.data.logs = this.data.logs.filter(l => l.id !== id);
        this.save();
    }
}

export const storage = new StorageService();
