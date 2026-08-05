import api from '@/lib/axios';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import type { JwtPayload, AuthTokens } from '@/types/auth.types';

const BASE_URL = import.meta.env.VITE_API_URL;

export const authService = {
  login: async (username: string, password: string) => {
    const { data } = await api.post('/token/', { username, password });

    const user = jwtDecode<JwtPayload>(data.access);

    return {
      tokens: data as AuthTokens,
      user,
    };
  },

  refreshToken: async (refresh: string) => {
    const { data } = await axios.post(`${BASE_URL}token/refresh/`, {
      refresh,
    });

    const user = jwtDecode<JwtPayload>(data.access);

    return {
      tokens: {
        access: data.access,
        refresh: data.refresh ?? refresh,
      },
      user,
    };
  },

  isTokenValid: (access: string): boolean => {
    try {
      const { exp } = jwtDecode<JwtPayload>(access);
      return Date.now() < exp * 1000;
    } catch {
      return false;
    }
  },

  changePassword: async (current_password: string, new_password: string) => {
    const { data } = await api.post('/security/change-password/', {
      current_password,
      new_password,
    });
    return data;
  },
};
