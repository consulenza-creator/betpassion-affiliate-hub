import { api, API_BASE_URL } from "./api";
import type { AffiliateLinkItem, ConversionPlayer, LinkStats, QrStyle, ReferralOptions } from "../types";

export function fetchLinks(): Promise<AffiliateLinkItem[]> {
  return api.get<AffiliateLinkItem[]>("/links");
}

export function fetchLinkStats(id: string): Promise<LinkStats> {
  return api.get<LinkStats>(`/links/${id}/stats`);
}

export function fetchConversionPlayers(id: string, kind: "registrations" | "ftd"): Promise<ConversionPlayer[]> {
  return api.get<ConversionPlayer[]>(`/links/${id}/players?kind=${kind}`);
}

export function fetchReferralOptions(): Promise<ReferralOptions> {
  return api.get<ReferralOptions>("/links/referral-options");
}

export function createLink(data: {
  campaignName: string;
  targetUrl: string;
  referralCode?: string;
  slug?: string;
  qrStyle?: QrStyle;
}): Promise<AffiliateLinkItem> {
  return api.post<AffiliateLinkItem>("/links", data);
}

export function updateLink(
  id: string,
  data: Partial<{ campaignName: string; targetUrl: string; referralCode: string; slug: string; qrStyle: QrStyle; active: boolean }>,
): Promise<AffiliateLinkItem> {
  return api.patch<AffiliateLinkItem>(`/links/${id}`, data);
}

// Il QR e' generato dal backend e contiene solo il link breve
export function qrUrl(slug: string, ext: "png" | "svg", opts: { download?: boolean; style?: QrStyle } = {}): string {
  const params = new URLSearchParams();
  if (opts.download) params.set("download", "1");
  if (opts.style) params.set("style", opts.style);
  const q = params.toString();
  return `${API_BASE_URL}/qr/${encodeURIComponent(slug)}.${ext}${q ? `?${q}` : ""}`;
}
