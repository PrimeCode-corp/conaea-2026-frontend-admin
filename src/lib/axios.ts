import axios, { type AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =========================
// REQUEST
// =========================
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().authTokens?.access;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// =========================
// RESPONSE
// =========================

/**
 * Ante un 401 delegamos el refresco en el store, que lo serializa: varias
 * peticiones que fallan a la vez esperan el mismo intento en lugar de disparar
 * uno cada una. Antes el interceptor refrescaba por su cuenta, en paralelo con
 * el temporizador proactivo y con el resto de la app; si el backend rota el
 * refresh token, el segundo intento llegaba con uno ya invalidado y cerraba la
 * sesión sin motivo.
 *
 * Tampoco forzamos aquí la redirección al login: si el fallo es definitivo el
 * store cierra sesión y las rutas privadas se encargan de sacar al usuario.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // evitar loop infinito
    if (!original || original.url?.includes('token/refresh/')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refreshed = await useAuthStore.getState().refreshToken();
      if (!refreshed) return Promise.reject(error);

      const access = useAuthStore.getState().authTokens?.access;
      if (!access) return Promise.reject(error);

      original.headers!.Authorization = `Bearer ${access}`;
      return api(original);
    }

    return Promise.reject(error);
  },
);

export default api;
