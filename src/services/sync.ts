import { db } from '../db';
import { AppData, SyncItem } from '../types';
import { getAuthString } from '../auth';
import { Table } from 'dexie';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WEBAPP = (window as any).Telegram?.WebApp;

const SERVER_URL = 'https://functions.yandexcloud.net/d4ehnqvq3a8fo55t7tj4';

export class SyncService {
    private static getHeaders() {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (WEBAPP?.initData) {
            const skipTmaAuth = localStorage.getItem('skip_tma_auth') === 'true';
            if (!skipTmaAuth) {
                headers['X-Telegram-Init-Data'] = WEBAPP.initData;
            }
        } else {
            const webAuth = getAuthString();
            if (webAuth) {
                headers['X-Telegram-Init-Data'] = webAuth;
            }
        }
        return headers;
    }

    static async sync() {
        if (!navigator.onLine) {
            throw new Error('Offline');
        }

        const headers = this.getHeaders();
        // 1. Fetch remote data
        const response = await fetch(SERVER_URL, { headers });
        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized');
            throw new Error('Sync failed');
        }
        const remoteData: AppData = await response.json();

        // 2. Merge Data
        await this.mergeData(remoteData);

        // 3. Push merged data back
        const localData = await this.readAll();

        await fetch(SERVER_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(localData)
        });
    }

    private static async mergeData(remote: AppData) {
        await db.transaction('rw', db.workouts, db.logs, db.workoutTypes, db.profile, async () => {
            await this.mergeTable(db.workouts, remote.workouts);
            await this.mergeTable(db.logs, remote.logs);
            await this.mergeTable(db.workoutTypes, remote.workoutTypes);
            if (remote.profile) {
                // Profile needs an ID for DB storage
                // Cast to any or define a type that includes ID
                const profileWithId = { ...remote.profile, id: 'me' };
                await this.mergeTable(db.profile, [profileWithId]);
            }
        });
    }

    private static async mergeTable<T extends SyncItem & { id: string }>(table: Table<T, string>, remoteItems: T[] = []) {
        const localItems = await table.toArray();
        const localMap = new Map(localItems.map((i) => [i.id, i]));

        // Iterate remote items: Insert or Update local
        for (const remoteItem of remoteItems) {
            const localItem = localMap.get(remoteItem.id);
            if (!localItem) {
                // New from server
                await table.put(remoteItem);
            } else {
                // Conflict resolution: Last Write Wins
                const remoteDate = new Date(remoteItem.updatedAt).getTime();
                const localDate = new Date(localItem.updatedAt).getTime();

                if (remoteDate > localDate) {
                    await table.put(remoteItem);
                }
            }
        }
    }

    static async readAll(): Promise<AppData> {
        return {
            workouts: await db.workouts.toArray(),
            logs: await db.logs.toArray(),
            workoutTypes: await db.workoutTypes.toArray(),
            profile: (await db.profile.toArray())[0]
        };
    }
}
