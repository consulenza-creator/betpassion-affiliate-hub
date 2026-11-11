import { api } from "./api";
import type { AccessLogItem, AccessSelection, AdminNetworkOptions, AdminUser, FeedStatus, UserRole } from "../types";

export function fetchNetworkOptions(): Promise<AdminNetworkOptions> {
  return api.get<AdminNetworkOptions>("/admin/network-options");
}

export function fetchAdminUsers(): Promise<AdminUser[]> {
  return api.get<AdminUser[]>("/admin/users");
}

export function createAdminUser(data: {
  name: string;
  email: string;
  role: UserRole;
  parentAffiliateId?: string | null;
} & AccessSelection): Promise<{ user: AdminUser; temporaryPassword: string }> {
  return api.post("/admin/users", data);
}

export function updateAdminUser(
  id: string,
  data: { role?: UserRole; active?: boolean; parentAffiliateId?: string | null } & Partial<AccessSelection>,
): Promise<AdminUser> {
  return api.patch(`/admin/users/${id}`, data);
}

export function resetAdminUserPassword(id: string): Promise<{ temporaryPassword: string }> {
  return api.post(`/admin/users/${id}/reset-password`);
}

export function fetchFeedStatus(): Promise<FeedStatus> {
  return api.get<FeedStatus>("/admin/feed-status");
}

export function fetchAccessLog(): Promise<AccessLogItem[]> {
  return api.get<AccessLogItem[]>("/admin/access-log");
}
