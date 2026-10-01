import { api } from "./api";
import type { AffiliateLinkItem } from "../types";

export function fetchLinks(): Promise<AffiliateLinkItem[]> {
  return api.get<AffiliateLinkItem[]>("/links");
}

export function createLink(campaignName: string, targetUrl: string): Promise<AffiliateLinkItem> {
  return api.post<AffiliateLinkItem>("/links", { campaignName, targetUrl });
}
