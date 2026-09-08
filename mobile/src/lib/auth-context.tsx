import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchMe, verifyOtp, type MobileUser } from "./api";
import { clearToken, loadToken, saveToken } from "./storage";
import { initPurchases } from "./purchases";

type AuthState = {
  ready: boolean;
  token: string | null;
  user: MobileUser | null;
  credits: number;
  login: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setCredits: (n: number) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<MobileUser | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await loadToken();
        if (saved) {
          const { user } = await fetchMe(saved);
          setTokenState(saved);
          setUser(user);
          initPurchases(user.id).catch(() => {});
        }
      } catch {
        await clearToken();
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const login = useCallback(async (phone: string, code: string) => {
    const { token, user } = await verifyOtp(phone, code);
    await saveToken(token);
    setTokenState(token);
    setUser(user);
    initPurchases(user.id).catch(() => {});
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!token) return;
    const { user } = await fetchMe(token);
    setUser(user);
  }, [token]);

  const setCredits = useCallback((n: number) => {
    setUser((u) => (u ? { ...u, credits: n } : u));
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      ready,
      token,
      user,
      credits: user?.credits ?? 0,
      login,
      logout,
      refresh,
      setCredits,
    }),
    [ready, token, user, login, logout, refresh, setCredits]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
