import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/authService';

export const useAuthInit = () => {
  useEffect(() => {
    const initAuth = async () => {
      const { authTokens, refreshToken, ensureRefreshScheduled } =
        useAuthStore.getState();

      if (!authTokens) return;

      // ✅ si el access sigue válido → solo nos aseguramos de que el refresco
      // proactivo esté armado. Tras recargar la página no lo estaba, y el
      // token vencía sin que nadie lo renovara hasta el siguiente 401.
      if (authService.isTokenValid(authTokens.access)) {
        ensureRefreshScheduled();
        return;
      }

      // 🔄 si expiró → intentar refresh. El store ya cierra sesión por su
      // cuenta si el rechazo es definitivo; un fallo de red no debe sacarnos.
      await refreshToken();
    };

    initAuth();

    // 🔥 detectar cuando el usuario vuelve a la pestaña
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        initAuth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};
