export const STORAGE_KEYS = {
  SAVE_FILE: 'game_save_file',
  HERO_INSTANCES: 'hero_instances',
  EQUIPMENTS: 'equipments',
  INSCRIPTIONS: 'inscriptions',
  LINEUPS: 'lineups',
  CURRENT_LINEUP_ID: 'current_lineup_id',
  LEVEL_PROGRESS: 'level_progress',
  ACHIEVEMENTS: 'achievements',
  BATTLE_LOGS: 'battle_logs',
  SETTINGS: 'game_settings',
  TUTORIAL_STEP: 'tutorial_step',
  DAILY_SIGN_IN: 'daily_sign_in',
  CURRENCY: 'currency',
  PLAYER_INFO: 'player_info',
  AUTH_TOKEN: 'auth_token',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

const DB_NAME = 'GameStorageDB';
const DB_VERSION = 1;
const STORE_NAME = 'gameData';

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function saveToIndexedDB(key: string, data: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data, key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function loadFromIndexedDB<T>(key: string): Promise<T | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve((request.result as T) || null);
  });
}

async function deleteFromIndexedDB(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

function saveToLocalStorage(key: string, data: unknown): void {
  try {
    const serialized = typeof data === 'string' ? data : JSON.stringify(data);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error('localStorage save error:', error);
    throw error;
  }
}

function loadFromLocalStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error('localStorage load error:', error);
    return null;
  }
}

function deleteFromLocalStorage(key: string): void {
  localStorage.removeItem(key);
}

export async function saveToStorage(
  key: StorageKey | string,
  data: unknown,
  useDB: boolean = false
): Promise<void> {
  if (useDB) {
    try {
      await saveToIndexedDB(key, data);
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error);
      saveToLocalStorage(key, data);
    }
  } else {
    saveToLocalStorage(key, data);
  }
}

export async function loadFromStorage<T>(
  key: StorageKey | string,
  useDB: boolean = false
): Promise<T | null> {
  if (useDB) {
    try {
      return await loadFromIndexedDB<T>(key);
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error);
      return loadFromLocalStorage<T>(key);
    }
  }
  return loadFromLocalStorage<T>(key);
}

export async function deleteFromStorage(
  key: StorageKey | string,
  useDB: boolean = false
): Promise<void> {
  if (useDB) {
    try {
      await deleteFromIndexedDB(key);
    } catch (error) {
      console.warn('IndexedDB delete failed, falling back to localStorage:', error);
      deleteFromLocalStorage(key);
    }
  }
  deleteFromLocalStorage(key);
}

export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random1 = Math.random().toString(36).substring(2, 10);
  const random2 = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random1}-${random2}`;
}
