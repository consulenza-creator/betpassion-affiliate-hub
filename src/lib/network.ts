import { api } from "./api";
import type { AffiliateNetworkSummary, ReferredPlayerItem } from "../types";

export function fetchMyReferredPlayers(): Promise<ReferredPlayerItem[]> {
  return api.get<ReferredPlayerItem[]>("/referred-players/mine");
}

export function fetchNetworkOverview(): Promise<AffiliateNetworkSummary[]> {
  return api.get<AffiliateNetworkSummary[]>("/referred-players/network-overview");
}

export function fetchAffiliateDetail(affiliateId: string): Promise<ReferredPlayerItem[]> {
  return api.get<ReferredPlayerItem[]>(`/referred-players/by-affiliate/${affiliateId}`);
}
