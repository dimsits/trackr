const KEY = "trackr_access_token";

export const auth = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(KEY);
  },

  setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, token);
  },

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(KEY);
  },

  logout(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(KEY);
  },
};
