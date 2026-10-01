export type UserRole =
  | "super_admin"
  | "affiliate_manager"
  | "master_affiliate"
  | "affiliate_standard";

export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  avatarInitials: string;
}

export type CommissionType = "cpa" | "revshare" | "hybrid" | "manual_bonus" | "network_override";

export interface CommissionEntry {
  id: string;
  affiliateName: string;
  type: CommissionType;
  amount: number;
  currency: "EUR";
  date: string;
  status: "pending" | "approved" | "paid" | "rejected";
}

export interface KpiCard {
  id: string;
  label: string;
  value: string;
  deltaPct: number;
  trend: "up" | "down" | "flat";
}

export interface PerformancePoint {
  period: string;
  clicks: number;
  commission: number;
}

export interface TopLink {
  id: string;
  name: string;
  clicks: number;
}

export interface DashboardSummary {
  kpis: KpiCard[];
  performanceSeries: PerformancePoint[];
  topLinks: TopLink[];
  latestCommissions: CommissionEntry[];
}

export interface CommissionRecord {
  id: string;
  type: CommissionType;
  amount: string;
  currency: string;
  status: "pending" | "approved" | "paid" | "rejected";
  createdAt: string;
}

export interface AffiliateLinkItem {
  id: string;
  slug: string;
  campaignName: string;
  targetUrl: string;
  active: boolean;
  createdAt: string;
  shortUrl: string;
  clickCount: number;
}

export type AssetType = "banner" | "landing_page" | "video" | "logo" | "social_creative";

export interface MediaAsset {
  id: string;
  title: string;
  type: AssetType;
  format: string; // es. "300x250", "MP4", "1080x1080"
  language: "it" | "en";
  thumbnailColor: string; // placeholder colore per anteprima mock
  updatedAt: string;
  tags: string[];
}
