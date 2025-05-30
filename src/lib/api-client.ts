import Axios, { InternalAxiosRequestConfig } from 'axios';

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
  baseURL: "https://167.71.17.59",
});

api.interceptors.request.use(authRequestInterceptor);
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status !== 401 || error.response?.data?.message) {
      const message = error.response?.data?.message || error.message;
      console.log(message);
    }
    return Promise.reject(error);
  },
);    