const STATE_STORAGE_PREFIX = 'integration_state:';
const DEFAULT_EXPIRY_MS = 60 * 60 * 1000;

export type StoredOAuthSession = {
  type: string;
  state: string;
  existingIntegrationId: string | null;
  timestamp: number;
};

const isBrowser = typeof window !== 'undefined';

const getStore = (): Storage | null => {
  if (!isBrowser) {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch (error) {
    console.warn('OAuth session storage unavailable', error);
    return null;
  }
};

const buildKey = (type: string) => `${STATE_STORAGE_PREFIX}${type}`;

export const persistOAuthSession = (session: {
  type: string;
  state: string;
  existingIntegrationId?: string | null;
}) => {
  const store = getStore();
  if (!store) {
    return;
  }

  const payload: StoredOAuthSession = {
    type: session.type,
    state: session.state,
    existingIntegrationId: session.existingIntegrationId ?? null,
    timestamp: Date.now(),
  };

  try {
    store.setItem(buildKey(session.type), JSON.stringify(payload));
  } catch (error) {
    console.warn('Unable to persist OAuth session state', error);
  }
};

export const readOAuthSession = (type: string): StoredOAuthSession | null => {
  const store = getStore();
  if (!store) {
    return null;
  }

  const raw = store.getItem(buildKey(type));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredOAuthSession;
  } catch (error) {
    console.warn('Failed to parse stored OAuth session', error);
    store.removeItem(buildKey(type));
    return null;
  }
};

export const clearOAuthSession = (type: string) => {
  const store = getStore();
  if (!store) {
    return;
  }

  try {
    store.removeItem(buildKey(type));
  } catch (error) {
    console.warn('Failed to clear OAuth session', error);
  }
};

export const cleanupExpiredOAuthSessions = (maxAgeMs: number = DEFAULT_EXPIRY_MS) => {
  const store = getStore();
  if (!store) {
    return;
  }

  const now = Date.now();
  const keys: string[] = [];

  for (let index = 0; index < store.length; index += 1) {
    const key = store.key(index);
    if (key && key.startsWith(STATE_STORAGE_PREFIX)) {
      keys.push(key);
    }
  }

  keys.forEach((key) => {
    const raw = store.getItem(key);
    if (!raw) {
      return;
    }

    try {
      const payload = JSON.parse(raw) as StoredOAuthSession;
      if (payload.timestamp && now - payload.timestamp > maxAgeMs) {
        store.removeItem(key);
      }
    } catch {
      store.removeItem(key);
    }
  });
};

export const listOAuthSessionTypes = (): string[] => {
  const store = getStore();
  if (!store) {
    return [];
  }

  const types: string[] = [];
  for (let index = 0; index < store.length; index += 1) {
    const key = store.key(index);
    if (key && key.startsWith(STATE_STORAGE_PREFIX)) {
      types.push(key.replace(STATE_STORAGE_PREFIX, ''));
    }
  }

  return types;
};
