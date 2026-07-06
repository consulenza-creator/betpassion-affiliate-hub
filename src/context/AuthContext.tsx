import { createContext, useContext, useState, ReactNode } from "react";
import type { CurrentUser, UserRole } from "../types";

const MOCK_USERS: Record<UserRole, CurrentUser> = {
  super_admin: { id: "u1", name: "Valerio Conti", role: "super_admin", avatarInitials: "VC" },
  affiliate_manager: { id: "u2", name: "Giulia Bianchi", role: "affiliate_manager", avatarInitials: "GB" },
  master_affiliate: { id: "u3", name: "Marco Russo", role: "master_affiliate", avatarInitials: "MR" },
  affiliate_standard: { id: "u4", name: "Anna Ferrari", role: "affiliate_standard", avatarInitials: "AF" },
};

interface AuthContextValue {
  currentUser: CurrentUser;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("affiliate_standard");

  const setRole = (newRole: UserRole) => setRoleState(newRole);

  return (
    <AuthContext.Provider value={{ currentUser: MOCK_USERS[role], setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve essere usato dentro AuthProvider");
  return ctx;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  affiliate_manager: "Affiliate Manager",
  master_affiliate: "Master Affiliate",
  affiliate_standard: "Affiliate Standard",
};
