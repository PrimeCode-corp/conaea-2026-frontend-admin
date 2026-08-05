import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/authService';
import type { JwtPayload, AuthTokens } from '@/types/auth.types';

let refreshTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Refresco en curso, compartido por todos los que pueden pedirlo a la vez: el
 * interceptor de axios, el temporizador proactivo, el init al volver a la
 * pestaña y la descarga de la exportación.
 *
 * Sin esto, dos refrescos en paralelo mandan el **mismo** refresh token; si el
 * backend lo rota e invalida el anterior, el segundo recibe un 401 y cerraba
 * una sesión que estaba perfectamente viva. Era la causa de que la sesión se
 * cayera sola durante procesos largos (el sondeo de la exportación, por
 * ejemplo), donde coinciden varias peticiones con el token venciendo.
 */
let refreshInFlight: Promise<boolean> | null = null;

/**
 * ¿El fallo del refresh es definitivo? Solo cerramos sesión cuando el backend
 * rechaza el token (4xx). Un corte de red o un 5xx es transitorio: conservamos
 * la sesión y se reintenta en la siguiente petición.
 */
const isDefinitiveAuthFailure = (err: unknown) => {
  const status = (err as { response?: { status?: number } })?.response?.status;
  return typeof status === 'number' && status >= 400 && status < 500;
};

const scheduleTokenRefresh = (
  access: string,
  refreshTokenFn: () => Promise<boolean>,
) => {
  try {
    const { exp } = JSON.parse(atob(access.split('.')[1]));

    const now = Date.now() / 1000;
    const timeLeft = exp - now;
    const OFFSET = 30; // segundos

    // 🔥 refrescar 30s antes (o la mitad si es corto)
    const refreshTime = timeLeft > OFFSET ? timeLeft - OFFSET : timeLeft * 0.5;

    if (refreshTimeout) clearTimeout(refreshTimeout);

    refreshTimeout = setTimeout(
      async () => {
        const success = await refreshTokenFn();

        if (success) {
          const newAccess = useAuthStore.getState().authTokens?.access;
          if (newAccess) {
            scheduleTokenRefresh(newAccess, refreshTokenFn);
          }
        }
      },
      Math.max(0, refreshTime) * 1000,
    );
  } catch (err) {
    console.error('Error scheduling refresh', err);
  }
};

interface AuthState {
  user: JwtPayload | null;
  authTokens: AuthTokens | null;
  isLoading: boolean;

  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  isAuthenticated: () => boolean;
  /** Rearma el refresco proactivo (tras recargar la página, por ejemplo). */
  ensureRefreshScheduled: () => void;

  setAuth: (tokens: AuthTokens, user: JwtPayload) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      authTokens: null,
      isLoading: false,

      setAuth: (tokens, user) => {
        set({ authTokens: tokens, user });
      },

      login: async (username, password) => {
        set({ isLoading: true });

        try {
          const { tokens, user } = await authService.login(username, password);

          set({ authTokens: tokens, user, isLoading: false });

          // 🔥 iniciar auto refresh
          scheduleTokenRefresh(tokens.access, get().refreshToken);

          return true;
        } catch {
          set({ isLoading: false });
          return false;
        }
      },

      logout: () => {
        if (refreshTimeout) clearTimeout(refreshTimeout);
        set({ authTokens: null, user: null });
      },

      refreshToken: async () => {
        // Si ya hay uno en vuelo, todos esperan ese mismo intento.
        if (refreshInFlight) return refreshInFlight;

        const { authTokens, setAuth } = get();

        if (!authTokens?.refresh) {
          get().logout();
          return false;
        }

        refreshInFlight = (async () => {
          try {
            const { tokens, user } = await authService.refreshToken(
              authTokens.refresh,
            );

            setAuth(tokens, user);

            // 🔁 reprogramar refresh
            scheduleTokenRefresh(tokens.access, get().refreshToken);

            return true;
          } catch (err) {
            if (isDefinitiveAuthFailure(err)) {
              get().logout();
            }
            // Fallo transitorio: mantenemos la sesión y se reintenta luego.
            return false;
          } finally {
            refreshInFlight = null;
          }
        })();

        return refreshInFlight;
      },

      ensureRefreshScheduled: () => {
        const { authTokens } = get();
        if (!authTokens?.access) return;
        scheduleTokenRefresh(authTokens.access, get().refreshToken);
      },

      isAuthenticated: () => {
        const { authTokens } = get();

        if (!authTokens?.access) return false;

        // Un access vencido no cierra la sesión: mientras el refresh siga
        // vivo, la próxima petición lo renueva sola. Antes bastaba con que el
        // access expirara para que las rutas privadas mandaran al login.
        return (
          authService.isTokenValid(authTokens.access) ||
          authService.isTokenValid(authTokens.refresh)
        );
      },
    }),
    {
      name: 'auth',
      partialize: (state) => ({
        authTokens: state.authTokens,
        user: state.user,
      }),
    },
  ),
);
