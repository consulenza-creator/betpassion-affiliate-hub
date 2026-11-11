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
  mustChangePassword: boolean;
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
  deposits: number;
  ggr: number;
}

export interface TopLink {
  id: string;
  name: string;
  clicks: number;
}

export type DashboardPeriodId = "yesterday" | "last3" | "last7" | "currentMonth" | "previousMonth" | "last12m";

export interface DashboardPeriod {
  id: DashboardPeriodId;
  /** Ultimo giorno con dati (YYYY-MM-DD) */
  anchor: string;
  start: string;
  end: string;
  prevStart: string;
  prevEnd: string;
}

export interface DashboardSummary {
  period: DashboardPeriod;
  /** Data dell'ultima registrazione presente in anagrafica (puo' essere precedente ai movimenti) */
  playersUpTo: string | null;
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

export type PlayerLifecycleState =
  | "appena_registrato"
  | "non_convertito"
  | "solo_primo_deposito"
  | "nuovo"
  | "non_attivato"
  | "in_consolidamento"
  | "attivo"
  | "in_flessione"
  | "rischio_churn"
  | "dormiente"
  | "perso"
  | "riattivato"
  | "non_classificabile";

export interface ReferredPlayerItem {
  id: string;
  playerId: string;
  username: string | null;
  nickname: string | null;
  selfExcluded: boolean;
  closed: boolean;
  registeredAt: string | null;
  lifecycleState: PlayerLifecycleState;
  suppressed: boolean;
  totalDeposits: string;
  totalNgr: string;
  lastActivityAt: string | null;
}

export interface AffiliateNetworkSummary {
  partnerId: string;
  partnerName: string;
  totalPlayers: number;
  totalDeposits: number;
  totalNgr: number;
  byState: Partial<Record<PlayerLifecycleState, number>>;
}

export interface AdminPartner {
  id: string;
  name: string;
  playerCount: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  mustChangePassword: boolean;
  parentAffiliateId: string | null;
  createdAt: string;
  partners: { id: string; name: string }[];
  filiere: string[];
  agenti: string[];
  pvr: string[];
}

export interface NetworkOption {
  value: string;
  count: number;
  /** Solo per i PVR: agente di riferimento */
  agent?: string | null;
}

export interface AdminNetworkOptions {
  partners: AdminPartner[];
  filiere: NetworkOption[];
  agenti: NetworkOption[];
  pvr: NetworkOption[];
}

/** Perimetro assegnato a un account: i giocatori visibili sono quelli che rientrano in almeno una voce. */
export interface AccessSelection {
  partnerIds: string[];
  filiere: string[];
  agenti: string[];
  pvr: string[];
}

export type QrStyle = "standard" | "passion" | "high_contrast";

export interface ReferralOptions {
  partners: string[];
  pvr: string[];
}

export interface AffiliateLinkItem {
  id: string;
  slug: string;
  campaignName: string;
  targetUrl: string;
  referralCode: string | null;
  qrStyle: QrStyle;
  active: boolean;
  createdAt: string;
  shortUrl: string;
  /** Click validi: bot, anteprime di link e doppi click esclusi */
  clickCount: number;
  uniqueVisitors: number;
  clicks7d: number;
}

export type DealType = "cpa" | "revshare" | "hybrid";

export interface DealItem {
  id: string;
  code: string;
  type: DealType;
  cpaAmount: string | null;
  revSharePct: string | null;
  validFrom: string;
  validTo: string | null;
  notes: string | null;
}

export interface DealInput {
  code: string;
  type: DealType;
  cpaAmount: number | null;
  revSharePct: number | null;
  validFrom: string;
  validTo: string | null;
  notes: string | null;
}

export interface StatementRow {
  code: string;
  dealId: string;
  type: DealType;
  cpaAmount: number | null;
  revSharePct: number | null;
  ftd: number;
  deposits: number;
  ggr: number;
  bonus: number;
  ngr: number;
  negativeBase: boolean;
  cpa: number;
  revshare: number;
  total: number;
  paymentStatus: string;
  note: string | null;
}

export interface Statement {
  month: string;
  dataUpTo: string | null;
  partial: boolean;
  totals: { ftd: number; cpa: number; revshare: number; total: number };
  rows: StatementRow[];
}

export interface ConversionPlayer {
  id: string;
  username: string | null;
  nickname: string | null;
  registeredAt: string | null;
  firstDepositAt: string | null;
  selfExcluded: boolean;
  closed: boolean;
}

export interface LinkConversion {
  code: string;
  days: number;
  clicks: number;
  registrations: number;
  ftd: number;
  registrationRate: number | null;
  ftdRate: number | null;
}

export interface LinkStats {
  conversion: LinkConversion | null;
  totals: { clicks: number; unique: number; botsFiltered: number; duplicatesFiltered: number };
  daily: { day: string; clicks: number; unique: number }[];
  byDevice: { key: string; count: number }[];
  byBrowser: { key: string; count: number }[];
  byOs: { key: string; count: number }[];
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

export interface FeedImportItem {
  id: string;
  kind: "players" | "movements" | string;
  sourceFile: string;
  referenceDate: string | null;
  rowsRead: number;
  rowsWritten: number;
  status: string;
  note: string | null;
  importedAt: string;
}

export interface FeedStatus {
  imports: FeedImportItem[];
  current: {
    players: number;
    movements: number;
    movementsFrom: string | null;
    movementsTo: string | null;
    playersUpTo: string | null;
    selfExcluded: number;
    closed: number;
  };
}

export interface AccessLogItem {
  id: string;
  userEmail: string;
  partnerName: string;
  createdAt: string;
}
