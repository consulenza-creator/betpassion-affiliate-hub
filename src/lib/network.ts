import { api } from "./api";
import type { AffiliateNetworkSummary, ReferredPlayerItem } from "../types";

// Il backend restringe automaticamente i risultati ai partner assegnati all'account
// (Super Admin e Affiliate Manager vedono tutti i partner).
export function fetchNetworkOverview(): Promise<AffiliateNetworkSummary[]> {
  return api.get<AffiliateNetworkSummary[]>("/referred-players/network-overview");
}

export function fetchPartnerPlayers(partnerId: string): Promise<ReferredPlayerItem[]> {
  return api.get<ReferredPlayerItem[]>(`/referred-players/by-partner/${partnerId}`);
}
