import { api } from "./api";
import type { CommissionRecord } from "../types";

export function fetchCommissions(): Promise<CommissionRecord[]> {
  return api.get<CommissionRecord[]>("/commissions");
}
