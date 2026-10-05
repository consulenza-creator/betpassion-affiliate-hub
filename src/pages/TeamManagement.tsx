import { useEffect, useState, FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useAuth, ApiError, ROLE_LABELS } from "../context/AuthContext";
import {
  fetchAdminPartners,
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  resetAdminUserPassword,
} from "../lib/admin";
import type { AdminPartner, AdminUser, UserRole } from "../types";

const ROLES = Object.keys(ROLE_LABELS) as UserRole[];

const inputClass =
  "w-full bg-surface-base border border-surface-border rounded-md px-3 py-2 text-sm outline-none focus:border-bp-green-light";

function PartnerPicker({
  partners,
  selected,
  onChange,
}: {
  partners: AdminPartner[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }
  return (
    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
      {partners.map((p) => (
        <label
          key={p.id}
          className={`cursor-pointer text-xs px-2.5 py-1 rounded-full border transition-colors ${
            selected.includes(p.id)
              ? "border-bp-green-light text-bp-green-light bg-bp-green-light/10"
              : "border-surface-border text-text-muted hover:border-bp-gray-light"
          }`}
        >
          <input type="checkbox" className="hidden" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} />
          {p.name} <span className="opacity-60">({p.playerCount.toLocaleString("it-IT")})</span>
        </label>
      ))}
    </div>
  );
}

export function TeamManagement() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [partners, setPartners] = useState<AdminPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form nuovo account
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("affiliate_standard");
  const [newPartnerIds, setNewPartnerIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Password temporanea mostrata una sola volta
  const [revealed, setRevealed] = useState<{ label: string; password: string } | null>(null);

  // Modifica partner di un account esistente
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPartnerIds, setEditPartnerIds] = useState<string[]>([]);

  function load() {
    return Promise.all([fetchAdminUsers(), fetchAdminPartners()])
      .then(([u, p]) => {
        setUsers(u);
        setPartners(p);
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
      const res = await createAdminUser({ name, email, role, partnerIds: newPartnerIds });
      setRevealed({ label: `Password temporanea per ${res.user.email}`, password: res.temporaryPassword });
      setName("");
      setEmail("");
      setNewPartnerIds([]);
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
      await updateAdminUser(u.id, { partnerIds: editPartnerIds });
      setEditingId(null);
      await load();
    } catch (err) {
      fail(err, "Impossibile salvare i partner.");
    }
  }

  const isInternal = (r: UserRole) => r === "super_admin" || r === "affiliate_manager";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Gestione Team</h1>
        <p className="text-sm text-text-muted mt-1">
          Crea gli account e scegli quali partner può vedere ciascuno. Gli affiliati vedono solo la rete dei partner
          assegnati; Super Admin e Affiliate Manager vedono tutto.
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
            <div>
              <div className="text-xs text-text-muted mb-1.5">Partner visibili da questo account (numero giocatori)</div>
              <PartnerPicker partners={partners} selected={newPartnerIds} onChange={setNewPartnerIds} />
            </div>
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

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {isInternal(u.role) ? (
                    <span className="text-xs text-text-muted">Vede tutti i partner</span>
                  ) : editingId === u.id ? (
                    <div className="w-full space-y-2">
                      <PartnerPicker partners={partners} selected={editPartnerIds} onChange={setEditPartnerIds} />
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
                      {u.partners.length === 0 ? (
                        <span className="text-xs text-amber-400">Nessun partner assegnato: non vede dati di rete</span>
                      ) : (
                        u.partners.map((p) => (
                          <Badge key={p.id} tone="green">
                            {p.name}
                          </Badge>
                        ))
                      )}
                      <button
                        onClick={() => {
                          setEditingId(u.id);
                          setEditPartnerIds(u.partners.map((p) => p.id));
                        }}
                        className="text-xs text-text-muted hover:text-bp-green-light"
                      >
                        Modifica partner
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
