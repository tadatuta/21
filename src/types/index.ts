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

export interface UserProfile {
    isPublic: boolean;
    displayName?: string;
    telegramUsername?: string;
    telegramUserId: number;
    createdAt: string;
}

export interface PublicProfileData {
    displayName: string;
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
}

export interface AppData {
    workoutTypes: WorkoutType[];
    logs: WorkoutSet[];
    profile?: UserProfile;
}
