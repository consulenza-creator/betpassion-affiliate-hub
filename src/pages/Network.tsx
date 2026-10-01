import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../context/AuthContext";
import { fetchMyReferredPlayers, fetchNetworkOverview, fetchAffiliateDetail } from "../lib/network";
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
};

function formatEur(n: number): string {
  return `€ ${n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function PlayersTable({ players }: { players: ReferredPlayerItem[] }) {
  if (players.length === 0) {
    return <p className="text-sm text-text-muted">Nessun giocatore trovato.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-text-muted border-b border-surface-border">
            <th className="pb-2 pr-4 font-medium">ID giocatore</th>
            <th className="pb-2 pr-4 font-medium">Stato</th>
            <th className="pb-2 pr-4 font-medium">Depositi</th>
            <th className="pb-2 pr-4 font-medium">NGR</th>
            <th className="pb-2 pr-4 font-medium">Registrato il</th>
            <th className="pb-2 font-medium">Ultima attività</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.id} className="border-b border-surface-border last:border-0">
              <td className="py-3 pr-4 font-mono text-xs">{p.playerId}</td>
              <td className="py-3 pr-4">
                <Badge tone={STATE_TONE[p.lifecycleState]}>{STATE_LABELS[p.lifecycleState]}</Badge>
                {p.suppressed && (
                  <Badge tone="warning">
                    <span className="ml-1">soppresso</span>
                  </Badge>
                )}
              </td>
              <td className="py-3 pr-4">{formatEur(Number(p.totalDeposits))}</td>
              <td className="py-3 pr-4">{formatEur(Number(p.totalNgr))}</td>
              <td className="py-3 pr-4 text-text-muted">{new Date(p.registeredAt).toLocaleDateString("it-IT")}</td>
              <td className="py-3 text-text-muted">
                {p.lastActivityAt ? new Date(p.lastActivityAt).toLocaleDateString("it-IT") : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NetworkOverviewView() {
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

  async function toggleExpand(affiliateId: string) {
    if (expandedId === affiliateId) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(affiliateId);
    setDetail(null);
    setDetailLoading(true);
    try {
      const players = await fetchAffiliateDetail(affiliateId);
      setDetail(players);
    } catch {
      setError("Impossibile caricare il dettaglio del partner.");
    } finally {
      setDetailLoading(false);
    }
  }

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (loading) return <p className="text-sm text-text-muted">Caricamento...</p>;
  if (overview.length === 0) return <p className="text-sm text-text-muted">Nessun giocatore referred ancora registrato.</p>;

  return (
    <div className="space-y-3">
      {overview.map((partner) => (
        <Card key={partner.affiliateId}>
          <button
            onClick={() => toggleExpand(partner.affiliateId)}
            className="w-full flex flex-wrap items-center justify-between gap-3 text-left"
          >
            <div>
              <div className="text-sm font-medium">{partner.affiliateName}</div>
              <div className="text-xs text-text-muted">{partner.affiliateEmail}</div>
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

          {expandedId === partner.affiliateId && (
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

function MyPlayersView() {
  const [players, setPlayers] = useState<ReferredPlayerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyReferredPlayers()
      .then(setPlayers)
      .catch(() => setError("Impossibile caricare i tuoi giocatori."))
      .finally(() => setLoading(false));
  }, []);

  const totalDeposits = players.reduce((sum, p) => sum + Number(p.totalDeposits), 0);
  const totalNgr = players.reduce((sum, p) => sum + Number(p.totalNgr), 0);

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="text-xs text-text-muted mb-2">Giocatori portati</div>
          <div className="text-2xl font-semibold">{players.length}</div>
        </Card>
        <Card>
          <div className="text-xs text-text-muted mb-2">Depositi totali</div>
          <div className="text-2xl font-semibold">{formatEur(totalDeposits)}</div>
        </Card>
        <Card>
          <div className="text-xs text-text-muted mb-2">NGR totale</div>
          <div className="text-2xl font-semibold">{formatEur(totalNgr)}</div>
        </Card>
      </div>

      <Card>
        <h3 className="text-sm font-medium mb-4">I tuoi giocatori</h3>
        {loading ? <p className="text-sm text-text-muted">Caricamento...</p> : <PlayersTable players={players} />}
      </Card>
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
            ? "Per ciascun partner, quanti utenti ha portato e in che stato sono. Nessun dato identificativo del giocatore."
            : "I giocatori che hai portato e il loro stato nel ciclo di vita."}
        </p>
      </div>

      {isManagement ? <NetworkOverviewView /> : <MyPlayersView />}
    </div>
  );
}
