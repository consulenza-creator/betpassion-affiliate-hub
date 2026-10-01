import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { fetchCommissions } from "../lib/commissions";
import type { CommissionRecord } from "../types";

const STATUS_TONE = { paid: "green", approved: "neutral", pending: "warning", rejected: "warning" } as const;

const TYPE_LABELS: Record<CommissionRecord["type"], string> = {
  cpa: "CPA",
  revshare: "RevShare",
  hybrid: "Hybrid",
  manual_bonus: "Bonus manuale",
  network_override: "Override di rete",
};

const STATUS_LABELS: Record<CommissionRecord["status"], string> = {
  pending: "in attesa",
  approved: "approvata",
  paid: "pagata",
  rejected: "rifiutata",
};

export function Commissions() {
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | CommissionRecord["type"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | CommissionRecord["status"]>("all");

  useEffect(() => {
    fetchCommissions()
      .then(setCommissions)
      .catch(() => setError("Impossibile caricare le commissioni."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      commissions.filter(
        (c) => (typeFilter === "all" || c.type === typeFilter) && (statusFilter === "all" || c.status === statusFilter),
      ),
    [commissions, typeFilter, statusFilter],
  );

  const total = filtered.reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Commissioni</h1>
        <p className="text-sm text-text-muted mt-1">
          Storico delle commissioni maturate: CPA, RevShare, Hybrid, bonus manuali e override di rete.
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Card>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Tipo</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                className="bg-surface-base border border-surface-border rounded-md px-3 py-2 text-sm outline-none focus:border-bp-green-light"
              >
                <option value="all">Tutti</option>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Stato</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="bg-surface-base border border-surface-border rounded-md px-3 py-2 text-sm outline-none focus:border-bp-green-light"
              >
                <option value="all">Tutti</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-text-muted mb-1">Totale filtrato</div>
            <div className="text-xl font-semibold">€ {total.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>
      </Card>

      <Card>
        {loading ? (
          <p className="text-sm text-text-muted">Caricamento...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-text-muted">Nessuna commissione trovata.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted border-b border-surface-border">
                  <th className="pb-2 pr-4 font-medium">Tipo</th>
                  <th className="pb-2 pr-4 font-medium">Importo</th>
                  <th className="pb-2 pr-4 font-medium">Stato</th>
                  <th className="pb-2 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-surface-border last:border-0">
                    <td className="py-3 pr-4">{TYPE_LABELS[c.type]}</td>
                    <td className="py-3 pr-4">€ {Number(c.amount).toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      <Badge tone={STATUS_TONE[c.status]}>{STATUS_LABELS[c.status]}</Badge>
                    </td>
                    <td className="py-3 text-text-muted">{new Date(c.createdAt).toLocaleDateString("it-IT")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
