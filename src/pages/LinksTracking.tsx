import { Fragment, useEffect, useState, FormEvent } from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fetchLinks, createLink, updateLink, fetchReferralOptions, fetchLinkStats, fetchConversionPlayers, qrUrl } from "../lib/links";
import { ApiError } from "../lib/api";
import type { AffiliateLinkItem, ConversionPlayer, LinkStats, QrStyle, ReferralOptions } from "../types";

const inputClass =
  "w-full bg-surface-base border border-surface-border rounded-md px-3 py-2 text-sm outline-none focus:border-bp-green-light";

const QR_STYLE_LABELS: Record<QrStyle, string> = {
  standard: "Standard",
  passion: "Verde Passion",
  high_contrast: "Alto contrasto (stampa)",
};

function ReferralSelect({
  options,
  value,
  onChange,
  id,
}: {
  options: ReferralOptions;
  value: string;
  onChange: (v: string) => void;
  id: string;
}) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
      <option value="">Scegli il codice...</option>
      {options.partners.length > 0 && (
        <optgroup label="Partner">
          {options.partners.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </optgroup>
      )}
      {options.pvr.length > 0 && (
        <optgroup label="PVR">
          {options.pvr.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}

function Breakdown({ title, rows }: { title: string; rows: { key: string; count: number }[] }) {
  const total = rows.reduce((n, r) => n + r.count, 0) || 1;
  return (
    <div>
      <div className="text-xs text-text-muted mb-2">{title}</div>
      {rows.length === 0 ? (
        <p className="text-xs text-text-muted">Nessun dato</p>
      ) : (
        <div className="space-y-1.5">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center justify-between text-xs">
              <span>{r.key}</span>
              <span className="text-text-muted">
                {r.count.toLocaleString("it-IT")} · {Math.round((r.count / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Statistiche di un link: andamento degli ultimi 30 giorni e ripartizione per dispositivo, browser e sistema
function LinkStatsPanel({ linkId }: { linkId: string }) {
  const [stats, setStats] = useState<LinkStats | null>(null);
  const [err, setErr] = useState(false);
  const [listKind, setListKind] = useState<"registrations" | "ftd" | null>(null);
  const [list, setList] = useState<ConversionPlayer[] | null>(null);
  useEffect(() => {
    fetchLinkStats(linkId).then(setStats).catch(() => setErr(true));
  }, [linkId]);
  function openList(kind: "registrations" | "ftd") {
    if (listKind === kind) {
      setListKind(null);
      return;
    }
    setListKind(kind);
    setList(null);
    fetchConversionPlayers(linkId, kind).then(setList).catch(() => setList([]));
  }
  if (err) return <p className="text-xs text-red-400">Impossibile caricare le statistiche.</p>;
  if (!stats) return <p className="text-xs text-text-muted">Caricamento statistiche...</p>;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-6 text-sm">
        <span>
          <span className="text-text-muted text-xs mr-1">Click validi</span>
          <span className="font-medium">{stats.totals.clicks.toLocaleString("it-IT")}</span>
        </span>
        <span>
          <span className="text-text-muted text-xs mr-1">Visitatori unici</span>
          <span className="font-medium">{stats.totals.unique.toLocaleString("it-IT")}</span>
        </span>
        <span className="text-xs text-text-muted self-center">
          Esclusi: {stats.totals.botsFiltered.toLocaleString("it-IT")} anteprime/bot ·{" "}
          {stats.totals.duplicatesFiltered.toLocaleString("it-IT")} doppi click (stesso visitatore entro 30 minuti)
        </span>
      </div>
      {stats.conversion && (
        <div className="rounded-lg border border-surface-border p-3 space-y-1">
          <div className="flex flex-wrap gap-6 text-sm">
            <span>
              <span className="text-text-muted text-xs mr-1">Registrazioni codice {stats.conversion.code} ({stats.conversion.days} gg)</span>
              <button onClick={() => openList("registrations")} className="font-medium underline decoration-dotted hover:text-bp-green-light" title="Mostra l'elenco">
                {stats.conversion.registrations.toLocaleString("it-IT")}
              </button>
            </span>
            <span>
              <span className="text-text-muted text-xs mr-1">Primi depositi</span>
              <button onClick={() => openList("ftd")} className="font-medium underline decoration-dotted hover:text-bp-green-light" title="Mostra l'elenco">
                {stats.conversion.ftd.toLocaleString("it-IT")}
              </button>
            </span>
            <span>
              <span className="text-text-muted text-xs mr-1">Click → registrazione</span>
              <span className="font-medium">
                {stats.conversion.registrationRate === null ? "—" : `${stats.conversion.registrationRate.toLocaleString("it-IT")}%`}
              </span>
            </span>
            <span>
              <span className="text-text-muted text-xs mr-1">Registrazione → primo deposito</span>
              <span className="font-medium">
                {stats.conversion.ftdRate === null ? "—" : `${stats.conversion.ftdRate.toLocaleString("it-IT")}%`}
              </span>
            </span>
          </div>
          <p className="text-xs text-text-muted">
            Click di tutti i link con questo codice ({stats.conversion.clicks.toLocaleString("it-IT")}). Le registrazioni comprendono ogni canale, non solo i link: il rapporto è indicativo.
          </p>
          {listKind && (
            <div className="pt-2">
              <div className="text-xs text-text-muted mb-1">
                {listKind === "ftd" ? "Giocatori con primo deposito" : "Giocatori registrati"} negli ultimi {stats.conversion.days} giorni
              </div>
              {list === null ? (
                <p className="text-xs text-text-muted">Caricamento...</p>
              ) : list.length === 0 ? (
                <p className="text-xs text-text-muted">Nessun giocatore nel periodo.</p>
              ) : (
                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-text-muted text-left">
                        <th className="py-1 font-normal">Username</th>
                        <th className="py-1 font-normal">Nickname</th>
                        <th className="py-1 font-normal">{listKind === "ftd" ? "Primo deposito" : "Registrato il"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((p) => {
                        const d = listKind === "ftd" ? p.firstDepositAt : p.registeredAt;
                        return (
                          <tr key={p.id} className="border-t border-surface-border">
                            <td className="py-1 font-medium">
                              {p.username ?? "—"}
                              {p.selfExcluded && <span className="ml-2 text-amber-400">autoescluso</span>}
                              {p.closed && <span className="ml-2 text-amber-400">chiuso</span>}
                            </td>
                            <td className="py-1 text-text-muted">{p.nickname ?? "—"}</td>
                            <td className="py-1 text-text-muted">{d ? new Date(d).toLocaleDateString("it-IT") : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stats.daily.map((d) => ({ ...d, label: d.day.slice(8) + "/" + d.day.slice(5, 7) }))}>
            <CartesianGrid stroke="#262832" strokeDasharray="3 3" />
            <XAxis dataKey="label" stroke="#9aa0ac" fontSize={11} interval={4} />
            <YAxis stroke="#9aa0ac" fontSize={11} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "#1b1d24", border: "1px solid #262832", borderRadius: 8 }} labelStyle={{ color: "#f3f4f6" }} />
            <Line type="monotone" dataKey="clicks" stroke="#50AE3A" strokeWidth={2} dot={false} name="Click" />
            <Line type="monotone" dataKey="unique" stroke="#989898" strokeWidth={2} dot={false} name="Visitatori unici" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <Breakdown title="Dispositivo" rows={stats.byDevice} />
        <Breakdown title="Browser" rows={stats.byBrowser} />
        <Breakdown title="Sistema operativo" rows={stats.byOs} />
      </div>
    </div>
  );
}

function previewUrl(targetUrl: string, referralCode: string): string {
  if (!targetUrl) return "";
  try {
    const u = new URL(targetUrl);
    u.searchParams.delete("codicePresentatore");
    const base = u.toString();
    return referralCode ? `${base}${base.includes("?") ? "&" : "?"}codicePresentatore=$${referralCode}` : base;
  } catch {
    return "";
  }
}

export function LinksTracking() {
  const [links, setLinks] = useState<AffiliateLinkItem[]>([]);
  const [options, setOptions] = useState<ReferralOptions>({ partners: [], pvr: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [campaignName, setCampaignName] = useState("");
  const [targetUrl, setTargetUrl] = useState("https://www.betpassion.it/");
  const [referralCode, setReferralCode] = useState("");
  const [qrStyle, setQrStyle] = useState<QrStyle>("standard");
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modifica di un link esistente
  const [statsId, setStatsId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState({ campaignName: "", targetUrl: "", slug: "", referralCode: "", qrStyle: "standard" as QrStyle });

  const allCodes = [...options.partners, ...options.pvr];

  function loadLinks() {
    setLoading(true);
    fetchLinks()
      .then(setLinks)
      .catch(() => setError("Impossibile caricare i link."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadLinks();
    fetchReferralOptions()
      .then((o) => {
        setOptions(o);
        const codes = [...o.partners, ...o.pvr];
        if (codes.length === 1) setReferralCode(codes[0]);
      })
      .catch(() => undefined);
  }, []);

  function fail(err: unknown, fallback: string) {
    setError(err instanceof ApiError ? err.message : fallback);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createLink({ campaignName, targetUrl, referralCode: referralCode || undefined, qrStyle });
      setCampaignName("");
      loadLinks();
    } catch (err) {
      fail(err, "Impossibile creare il link. Riprova.");
    } finally {
      setSubmitting(false);
    }
  }

  async function saveEdit(link: AffiliateLinkItem) {
    setError(null);
    try {
      await updateLink(link.id, {
        campaignName: edit.campaignName,
        targetUrl: edit.targetUrl,
        slug: edit.slug,
        qrStyle: edit.qrStyle,
        ...(edit.referralCode ? { referralCode: edit.referralCode } : {}),
      });
      setEditingId(null);
      loadLinks();
    } catch (err) {
      fail(err, "Impossibile salvare le modifiche.");
    }
  }

  async function toggleActive(link: AffiliateLinkItem) {
    setError(null);
    try {
      await updateLink(link.id, { active: !link.active });
      loadLinks();
    } catch (err) {
      fail(err, "Impossibile aggiornare il link.");
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
          Genera link e QR tracciati. Ogni link porta il tuo codice presentatore, così le registrazioni vengono
          attribuite a te. Il QR contiene solo il link breve: puoi cambiare la destinazione senza ristampare.
        </p>
      </div>

      <Card>
        <h3 className="text-sm font-medium mb-4">Nuovo link</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="campaignName" className="block text-xs text-text-muted mb-1.5">
                Nome campagna
              </label>
              <input
                id="campaignName"
                type="text"
                required
                maxLength={100}
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className={inputClass}
                placeholder="Es. Landing Bonus Benvenuto"
              />
            </div>
            <div>
              <label htmlFor="targetUrl" className="block text-xs text-text-muted mb-1.5">
                Pagina di destinazione (betpassion.it)
              </label>
              <input
                id="targetUrl"
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className={inputClass}
                placeholder="https://www.betpassion.it/..."
              />
            </div>
            <div>
              <label htmlFor="referralCode" className="block text-xs text-text-muted mb-1.5">
                Codice presentatore
              </label>
              <ReferralSelect id="referralCode" options={options} value={referralCode} onChange={setReferralCode} />
              {allCodes.length === 0 && (
                <p className="text-xs text-amber-400 mt-1.5">Nessun codice assegnato al tuo account: contatta l'amministratore.</p>
              )}
            </div>
            <div>
              <label htmlFor="qrStyle" className="block text-xs text-text-muted mb-1.5">
                Stile del QR
              </label>
              <select id="qrStyle" value={qrStyle} onChange={(e) => setQrStyle(e.target.value as QrStyle)} className={inputClass}>
                {(Object.keys(QR_STYLE_LABELS) as QrStyle[]).map((s) => (
                  <option key={s} value={s}>
                    {QR_STYLE_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {previewUrl(targetUrl, referralCode) && (
            <p className="text-xs text-text-muted break-all">
              Il visitatore arriverà su: <span className="text-text-primary">{previewUrl(targetUrl, referralCode)}</span>
            </p>
          )}

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
                  <th className="pb-2 pr-4 font-medium">Presentatore</th>
                  <th className="pb-2 pr-4 font-medium">Click validi</th>
                  <th className="pb-2 pr-4 font-medium">Unici</th>
                  <th className="pb-2 pr-4 font-medium">7 giorni</th>
                  <th className="pb-2 pr-4 font-medium">Stato</th>
                  <th className="pb-2 pr-4 font-medium">QR</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <Fragment key={link.id}>
                    <tr className="border-b border-surface-border last:border-0">
                      <td className="py-3 pr-4">
                        <div>{link.campaignName}</div>
                        <div className="text-xs text-text-muted">{new Date(link.createdAt).toLocaleDateString("it-IT")}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => handleCopy(link)}
                          className="text-bp-green-light hover:text-bp-green-dark transition-colors text-left break-all"
                          title="Clicca per copiare"
                        >
                          {copiedId === link.id ? "Copiato!" : link.shortUrl}
                        </button>
                      </td>
                      <td className="py-3 pr-4 text-xs">{link.referralCode ?? <span className="text-text-muted">—</span>}</td>
                      <td className="py-3 pr-4">{link.clickCount.toLocaleString("it-IT")}</td>
                      <td className="py-3 pr-4 text-text-muted">{link.uniqueVisitors.toLocaleString("it-IT")}</td>
                      <td className="py-3 pr-4 text-text-muted">{link.clicks7d.toLocaleString("it-IT")}</td>
                      <td className="py-3 pr-4">
                        <Badge tone={link.active ? "green" : "neutral"}>{link.active ? "attivo" : "disattivo"}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          {link.active && (
                            <img src={qrUrl(link.slug, "png")} alt={`QR ${link.slug}`} className="w-12 h-12 bg-white rounded" />
                          )}
                          {link.active && (
                            <div className="flex flex-col text-xs">
                              <a className="text-bp-green-light hover:text-bp-green-dark" href={qrUrl(link.slug, "png", { download: true })}>
                                PNG
                              </a>
                              <a className="text-bp-green-light hover:text-bp-green-dark" href={qrUrl(link.slug, "svg", { download: true })}>
                                SVG
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setStatsId(statsId === link.id ? null : link.id)}
                          className="text-xs px-2.5 py-1 rounded-md border border-surface-border hover:border-bp-green-light hover:text-bp-green-light transition-colors mr-2"
                        >
                          Statistiche
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(editingId === link.id ? null : link.id);
                            setEdit({
                              campaignName: link.campaignName,
                              targetUrl: link.targetUrl,
                              slug: link.slug,
                              referralCode: link.referralCode ?? "",
                              qrStyle: link.qrStyle,
                            });
                          }}
                          className="text-xs px-2.5 py-1 rounded-md border border-surface-border hover:border-bp-green-light hover:text-bp-green-light transition-colors mr-2"
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => toggleActive(link)}
                          className="text-xs px-2.5 py-1 rounded-md border border-surface-border hover:border-bp-green-light hover:text-bp-green-light transition-colors"
                        >
                          {link.active ? "Disattiva" : "Riattiva"}
                        </button>
                      </td>
                    </tr>
                    {statsId === link.id && (
                      <tr className="border-b border-surface-border">
                        <td colSpan={9} className="py-4">
                          <LinkStatsPanel linkId={link.id} />
                        </td>
                      </tr>
                    )}
                    {editingId === link.id && (
                      <tr className="border-b border-surface-border">
                        <td colSpan={9} className="py-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-text-muted mb-1.5">Nome campagna</label>
                              <input className={inputClass} value={edit.campaignName} onChange={(e) => setEdit({ ...edit, campaignName: e.target.value })} />
                            </div>
                            <div>
                              <label className="block text-xs text-text-muted mb-1.5">Pagina di destinazione</label>
                              <input className={inputClass} value={edit.targetUrl} onChange={(e) => setEdit({ ...edit, targetUrl: e.target.value })} />
                            </div>
                            <div>
                              <label className="block text-xs text-text-muted mb-1.5">
                                Codice link (il vecchio codice continua a funzionare)
                              </label>
                              <input className={inputClass} value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} />
                            </div>
                            <div>
                              <label className="block text-xs text-text-muted mb-1.5">Codice presentatore</label>
                              <ReferralSelect id={`ref-${link.id}`} options={options} value={edit.referralCode} onChange={(v) => setEdit({ ...edit, referralCode: v })} />
                            </div>
                            <div>
                              <label className="block text-xs text-text-muted mb-1.5">Stile del QR</label>
                              <select className={inputClass} value={edit.qrStyle} onChange={(e) => setEdit({ ...edit, qrStyle: e.target.value as QrStyle })}>
                                {(Object.keys(QR_STYLE_LABELS) as QrStyle[]).map((s) => (
                                  <option key={s} value={s}>
                                    {QR_STYLE_LABELS[s]}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button onClick={() => saveEdit(link)} className="text-xs px-3 py-1.5 rounded-md bg-bp-green-light text-bp-black font-medium hover:bg-bp-green-dark">
                              Salva
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-xs text-text-muted hover:text-text-primary">
                              Annulla
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
