export interface TelegramLoginData {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
}

const AUTH_KEY = 'gym_web_auth';

export function getAuthData(): TelegramLoginData | null {
    const json = localStorage.getItem(AUTH_KEY);
    try {
        return json ? JSON.parse(json) : null;
    } catch {
        return null;
    }
}

export function saveAuthData(user: TelegramLoginData) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function clearAuthData() {
    localStorage.removeItem(AUTH_KEY);
}

export function getAuthString(): string | null {
    const data = getAuthData();
    if (!data) return null;

    // Construct string similar to initData for backend validation
    // Login Widget (flat) data needs to be passed exactly as received for some parts, 
    // but the backend handles flat data validation if we pass params.
    // We'll mimic URLSearchParams format

    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.append(key, String(value));
        }
    });
    return params.toString();
}
