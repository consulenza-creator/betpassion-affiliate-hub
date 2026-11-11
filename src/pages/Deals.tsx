import { FormEvent, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import { createDeal, fetchDealCodes, fetchDeals, fetchStatement, saveMonthInput, updateDeal } from "../lib/deals";
import type { DealInput, DealItem, DealType, Statement, StatementRow } from "../types";

const inputClass =
  "w-full bg-surface-base border border-surface-border rounded-md px-3 py-2 text-sm outline-none focus:border-bp-green-light";

const TYPE_LABELS: Record<DealType, string> = {
  cpa: "Compenso per primo deposito",
  revshare: "Revenue share",
  hybrid: "Ibrido (primo deposito + revenue share)",
};

const eur = (n: number) => n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

function monthOptions(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < 14; i++) {
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({ value, label: d.toLocaleDateString("it-IT", { month: "long", year: "numeric" }) });
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}

function dealSummary(d: { type: DealType; cpaAmount: string | number | null; revSharePct: string | number | null }): string {
  const parts: string[] = [];
  if (d.type !== "revshare" && d.cpaAmount !== null) parts.push(`${eur(Number(d.cpaAmount))} per primo deposito`);
  if (d.type !== "cpa" && d.revSharePct !== null) parts.push(`${Number(d.revSharePct).toLocaleString("it-IT")}% revenue share`);
  return parts.join(" + ");
}

const EMPTY_FORM = { code: "", type: "cpa" as DealType, cpaAmount: "", revSharePct: "", validFrom: "", validTo: "", notes: "" };

// Pagina riservata al Super Admin: accordi economici per codice e prospetto mensile dei compensi.
export function Deals() {
  const { currentUser } = useAuth();
  const months = useMemo(monthOptions, []);
  const [month, setMonth] = useState(months[1].value); // ultimo mese completo
  const [statement, setStatement] = useState<Statement | null>(null);
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [codes, setCodes] = useState<{ partners: string[]; pvr: string[] }>({ partners: [], pvr: [] });
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fail = (err: unknown, fallback: string) => setError(err instanceof ApiError ? err.message : fallback);

  async function loadStatement(m = month) {
    try {
      setStatement(await fetchStatement(m));
    } catch (err) {
      fail(err, "Impossibile caricare il prospetto.");
    }
  }
  async function loadDeals() {
    try {
      const [d, c] = await Promise.all([fetchDeals(), fetchDealCodes()]);
      setDeals(d);
      setCodes(c);
    } catch (err) {
      fail(err, "Impossibile caricare gli accordi.");
    }
  }

  useEffect(() => {
    void loadDeals();
  }, []);
  useEffect(() => {
    void loadStatement(month);
  }, [month]);

  if (currentUser && currentUser.role !== "super_admin") return <Navigate to="/" replace />;

  async function saveInput(row: StatementRow, data: { bonus?: number; paymentStatus?: string }) {
    setError(null);
    try {
      await saveMonthInput({ code: row.code, month, ...data });
      await loadStatement();
    } catch (err) {
      fail(err, "Impossibile salvare.");
    }
  }

  function startEdit(d: DealItem) {
    setEditingId(d.id);
    setForm({
      code: d.code,
      type: d.type,
      cpaAmount: d.cpaAmount ?? "",
      revSharePct: d.revSharePct ?? "",
      validFrom: d.validFrom.slice(0, 10),
      validTo: d.validTo ? d.validTo.slice(0, 10) : "",
      notes: d.notes ?? "",
    });
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const body: DealInput = {
      code: form.code,
      type: form.type,
      cpaAmount: form.type === "revshare" || form.cpaAmount === "" ? null : Number(form.cpaAmount.replace(",", ".")),
      revSharePct: form.type === "cpa" || form.revSharePct === "" ? null : Number(form.revSharePct.replace(",", ".")),
      validFrom: form.validFrom,
      validTo: form.validTo || null,
      notes: form.notes || null,
    };
    try {
      if (editingId) await updateDeal(editingId, body);
      else await createDeal(body);
      setForm(EMPTY_FORM);
      setEditingId(null);
      await Promise.all([loadDeals(), loadStatement()]);
    } catch (err) {
      fail(err, "Impossibile salvare l'accordo.");
    } finally {
      setSaving(false);
    }
  }

  const f = (k: keyof typeof EMPTY_FORM, v: string) => setForm((s) => ({ ...s, [k]: v }));
  const showCpa = form.type !== "revshare";
  const showRev = form.type !== "cpa";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Accordi e compensi</h1>
        <p className="text-sm text-text-muted mt-1">
          Per ogni codice (partner o PVR) l'accordo in vigore e il prospetto del mese, calcolato dai dati del feed. Il compenso
          per primo deposito si calcola dai primi depositi del mese; la revenue share dal profitto lordo meno i bonus che inserisci qui.
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-medium">Prospetto mensile</h3>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="text-sm bg-surface-base border border-surface-border rounded-md px-3 py-1.5 capitalize">
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {statement?.partial && (
          <p className="text-xs text-amber-400 mb-3">
            Mese non completo: i dati arrivano fino al {statement.dataUpTo ? new Date(`${statement.dataUpTo}T00:00:00Z`).toLocaleDateString("it-IT", { timeZone: "UTC" }) : "—"}.
            I compensi si aggiornano a ogni feed.
          </p>
        )}

        {!statement ? (
          <p className="text-sm text-text-muted">Caricamento...</p>
        ) : statement.rows.length === 0 ? (
          <p className="text-sm text-text-muted">Nessun accordo in vigore in questo mese. Aggiungine uno qui sotto.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-6 text-sm mb-4">
              <span><span className="text-text-muted text-xs mr-1">Primi depositi</span><span className="font-medium">{statement.totals.ftd.toLocaleString("it-IT")}</span></span>
              <span><span className="text-text-muted text-xs mr-1">Compensi primo deposito</span><span className="font-medium">{eur(statement.totals.cpa)}</span></span>
              <span><span className="text-text-muted text-xs mr-1">Revenue share</span><span className="font-medium">{eur(statement.totals.revshare)}</span></span>
              <span><span className="text-text-muted text-xs mr-1">Totale da riconoscere</span><span className="font-semibold text-bp-green-light">{eur(statement.totals.total)}</span></span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-text-muted text-xs text-left">
                    <th className="py-2 font-normal">Codice</th>
                    <th className="py-2 font-normal">Accordo</th>
                    <th className="py-2 font-normal text-right">Primi depositi</th>
                    <th className="py-2 font-normal text-right">Profitto lordo</th>
                    <th className="py-2 font-normal text-right">Bonus del mese</th>
                    <th className="py-2 font-normal text-right">Base</th>
                    <th className="py-2 font-normal text-right">Primo deposito</th>
                    <th className="py-2 font-normal text-right">Rev. share</th>
                    <th className="py-2 font-normal text-right">Totale</th>
                    <th className="py-2 font-normal pl-4">Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {statement.rows.map((r) => (
                    <tr key={r.code} className="border-t border-surface-border">
                      <td className="py-2 font-medium">{r.code}</td>
                      <td className="py-2 text-xs text-text-muted">{dealSummary(r)}</td>
                      <td className="py-2 text-right">{r.ftd.toLocaleString("it-IT")}</td>
                      <td className="py-2 text-right">{eur(r.ggr)}</td>
                      <td className="py-2 text-right">
                        {r.type === "cpa" ? (
                          <span className="text-text-muted">—</span>
                        ) : (
                          <input
                            key={`${r.code}-${month}-${r.bonus}`}
                            defaultValue={r.bonus ? String(r.bonus).replace(".", ",") : ""}
                            placeholder="0,00"
                            inputMode="decimal"
                            onBlur={(e) => {
                              const v = Number(e.target.value.replace(",", ".") || 0);
                              if (!Number.isNaN(v) && v >= 0 && v !== r.bonus) void saveInput(r, { bonus: v });
                            }}
                            className="w-28 text-right bg-surface-base border border-surface-border rounded-md px-2 py-1 text-sm outline-none focus:border-bp-green-light"
                          />
                        )}
                      </td>
                      <td className={`py-2 text-right ${r.negativeBase ? "text-amber-400" : ""}`} title={r.negativeBase ? "Base negativa: revenue share a zero" : undefined}>
                        {r.type === "cpa" ? "—" : eur(r.ngr)}
                      </td>
                      <td className="py-2 text-right">{eur(r.cpa)}</td>
                      <td className="py-2 text-right">{eur(r.revshare)}</td>
                      <td className="py-2 text-right font-medium">{eur(r.total)}</td>
                      <td className="py-2 pl-4">
                        <select
                          value={r.paymentStatus}
                          onChange={(e) => void saveInput(r, { paymentStatus: e.target.value })}
                          className="text-xs bg-surface-base border border-surface-border rounded-md px-2 py-1"
                        >
                          <option value="da_pagare">Da pagare</option>
                          <option value="pagato">Pagato</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-text-muted mt-3">
              Base = profitto lordo meno i bonus del mese. Se la base è negativa la revenue share del mese è zero (il negativo non viene riportato).
            </p>
          </>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-medium mb-4">Accordi</h3>
        {deals.length === 0 ? (
          <p className="text-sm text-text-muted">Nessun accordo inserito.</p>
        ) : (
          <div className="divide-y divide-surface-border">
            {deals.map((d) => (
              <div key={d.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{d.code}</div>
                  <div className="text-xs text-text-muted">
                    {dealSummary(d)} · dal {new Date(`${d.validFrom.slice(0, 10)}T00:00:00Z`).toLocaleDateString("it-IT", { timeZone: "UTC" })}
                    {d.validTo ? ` al ${new Date(`${d.validTo.slice(0, 10)}T00:00:00Z`).toLocaleDateString("it-IT", { timeZone: "UTC" })}` : " (senza scadenza)"}
                    {d.notes ? ` · ${d.notes}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="neutral">{d.type === "cpa" ? "Primo deposito" : d.type === "revshare" ? "Revenue share" : "Ibrido"}</Badge>
                  <button onClick={() => startEdit(d)} className="text-xs px-2.5 py-1 rounded-md border border-surface-border hover:border-bp-green-light hover:text-bp-green-light transition-colors">
                    Modifica
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-medium mb-4">{editingId ? "Modifica accordo" : "Nuovo accordo"}</h3>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="d-code" className="block text-xs text-text-muted mb-1.5">Codice (partner o PVR)</label>
              <input id="d-code" list="d-codes" required value={form.code} onChange={(e) => f("code", e.target.value)} className={inputClass} placeholder="es. bpziogeorge" />
              <datalist id="d-codes">
                {[...codes.partners, ...codes.pvr].map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label htmlFor="d-type" className="block text-xs text-text-muted mb-1.5">Tipo di accordo</label>
              <select id="d-type" value={form.type} onChange={(e) => f("type", e.target.value)} className={inputClass}>
                {(Object.keys(TYPE_LABELS) as DealType[]).map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {showCpa && (
                <div>
                  <label htmlFor="d-cpa" className="block text-xs text-text-muted mb-1.5">€ per primo deposito</label>
                  <input id="d-cpa" inputMode="decimal" required value={form.cpaAmount} onChange={(e) => f("cpaAmount", e.target.value)} className={inputClass} placeholder="30" />
                </div>
              )}
              {showRev && (
                <div>
                  <label htmlFor="d-rev" className="block text-xs text-text-muted mb-1.5">% revenue share</label>
                  <input id="d-rev" inputMode="decimal" required value={form.revSharePct} onChange={(e) => f("revSharePct", e.target.value)} className={inputClass} placeholder="25" />
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="d-from" className="block text-xs text-text-muted mb-1.5">Valido dal</label>
              <input id="d-from" type="date" required value={form.validFrom} onChange={(e) => f("validFrom", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="d-to" className="block text-xs text-text-muted mb-1.5">Fino al (facoltativo)</label>
              <input id="d-to" type="date" value={form.validTo} onChange={(e) => f("validTo", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="d-notes" className="block text-xs text-text-muted mb-1.5">Note</label>
              <input id="d-notes" value={form.notes} onChange={(e) => f("notes", e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="bg-bp-green-light text-bp-black font-medium text-sm rounded-md px-4 py-2.5 hover:bg-bp-green-dark transition-colors disabled:opacity-60">
              {saving ? "Salvataggio..." : editingId ? "Salva modifiche" : "Aggiungi accordo"}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }} className="text-xs text-text-muted hover:text-text-primary">
                Annulla
              </button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
