import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  setTokens: (
    accessToken: string,
    refreshToken: string,
    tokenExpiry: number,
  ) => void;
  clearTokens: () => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      tokenExpiry: null,
      setTokens: (accessToken, refreshToken, tokenExpiry) =>
        set({ accessToken, refreshToken, tokenExpiry }),
      clearTokens: () => {
        set({ accessToken: null, refreshToken: null, tokenExpiry: null });
        // localStorage에서 직접 삭제하여 확실하게 제거
        localStorage.removeItem("auth-storage");
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
