import type { KpiCard, CommissionEntry } from "../types";

export const KPI_CARDS: KpiCard[] = [
  { id: "kpi1", label: "Nuovi giocatori (NGR)", value: "1.284", deltaPct: 8.2, trend: "up" },
  { id: "kpi2", label: "FTD (First Time Deposit)", value: "342", deltaPct: 4.1, trend: "up" },
  { id: "kpi3", label: "Commissioni totali", value: "€ 18.420", deltaPct: 6.7, trend: "up" },
  { id: "kpi4", label: "CPA maturati", value: "€ 9.150", deltaPct: 2.3, trend: "up" },
  { id: "kpi5", label: "RevShare maturato", value: "€ 6.980", deltaPct: -1.4, trend: "down" },
  { id: "kpi6", label: "Click totali", value: "48.902", deltaPct: 11.5, trend: "up" },
  { id: "kpi7", label: "Conversion rate", value: "2.62%", deltaPct: 0.3, trend: "flat" },
  { id: "kpi8", label: "Affiliati attivi", value: "76", deltaPct: 5.0, trend: "up" },
  { id: "kpi9", label: "Pagamento in attesa", value: "€ 4.230", deltaPct: -3.2, trend: "down" },
];

export const PERFORMANCE_SERIES = [
  { period: "Gen", clicks: 3200, ftd: 210, commission: 4200 },
  { period: "Feb", clicks: 3800, ftd: 240, commission: 4650 },
  { period: "Mar", clicks: 4100, ftd: 260, commission: 4900 },
  { period: "Apr", clicks: 3950, ftd: 255, commission: 4780 },
  { period: "Mag", clicks: 4400, ftd: 290, commission: 5320 },
  { period: "Giu", clicks: 4800, ftd: 320, commission: 5810 },
];

export const LATEST_COMMISSIONS: CommissionEntry[] = [
  { id: "c1", affiliateName: "Marco Russo", type: "cpa", amount: 450, currency: "EUR", date: "2026-07-04", status: "approved" },
  { id: "c2", affiliateName: "Anna Ferrari", type: "revshare", amount: 210.5, currency: "EUR", date: "2026-07-03", status: "pending" },
  { id: "c3", affiliateName: "Luca Verdi", type: "hybrid", amount: 615, currency: "EUR", date: "2026-07-02", status: "paid" },
  { id: "c4", affiliateName: "Sara Colombo", type: "manual_bonus", amount: 100, currency: "EUR", date: "2026-07-01", status: "paid" },
  { id: "c5", affiliateName: "Rete Nord-Est", type: "network_override", amount: 320, currency: "EUR", date: "2026-06-30", status: "approved" },
];

export const TOP_LINKS = [
  { id: "l1", name: "Landing Bonus Benvenuto IT", clicks: 12480, conversions: 312 },
  { id: "l2", name: "Banner Sport Serie A", clicks: 9870, conversions: 198 },
  { id: "l3", name: "Landing Casino Live", clicks: 7650, conversions: 145 },
];
