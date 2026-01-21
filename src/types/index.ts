export interface WorkoutType {
    id: string;
    name: string;
}

export interface WorkoutSet {
    id: string;
    workoutTypeId: string;
    reps: number;
    weight: number;
    date: string; // ISO string
}

export interface AppData {
    workoutTypes: WorkoutType[];
    logs: WorkoutSet[];
}
