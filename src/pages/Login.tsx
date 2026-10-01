import { useState, FormEvent } from "react";
import { useAuth, ApiError } from "../context/AuthContext";
import { Card } from "../components/ui/Card";

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossibile contattare il server. Riprova.");
    } finally {
      setSubmitting(false);
    }
  }

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
            <div>
              <label htmlFor="email" className="block text-xs text-text-muted mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-base border border-surface-border rounded-md px-3 py-2 text-sm outline-none focus:border-bp-green-light"
                placeholder="nome@betpassion.it"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs text-text-muted mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-base border border-surface-border rounded-md px-3 py-2 text-sm outline-none focus:border-bp-green-light"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 bg-bp-green-light text-bp-black font-medium text-sm rounded-md py-2.5 hover:bg-bp-green-dark transition-colors disabled:opacity-60"
            >
              {submitting ? "Accesso in corso..." : "Accedi"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
