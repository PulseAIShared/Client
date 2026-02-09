import Axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';

let accessToken: string | null = null;

export const setToken = (token: string | null): void => {
  accessToken = token;
};

export const getToken = (): string | null => {
  return accessToken;
};

export const clearToken = (): void => {
  accessToken = null;
};

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json';
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  config.withCredentials = true;
  return config;
}

// Mutex for token refresh: prevents multiple concurrent refresh attempts
let isRefreshing = false;
let refreshSubscribers: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(({ resolve }) => resolve(token));
  refreshSubscribers = [];
}

function onRefreshFailed(error: unknown) {
  refreshSubscribers.forEach(({ reject }) => reject(error));
  refreshSubscribers = [];
}

function addRefreshSubscriber(
  resolve: (token: string) => void,
  reject: (error: unknown) => void,
) {
  refreshSubscribers.push({ resolve, reject });
}

export const api = Axios.create({
  baseURL: env.API_URL,
});

api.interceptors.request.use(authRequestInterceptor);
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh on 401 errors for non-auth/me requests
    // that haven't already been retried
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/me') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Another refresh is in progress - queue this request
        return new Promise((resolve, reject) => {
          addRefreshSubscriber(
            (newToken: string) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              originalRequest._retry = true;
              resolve(api(originalRequest));
            },
            reject,
          );
        });
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        // Call /auth/me which uses the refresh token cookie to get
        // a new access token (and rotates the refresh token)
        const response = await Axios.get(`${env.API_URL}/auth/me`, {
          withCredentials: true,
        });

        const newToken = response.data?.token;
        if (newToken) {
          setToken(newToken);
          onTokenRefreshed(newToken);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }

        // No token in response means user was already authenticated
        // but something else went wrong - don't retry
        return Promise.reject(error);
      } catch (refreshError) {
        // Refresh failed - clear token, reject queued requests
        clearToken();
        onRefreshFailed(refreshError);

        // Only redirect if not already on an auth page to prevent loops
        const path = window.location.pathname;
        if (
          !path.startsWith('/login') &&
          !path.startsWith('/register')
        ) {
          window.location.href = '/login?sessionExpired=true';
        }
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
