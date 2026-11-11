import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../context/AuthContext";
import { fetchNetworkOverview, fetchPartnerPlayers } from "../lib/network";
import type { AffiliateNetworkSummary, PlayerLifecycleState, ReferredPlayerItem } from "../types";

const STATE_LABELS: Record<PlayerLifecycleState, string> = {
  appena_registrato: "Appena registrato",
  non_convertito: "Non convertito",
  solo_primo_deposito: "Solo primo deposito",
  nuovo: "Nuovo",
  non_attivato: "Non attivato",
  in_consolidamento: "In consolidamento",
  attivo: "Attivo",
  in_flessione: "In flessione",
  rischio_churn: "Rischio churn",
  dormiente: "Dormiente",
  perso: "Perso",
  riattivato: "Riattivato",
  non_classificabile: "Non classificabile",
};

const STATE_TONE: Record<PlayerLifecycleState, "green" | "neutral" | "warning"> = {
  appena_registrato: "neutral",
  non_convertito: "neutral",
  solo_primo_deposito: "neutral",
  nuovo: "neutral",
  non_attivato: "neutral",
  in_consolidamento: "green",
  attivo: "green",
  riattivato: "green",
  in_flessione: "warning",
  rischio_churn: "warning",
  dormiente: "warning",
  perso: "warning",
  non_classificabile: "neutral",
};

function formatEur(n: number): string {
  return `€ ${n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const PAGE_SIZE = 50;

function PlayersTable({ players }: { players: ReferredPlayerItem[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  // Ricerca per username o nickname: serve all'affiliato per verificare le proprie iscrizioni
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter(
      (p) => (p.username ?? "").toLowerCase().includes(q) || (p.nickname ?? "").toLowerCase().includes(q),
    );
  }, [players, query]);

  if (players.length === 0) {
    return <p className="text-sm text-text-muted">Nessun giocatore trovato.</p>;
  }
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Cerca username o nickname..."
          className="w-72 bg-surface-base border border-surface-border rounded-md px-3 py-2 text-sm outline-none focus:border-bp-green-light"
        />
        <span className="text-xs text-text-muted">
          {filtered.length.toLocaleString("it-IT")} giocatori
          {query && ` su ${players.length.toLocaleString("it-IT")}`}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-text-muted border-b border-surface-border">
              <th className="pb-2 pr-4 font-medium">Username</th>
              <th className="pb-2 pr-4 font-medium">Nickname</th>
              <th className="pb-2 pr-4 font-medium">Stato</th>
              <th className="pb-2 pr-4 font-medium">Depositi</th>
              <th className="pb-2 pr-4 font-medium">GGR</th>
              <th className="pb-2 pr-4 font-medium">Registrato il</th>
              <th className="pb-2 font-medium">Ultima attività</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => (
              <tr key={p.id} className="border-b border-surface-border last:border-0">
                <td className="py-3 pr-4 text-xs font-medium">{p.username ?? <span className="text-text-muted">—</span>}</td>
                <td className="py-3 pr-4 text-xs text-text-muted">{p.nickname || "—"}</td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap items-center gap-1">
                    <Badge tone={STATE_TONE[p.lifecycleState]}>{STATE_LABELS[p.lifecycleState]}</Badge>
                    {p.selfExcluded && <Badge tone="warning">autoescluso</Badge>}
                    {p.closed && <Badge tone="warning">chiuso</Badge>}
                  </div>
                </td>
                <td className="py-3 pr-4">{formatEur(Number(p.totalDeposits))}</td>
                <td className="py-3 pr-4">{formatEur(Number(p.totalNgr))}</td>
                <td className="py-3 pr-4 text-text-muted">{p.registeredAt ? new Date(p.registeredAt).toLocaleDateString("it-IT") : "—"}</td>
                <td className="py-3 text-text-muted">
                  {p.lastActivityAt ? new Date(p.lastActivityAt).toLocaleDateString("it-IT") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-sm text-text-muted pt-3">Nessun giocatore corrisponde alla ricerca.</p>}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-end gap-3 text-xs text-text-muted">
          <button
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
            className="px-2.5 py-1 rounded-md border border-surface-border hover:border-bp-green-light disabled:opacity-40"
          >
            Precedente
          </button>
          <span>
            Pagina {current + 1} di {pages}
          </span>
          <button
            disabled={current >= pages - 1}
            onClick={() => setPage(current + 1)}
            className="px-2.5 py-1 rounded-md border border-surface-border hover:border-bp-green-light disabled:opacity-40"
          >
            Successiva
          </button>
        </div>
      )}
    </div>
  );
}

function NetworkOverviewView({ emptyMessage }: { emptyMessage: string }) {
  const [overview, setOverview] = useState<AffiliateNetworkSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ReferredPlayerItem[] | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchNetworkOverview()
      .then(setOverview)
      .catch(() => setError("Impossibile caricare la rete partner."))
      .finally(() => setLoading(false));
  }, []);

  async function toggleExpand(partnerId: string) {
    if (expandedId === partnerId) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(partnerId);
    setDetail(null);
    setDetailLoading(true);
    try {
      const players = await fetchPartnerPlayers(partnerId);
      setDetail(players);
    } catch {
      setError("Impossibile caricare il dettaglio del partner.");
    } finally {
      setDetailLoading(false);
    }
  }

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (loading) return <p className="text-sm text-text-muted">Caricamento...</p>;
  if (overview.length === 0) return <p className="text-sm text-text-muted">{emptyMessage}</p>;

  return (
    <div className="space-y-3">
      {overview.map((partner) => (
        <Card key={partner.partnerId}>
          <button
            onClick={() => toggleExpand(partner.partnerId)}
            className="w-full flex flex-wrap items-center justify-between gap-3 text-left"
          >
            <div>
              <div className="text-sm font-medium">{partner.partnerName}</div>
            </div>
            <div className="flex flex-wrap gap-4 items-center text-sm">
              <div>
                <span className="text-text-muted text-xs mr-1">Giocatori</span>
                <span className="font-medium">{partner.totalPlayers}</span>
              </div>
              <div>
                <span className="text-text-muted text-xs mr-1">Depositi</span>
                <span className="font-medium">{formatEur(partner.totalDeposits)}</span>
              </div>
              <div>
                <span className="text-text-muted text-xs mr-1">NGR</span>
                <span className="font-medium">{formatEur(partner.totalNgr)}</span>
              </div>
            </div>
          </button>

          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(partner.byState).map(([state, count]) => (
              <Badge key={state} tone={STATE_TONE[state as PlayerLifecycleState]}>
                {STATE_LABELS[state as PlayerLifecycleState]}: {count}
              </Badge>
            ))}
          </div>

          {expandedId === partner.partnerId && (
            <div className="mt-4 pt-4 border-t border-surface-border">
              {detailLoading ? (
                <p className="text-sm text-text-muted">Caricamento dettaglio...</p>
              ) : (
                detail && <PlayersTable players={detail} />
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

export function Network() {
  const { currentUser } = useAuth();
  const isManagement = currentUser?.role === "super_admin" || currentUser?.role === "affiliate_manager";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Rete Affiliati</h1>
        <p className="text-sm text-text-muted mt-1">
          {isManagement
            ? "Per ciascun partner, quanti utenti ha portato e in che stato sono. Dei giocatori sono mostrati solo username e nickname."
            : "I giocatori dei partner assegnati al tuo account e il loro stato nel ciclo di vita. Dei giocatori sono mostrati solo username e nickname."}
        </p>
      </div>

      <NetworkOverviewView
        emptyMessage={
          isManagement
            ? "Nessun giocatore ancora registrato."
            : "Nessun dato disponibile: al tuo account non risulta ancora assegnato nessun partner con giocatori."
        }
      />
    </div>
  );
}
