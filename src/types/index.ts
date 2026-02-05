export type WorkoutStatus = 'active' | 'paused' | 'finished';

export interface WorkoutSession {
    id: string;
    startTime: string; // ISO
    endTime?: string; // ISO
    name?: string;
    status: WorkoutStatus;
    isManual: boolean; // Created via Start button
    pauseIntervals: { start: string; end?: string }[];
}

export interface WorkoutType {
    id: string;
    name: string;
}

export interface WorkoutSet {
    id: string;
    workoutTypeId: string;
    workoutId: string; // Linked to WorkoutSession
    reps: number;
    weight: number;
    date: string; // ISO string
}

export interface UserProfile {
    isPublic: boolean;
    showFullHistory?: boolean;
    displayName?: string;
    photoUrl?: string;
    telegramUsername?: string;
    telegramUserId: number;
    createdAt: string;
}

export interface PublicProfileData {
    displayName: string;
    photoUrl?: string;
    identifier: string; // username или id_123456
    stats: {
        totalWorkouts: number;
        totalVolume: number;
        favoriteExercise?: string;
        lastWorkoutDate?: string;
    };
    recentActivity: {
        date: string;
        exerciseCount: number;
    }[];
    logs?: WorkoutSet[];
    workoutTypes?: WorkoutType[];
}

export interface AppData {
    workoutTypes: WorkoutType[];
    logs: WorkoutSet[];
    workouts: WorkoutSession[];
    profile?: UserProfile;
}
