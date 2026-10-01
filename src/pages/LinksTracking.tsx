import { useEffect, useState, FormEvent } from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { fetchLinks, createLink } from "../lib/links";
import { ApiError } from "../lib/api";
import type { AffiliateLinkItem } from "../types";

export function LinksTracking() {
  const [links, setLinks] = useState<AffiliateLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [campaignName, setCampaignName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function loadLinks() {
    setLoading(true);
    fetchLinks()
      .then(setLinks)
      .catch(() => setError("Impossibile caricare i link."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadLinks();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createLink(campaignName, targetUrl);
      setCampaignName("");
      setTargetUrl("");
      loadLinks();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossibile creare il link. Riprova.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopy(link: AffiliateLinkItem) {
    navigator.clipboard.writeText(link.shortUrl).then(() => {
      setCopiedId(link.id);
      setTimeout(() => setCopiedId((id) => (id === link.id ? null : id)), 1500);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Link & Tracking</h1>
        <p className="text-sm text-text-muted mt-1">
          Genera e gestisci i tuoi link di affiliazione tracciati tramite redirect proprietario.
        </p>
      </div>

      <Card>
        <h3 className="text-sm font-medium mb-4">Nuovo link</h3>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label htmlFor="campaignName" className="block text-xs text-text-muted mb-1.5">
              Nome campagna
            </label>
            <input
              id="campaignName"
              type="text"
              required
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full bg-surface-base border border-surface-border rounded-md px-3 py-2 text-sm outline-none focus:border-bp-green-light"
              placeholder="Es. Landing Bonus Benvenuto IT"
            />
          </div>
          <div className="flex-1 w-full">
            <label htmlFor="targetUrl" className="block text-xs text-text-muted mb-1.5">
              URL di destinazione
            </label>
            <input
              id="targetUrl"
              type="url"
              required
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full bg-surface-base border border-surface-border rounded-md px-3 py-2 text-sm outline-none focus:border-bp-green-light"
              placeholder="https://www.betpassion.it/..."
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-bp-green-light text-bp-black font-medium text-sm rounded-md px-4 py-2.5 hover:bg-bp-green-dark transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            {submitting ? "Creazione..." : "Crea link"}
          </button>
        </form>
        {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
      </Card>

      <Card>
        <h3 className="text-sm font-medium mb-4">I tuoi link</h3>
        {loading ? (
          <p className="text-sm text-text-muted">Caricamento...</p>
        ) : links.length === 0 ? (
          <p className="text-sm text-text-muted">Nessun link creato finora.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted border-b border-surface-border">
                  <th className="pb-2 pr-4 font-medium">Campagna</th>
                  <th className="pb-2 pr-4 font-medium">Link tracciato</th>
                  <th className="pb-2 pr-4 font-medium">Click</th>
                  <th className="pb-2 pr-4 font-medium">Stato</th>
                  <th className="pb-2 font-medium">Creato il</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id} className="border-b border-surface-border last:border-0">
                    <td className="py-3 pr-4">{link.campaignName}</td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => handleCopy(link)}
                        className="text-bp-green-light hover:text-bp-green-dark transition-colors"
                        title={link.shortUrl}
                      >
                        {copiedId === link.id ? "Copiato!" : link.shortUrl}
                      </button>
                    </td>
                    <td className="py-3 pr-4 text-text-muted">{link.clickCount.toLocaleString("it-IT")}</td>
                    <td className="py-3 pr-4">
                      <Badge tone={link.active ? "green" : "neutral"}>{link.active ? "attivo" : "disattivo"}</Badge>
                    </td>
                    <td className="py-3 text-text-muted">
                      {new Date(link.createdAt).toLocaleDateString("it-IT")}
                    </td>
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
