import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../context/AuthContext";
import { fetchAccessLog, fetchFeedStatus } from "../lib/admin";
import type { AccessLogItem, FeedStatus } from "../types";

const KIND_LABELS: Record<string, string> = {
  players: "Giocatori (anagrafica e stati)",
  movements: "Movimenti (depositi, giocato, GGR)",
};

function formatDay(iso: string | null): string {
  return iso ? new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString("it-IT", { timeZone: "UTC" }) : "—";
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" });
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <div className="text-xs text-text-muted">{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
      {hint && <div className="text-xs text-text-muted mt-1">{hint}</div>}
    </Card>
  );
}

// Pagina riservata al Super Admin: cosa e' arrivato nell'Hub, fino a quale data, e chi ha consultato i giocatori.
export function DataFeed() {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState<FeedStatus | null>(null);
  const [log, setLog] = useState<AccessLogItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchFeedStatus(), fetchAccessLog()])
      .then(([s, l]) => {
        setStatus(s);
        setLog(l);
      })
      .catch(() => setError("Impossibile caricare lo stato dei dati."));
  }, []);

  if (currentUser && currentUser.role !== "super_admin") return <Navigate to="/" replace />;

  const cur = status?.current;
  // Segnala quando l'anagrafica e' piu' indietro dei movimenti
  const lag = cur?.playersUpTo && cur?.movementsTo && cur.playersUpTo < cur.movementsTo;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dati &amp; Import</h1>
        <p className="text-sm text-text-muted mt-1">
          I file ricevuti dal database e fino a quando coprono. Qui si controlla che l'Hub sia aggiornato.
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {cur && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Giocatori nell'Hub" value={cur.players.toLocaleString("it-IT")} hint={`${cur.selfExcluded.toLocaleString("it-IT")} autoesclusi · ${cur.closed.toLocaleString("it-IT")} chiusi`} />
            <Stat
              label="Movimenti aggiornati al"
              value={formatDay(cur.movementsTo)}
              hint={`dal ${formatDay(cur.movementsFrom)} · ${cur.movements.toLocaleString("it-IT")} righe`}
            />
            <Stat label="Ultima registrazione in anagrafica" value={formatDay(cur.playersUpTo)} />
          </div>
          {lag && (
            <p className="text-xs text-amber-400">
              L'anagrafica è ferma al {formatDay(cur.playersUpTo)} mentre i movimenti arrivano al {formatDay(cur.movementsTo)}:
              i giocatori registrati nel frattempo non sono ancora nell'Hub.
            </p>
          )}
        </>
      )}

      <Card>
        <h3 className="text-sm font-medium mb-4">Ultimi file importati</h3>
        {status && status.imports.length === 0 ? (
          <p className="text-sm text-text-muted">Nessun import registrato.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted border-b border-surface-border">
                  <th className="pb-2 pr-4 font-medium">Importato il</th>
                  <th className="pb-2 pr-4 font-medium">Tipo</th>
                  <th className="pb-2 pr-4 font-medium">File</th>
                  <th className="pb-2 pr-4 font-medium">Dati fino al</th>
                  <th className="pb-2 pr-4 font-medium">Righe lette / scritte</th>
                  <th className="pb-2 pr-4 font-medium">Esito</th>
                  <th className="pb-2 font-medium">Note del feed</th>
                </tr>
              </thead>
              <tbody>
                {status?.imports.map((i) => (
                  <tr key={i.id} className="border-b border-surface-border last:border-0">
                    <td className="py-3 pr-4 text-text-muted">{formatDateTime(i.importedAt)}</td>
                    <td className="py-3 pr-4">{KIND_LABELS[i.kind] ?? i.kind}</td>
                    <td className="py-3 pr-4 text-xs font-mono">{i.sourceFile}</td>
                    <td className="py-3 pr-4">{formatDay(i.referenceDate)}</td>
                    <td className="py-3 pr-4">
                      {i.rowsRead.toLocaleString("it-IT")} / {i.rowsWritten.toLocaleString("it-IT")}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone={i.status === "ok" ? "green" : "warning"}>{i.status === "ok" ? "ok" : i.status}</Badge>
                    </td>
                    <td className="py-3 text-xs text-text-muted">{i.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-medium mb-1">Accessi ai dettagli dei giocatori</h3>
        <p className="text-xs text-text-muted mb-4">
          Si registra l'apertura dell'elenco di un partner (ultimi 100 accessi), non ogni caricamento di pagina.
        </p>
        {log.length === 0 ? (
          <p className="text-sm text-text-muted">Nessun accesso registrato.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted border-b border-surface-border">
                  <th className="pb-2 pr-4 font-medium">Quando</th>
                  <th className="pb-2 pr-4 font-medium">Account</th>
                  <th className="pb-2 font-medium">Partner aperto</th>
                </tr>
              </thead>
              <tbody>
                {log.map((l) => (
                  <tr key={l.id} className="border-b border-surface-border last:border-0">
                    <td className="py-2.5 pr-4 text-text-muted">{formatDateTime(l.createdAt)}</td>
                    <td className="py-2.5 pr-4">{l.userEmail}</td>
                    <td className="py-2.5">{l.partnerName}</td>
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
