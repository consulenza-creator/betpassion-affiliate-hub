import { api } from "./api";
import type { DealInput, DealItem, Statement } from "../types";

export function fetchDeals(): Promise<DealItem[]> {
  return api.get<DealItem[]>("/deals");
}

export function fetchDealCodes(): Promise<{ partners: string[]; pvr: string[] }> {
  return api.get("/deals/codes");
}

export function createDeal(data: DealInput): Promise<DealItem> {
  return api.post<DealItem>("/deals", data);
}

export function updateDeal(id: string, data: Partial<DealInput>): Promise<DealItem> {
  return api.patch<DealItem>(`/deals/${id}`, data);
}

export function fetchStatement(month: string): Promise<Statement> {
  return api.get<Statement>(`/deals/statement?month=${month}`);
}

export function saveMonthInput(data: {
  code: string;
  month: string;
  bonus?: number;
  paymentStatus?: string;
  note?: string | null;
}): Promise<unknown> {
  return api.post("/deals/inputs", data);
}
