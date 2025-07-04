import Axios, { InternalAxiosRequestConfig } from 'axios';
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


export const api = Axios.create({
  baseURL: env.API_URL,
});

api.interceptors.request.use(authRequestInterceptor);
api.interceptors.response.use(
  (response) => {
    console.log(response);
    return response.data;
  },
  (error) => {
    if (error.response?.status !== 401 || error.response?.data?.message) {
      const message = error.response?.data?.message || error.message;
    }
    return Promise.reject(error);
  },
);    