const KEY = "trackr_access_token";

export const auth = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(KEY);
  },
  setToken(token: string) {
    localStorage.setItem(KEY, token);
  },
  clearToken() {
    localStorage.removeItem(KEY);
  },
};
