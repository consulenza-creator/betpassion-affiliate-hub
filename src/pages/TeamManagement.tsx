import { useEffect, useMemo, useState, FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useAuth, ApiError, ROLE_LABELS } from "../context/AuthContext";
import {
  fetchNetworkOptions,
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  resetAdminUserPassword,
} from "../lib/admin";
import type { AccessSelection, AdminNetworkOptions, AdminUser, UserRole } from "../types";

const ROLES = Object.keys(ROLE_LABELS) as UserRole[];

const inputClass =
  "w-full bg-surface-base border border-surface-border rounded-md px-3 py-2 text-sm outline-none focus:border-bp-green-light";

const EMPTY_SELECTION: AccessSelection = { partnerIds: [], filiere: [], agenti: [], pvr: [] };
const MAX_VISIBLE = 100;

type TabKey = "partner" | "filiera" | "agente" | "pvr";
const TABS: { key: TabKey; label: string; field: keyof AccessSelection }[] = [
  { key: "partner", label: "Partner", field: "partnerIds" },
  { key: "filiera", label: "Filiera", field: "filiere" },
  { key: "agente", label: "Agente", field: "agenti" },
  { key: "pvr", label: "PVR", field: "pvr" },
];

interface PickerItem {
  key: string;
  label: string;
  hint?: string | null;
  count: number;
}

function selectionTotal(sel: AccessSelection): number {
  return sel.partnerIds.length + sel.filiere.length + sel.agenti.length + sel.pvr.length;
}

// Elenchi divisi per tipo (partner, filiera, agente, PVR), ciascuno con ricerca.
// Un account vede i giocatori che rientrano in almeno una delle voci selezionate.
function AccessPicker({
  options,
  value,
  onChange,
}: {
  options: AdminNetworkOptions;
  value: AccessSelection;
  onChange: (v: AccessSelection) => void;
}) {
  const [tab, setTab] = useState<TabKey>("partner");
  const [query, setQuery] = useState("");

  const items: Record<TabKey, PickerItem[]> = useMemo(
    () => ({
      partner: options.partners.map((p) => ({ key: p.id, label: p.name, count: p.playerCount })),
      filiera: options.filiere.map((o) => ({ key: o.value, label: o.value, count: o.count })),
      agente: options.agenti.map((o) => ({ key: o.value, label: o.value, count: o.count })),
      pvr: options.pvr.map((o) => ({ key: o.value, label: o.value, hint: o.agent, count: o.count })),
    }),
    [options],
  );

  const activeTab = TABS.find((t) => t.key === tab)!;
  const selected = value[activeTab.field];
  const q = query.trim().toLowerCase();
  const filtered = items[tab].filter(
    (i) => !q || i.label.toLowerCase().includes(q) || (i.hint ?? "").toLowerCase().includes(q),
  );
  const visible = filtered.slice(0, MAX_VISIBLE);

  function toggle(key: string) {
    const next = selected.includes(key) ? selected.filter((x) => x !== key) : [...selected, key];
    onChange({ ...value, [activeTab.field]: next });
  }

  function selectAllFiltered() {
    onChange({ ...value, [activeTab.field]: [...new Set([...selected, ...filtered.map((i) => i.key)])] });
  }

  function clearTab() {
    onChange({ ...value, [activeTab.field]: [] });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const n = value[t.field].length;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                setQuery("");
              }}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                tab === t.key
                  ? "border-bp-green-light text-bp-green-light bg-bp-green-light/10"
                  : "border-surface-border text-text-muted hover:border-bp-gray-light"
              }`}
            >
              {t.label}
              {n > 0 && <span className="ml-1.5 opacity-80">({n})</span>}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Cerca ${activeTab.label.toLowerCase()}...`}
          className={inputClass}
        />
        <button type="button" onClick={selectAllFiltered} className="text-xs text-text-muted hover:text-bp-green-light whitespace-nowrap">
          Seleziona i {filtered.length.toLocaleString("it-IT")} mostrati
        </button>
        <button type="button" onClick={clearTab} className="text-xs text-text-muted hover:text-text-primary whitespace-nowrap">
          Svuota
        </button>
      </div>

      <div className="max-h-56 overflow-y-auto border border-surface-border rounded-md divide-y divide-surface-border">
        {visible.length === 0 ? (
          <p className="text-xs text-text-muted p-3">Nessun risultato.</p>
        ) : (
          visible.map((i) => (
            <label key={i.key} className="flex items-center gap-3 px-3 py-1.5 text-sm cursor-pointer hover:bg-surface-base">
              <input type="checkbox" checked={selected.includes(i.key)} onChange={() => toggle(i.key)} />
              <span className="flex-1 min-w-0 truncate">
                {i.label}
                {i.hint && <span className="text-xs text-text-muted ml-2">{i.hint}</span>}
              </span>
              <span className="text-xs text-text-muted">{i.count.toLocaleString("it-IT")} giocatori</span>
            </label>
          ))
        )}
        {filtered.length > MAX_VISIBLE && (
          <p className="text-xs text-text-muted p-2.5">
            Mostrati i primi {MAX_VISIBLE} di {filtered.length.toLocaleString("it-IT")}: usa la ricerca per restringere.
          </p>
        )}
      </div>
      <p className="text-xs text-text-muted">
        Totale voci selezionate: {selectionTotal(value)}. L'account vede i giocatori che rientrano in almeno una voce,
        anche di tipi diversi.
      </p>
    </div>
  );
}

// Riepilogo compatto delle voci assegnate a un account
function AssignmentBadges({ user }: { user: AdminUser }) {
  const groups: { label: string; values: string[] }[] = [
    { label: "Partner", values: user.partners.map((p) => p.name) },
    { label: "Filiera", values: user.filiere },
    { label: "Agente", values: user.agenti },
    { label: "PVR", values: user.pvr },
  ];
  return (
    <>
      {groups
        .filter((g) => g.values.length > 0)
        .map((g) => (
          <span key={g.label} className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-text-muted">{g.label}:</span>
            {g.values.slice(0, 8).map((v) => (
              <Badge key={v} tone="green">
                {v}
              </Badge>
            ))}
            {g.values.length > 8 && <span className="text-xs text-text-muted">+{g.values.length - 8}</span>}
          </span>
        ))}
    </>
  );
}

function selectionOf(u: AdminUser): AccessSelection {
  return { partnerIds: u.partners.map((p) => p.id), filiere: u.filiere, agenti: u.agenti, pvr: u.pvr };
}

export function TeamManagement() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [options, setOptions] = useState<AdminNetworkOptions>({ partners: [], filiere: [], agenti: [], pvr: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form nuovo account
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("affiliate_standard");
  const [newSel, setNewSel] = useState<AccessSelection>(EMPTY_SELECTION);
  const [newParentId, setNewParentId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Password temporanea mostrata una sola volta
  const [revealed, setRevealed] = useState<{ label: string; password: string } | null>(null);

  // Modifica partner di un account esistente
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSel, setEditSel] = useState<AccessSelection>(EMPTY_SELECTION);

  function load() {
    return Promise.all([fetchAdminUsers(), fetchNetworkOptions()])
      .then(([u, o]) => {
        setUsers(u);
        setOptions(o);
      })
      .catch(() => setError("Impossibile caricare gli account."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  // La gestione account e' riservata al Super Admin (il backend lo impone comunque)
  if (currentUser && currentUser.role !== "super_admin") return <Navigate to="/" replace />;

  function fail(err: unknown, fallback: string) {
    setError(err instanceof ApiError ? err.message : fallback);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await createAdminUser({ name, email, role, parentAffiliateId: isInternal(role) ? null : newParentId || null, ...newSel });
      setRevealed({ label: `Password temporanea per ${res.user.email}`, password: res.temporaryPassword });
      setName("");
      setEmail("");
      setNewSel(EMPTY_SELECTION);
      setNewParentId("");
      await load();
    } catch (err) {
      fail(err, "Impossibile creare l'account.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(u: AdminUser) {
    setError(null);
    try {
      await updateAdminUser(u.id, { active: !u.active });
      await load();
    } catch (err) {
      fail(err, "Impossibile aggiornare l'account.");
    }
  }

  async function handleReset(u: AdminUser) {
    if (!window.confirm(`Generare una nuova password temporanea per ${u.email}?`)) return;
    setError(null);
    try {
      const res = await resetAdminUserPassword(u.id);
      setRevealed({ label: `Nuova password temporanea per ${u.email}`, password: res.temporaryPassword });
      await load();
    } catch (err) {
      fail(err, "Impossibile reimpostare la password.");
    }
  }

  async function savePartners(u: AdminUser) {
    setError(null);
    try {
      await updateAdminUser(u.id, editSel);
      setEditingId(null);
      await load();
    } catch (err) {
      fail(err, "Impossibile salvare le assegnazioni.");
    }
  }

  const isInternal = (r: UserRole) => r === "super_admin" || r === "affiliate_manager";
  const masters = users.filter((m) => m.role === "master_affiliate" && m.active);

  async function changeParent(u: AdminUser, parentId: string) {
    setError(null);
    try {
      await updateAdminUser(u.id, { parentAffiliateId: parentId || null });
      await load();
    } catch (err) {
      fail(err, "Impossibile salvare il master di riferimento.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Gestione Team</h1>
        <p className="text-sm text-text-muted mt-1">
          Crea gli account e assegna a ciascuno la rete che può vedere, dal singolo PVR alla filiera: puoi
          combinare partner, filiere, agenti e punti vendita. Gli affiliati vedono solo ciò che gli è assegnato;
          Super Admin e Affiliate Manager vedono tutto.
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {revealed && (
        <Card>
          <div className="text-xs text-text-muted mb-1">{revealed.label}</div>
          <div className="flex items-center gap-3 flex-wrap">
            <code className="text-lg font-mono bg-surface-base border border-surface-border rounded-md px-3 py-1.5 select-all">
              {revealed.password}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(revealed.password)}
              className="text-xs px-3 py-1.5 rounded-md border border-surface-border hover:border-bp-green-light hover:text-bp-green-light transition-colors"
            >
              Copia
            </button>
            <button onClick={() => setRevealed(null)} className="text-xs text-text-muted hover:text-text-primary">
              Chiudi
            </button>
          </div>
          <p className="text-xs text-amber-400 mt-2">
            Viene mostrata una sola volta: copiala e consegnala all'interessato. Al primo accesso dovrà sceglierne una
            nuova.
          </p>
        </Card>
      )}

      <Card>
        <h3 className="text-sm font-medium mb-4">Nuovo account</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="tm-name" className="block text-xs text-text-muted mb-1.5">
                Nome e cognome / referente
              </label>
              <input id="tm-name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="tm-email" className="block text-xs text-text-muted mb-1.5">
                Email (login)
              </label>
              <input id="tm-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="tm-role" className="block text-xs text-text-muted mb-1.5">
                Ruolo
              </label>
              <select id="tm-role" value={role} onChange={(e) => setRole(e.target.value as UserRole)} className={inputClass}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isInternal(role) ? (
            <p className="text-xs text-text-muted">I ruoli interni vedono tutti i partner: non serve assegnarli.</p>
          ) : (
            <>
              <div className="max-w-xs">
                <label htmlFor="tm-parent" className="block text-xs text-text-muted mb-1.5">
                  Master di riferimento
                </label>
                <select id="tm-parent" value={newParentId} onChange={(e) => setNewParentId(e.target.value)} className={inputClass}>
                  <option value="">Nessuno</option>
                  {masters.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-xs text-text-muted mb-1.5">Rete visibile da questo account</div>
                <AccessPicker options={options} value={newSel} onChange={setNewSel} />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-bp-green-light text-bp-black font-medium text-sm rounded-md px-4 py-2.5 hover:bg-bp-green-dark transition-colors disabled:opacity-60"
          >
            {submitting ? "Creazione..." : "Crea account"}
          </button>
        </form>
      </Card>

      <Card>
        <h3 className="text-sm font-medium mb-4">Account</h3>
        {loading ? (
          <p className="text-sm text-text-muted">Caricamento...</p>
        ) : (
          <div className="divide-y divide-surface-border">
            {users.map((u) => (
              <div key={u.id} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{u.name}</div>
                    <div className="text-xs text-text-muted">{u.email}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge tone="neutral">{ROLE_LABELS[u.role]}</Badge>
                    <Badge tone={u.active ? "green" : "warning"}>{u.active ? "attivo" : "disattivato"}</Badge>
                    {u.mustChangePassword && <Badge tone="warning">password temporanea</Badge>}
                    {u.id !== currentUser?.id && (
                      <>
                        <button onClick={() => toggleActive(u)} className="text-xs px-2.5 py-1 rounded-md border border-surface-border hover:border-bp-green-light hover:text-bp-green-light transition-colors">
                          {u.active ? "Disattiva" : "Riattiva"}
                        </button>
                        <button onClick={() => handleReset(u)} className="text-xs px-2.5 py-1 rounded-md border border-surface-border hover:border-bp-green-light hover:text-bp-green-light transition-colors">
                          Reset password
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {!isInternal(u.role) && (
                  <div className="mt-2 flex items-center gap-2">
                    <label htmlFor={`parent-${u.id}`} className="text-xs text-text-muted">
                      Master di riferimento
                    </label>
                    <select
                      id={`parent-${u.id}`}
                      value={u.parentAffiliateId ?? ""}
                      onChange={(e) => changeParent(u, e.target.value)}
                      className="text-xs bg-surface-base border border-surface-border rounded-md px-2 py-1"
                    >
                      <option value="">Nessuno</option>
                      {masters
                        .filter((m) => m.id !== u.id)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {isInternal(u.role) ? (
                    <span className="text-xs text-text-muted">Vede tutti i partner</span>
                  ) : editingId === u.id ? (
                    <div className="w-full space-y-2">
                      <AccessPicker options={options} value={editSel} onChange={setEditSel} />
                      <div className="flex gap-2">
                        <button onClick={() => savePartners(u)} className="text-xs px-3 py-1.5 rounded-md bg-bp-green-light text-bp-black font-medium hover:bg-bp-green-dark">
                          Salva
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-xs text-text-muted hover:text-text-primary">
                          Annulla
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {selectionTotal(selectionOf(u)) === 0 ? (
                        <span className="text-xs text-amber-400">Nessuna rete assegnata: non vede dati di rete</span>
                      ) : (
                        <AssignmentBadges user={u} />
                      )}
                      <button
                        onClick={() => {
                          setEditingId(u.id);
                          setEditSel(selectionOf(u));
                        }}
                        className="text-xs text-text-muted hover:text-bp-green-light"
                      >
                        Modifica assegnazioni
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
