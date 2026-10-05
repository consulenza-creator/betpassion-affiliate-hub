import { api } from "./api";
import type { AdminPartner, AdminUser, UserRole } from "../types";

export function fetchAdminPartners(): Promise<AdminPartner[]> {
  return api.get<AdminPartner[]>("/admin/partners");
}

export function fetchAdminUsers(): Promise<AdminUser[]> {
  return api.get<AdminUser[]>("/admin/users");
}

export function createAdminUser(data: {
  name: string;
  email: string;
  role: UserRole;
  partnerIds: string[];
}): Promise<{ user: AdminUser; temporaryPassword: string }> {
  return api.post("/admin/users", data);
}

export function updateAdminUser(
  id: string,
  data: { role?: UserRole; active?: boolean; partnerIds?: string[] },
): Promise<AdminUser> {
  return api.patch(`/admin/users/${id}`, data);
}

export function resetAdminUserPassword(id: string): Promise<{ temporaryPassword: string }> {
  return api.post(`/admin/users/${id}/reset-password`);
}
