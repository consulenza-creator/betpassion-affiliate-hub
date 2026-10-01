import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { CurrentUser } from "../types";
import { api, setToken, clearToken, getToken, ApiError } from "../lib/api";

interface LoginResponse {
  accessToken: string;
  user: { id: string; name: string; email: string; role: CurrentUser["role"] };
}

interface AuthContextValue {
  currentUser: CurrentUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Al primo caricamento, se c'e' gia' un token salvato prova a ripristinare la
  // sessione chiamando /auth/me, cosi' l'utente non deve rifare login ad ogni refresh.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<LoginResponse["user"] | null>("/auth/me")
      .then((user) => {
        if (user) {
          setCurrentUser({ id: user.id, name: user.name, role: user.role, avatarInitials: initialsFromName(user.name) });
        } else {
          clearToken();
        }
      })
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const data = await api.post<LoginResponse>("/auth/login", { email, password });
    setToken(data.accessToken);
    setCurrentUser({
      id: data.user.id,
      name: data.user.name,
      role: data.user.role,
      avatarInitials: initialsFromName(data.user.name),
    });
  }

  function logout() {
    clearToken();
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve essere usato dentro AuthProvider");
  return ctx;
}

export { ApiError };

export const ROLE_LABELS: Record<CurrentUser["role"], string> = {
  super_admin: "Super Admin",
  affiliate_manager: "Affiliate Manager",
  master_affiliate: "Master Affiliate",
  affiliate_standard: "Affiliate Standard",
};
