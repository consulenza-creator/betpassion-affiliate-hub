import { useState, FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth, ApiError } from "../context/AuthContext";
import { Card } from "../components/ui/Card";

export function ChangePassword() {
  const { currentUser, loading, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError("La nuova password deve avere almeno 8 caratteri.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Le due password non coincidono.");
      return;
    }
    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossibile contattare il server. Riprova.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full bg-surface-base border border-surface-border rounded-md px-3 py-2 text-sm outline-none focus:border-bp-green-light";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-xl font-bold">
            BET<span className="text-bp-green-light">PASSION</span>
          </span>
          <p className="text-sm text-text-muted mt-1">Affiliate Hub</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-text-muted">
              {currentUser.mustChangePassword
                ? "Per continuare scegli una nuova password al posto di quella temporanea."
                : "Scegli una nuova password."}
            </p>

            <div>
              <label htmlFor="current" className="block text-xs text-text-muted mb-1.5">
                Password attuale (o temporanea)
              </label>
              <input
                id="current"
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="new" className="block text-xs text-text-muted mb-1.5">
                Nuova password (almeno 8 caratteri)
              </label>
              <input
                id="new"
                type="password"
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-xs text-text-muted mb-1.5">
                Ripeti la nuova password
              </label>
              <input
                id="confirm"
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputClass}
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 bg-bp-green-light text-bp-black font-medium text-sm rounded-md py-2.5 hover:bg-bp-green-dark transition-colors disabled:opacity-60"
            >
              {submitting ? "Salvataggio..." : "Salva nuova password"}
            </button>
            <button type="button" onClick={logout} className="text-xs text-text-muted hover:text-text-primary">
              Esci
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
