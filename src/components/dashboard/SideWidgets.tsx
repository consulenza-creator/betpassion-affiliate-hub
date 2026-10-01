import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import type { CommissionEntry, TopLink } from "../../types";

const STATUS_TONE = { paid: "green", approved: "neutral", pending: "warning", rejected: "warning" } as const;

export function TopLinksWidget({ links }: { links: TopLink[] }) {
  return (
    <Card>
      <h3 className="text-sm font-medium mb-4">Top link</h3>
      <div className="space-y-3">
        {links.map((link) => (
          <div key={link.id} className="flex items-center justify-between text-sm">
            <span className="text-text-primary truncate mr-2">{link.name}</span>
            <span className="text-text-muted whitespace-nowrap">{link.clicks.toLocaleString("it-IT")} click</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function LatestCommissionsWidget({ commissions }: { commissions: CommissionEntry[] }) {
  return (
    <Card>
      <h3 className="text-sm font-medium mb-4">Ultime commissioni</h3>
      <div className="space-y-3">
        {commissions.map((c) => (
          <div key={c.id} className="flex items-center justify-between text-sm">
            <div className="min-w-0">
              <div className="truncate">{c.affiliateName}</div>
              <div className="text-xs text-text-muted uppercase">{c.type.replace("_", " ")}</div>
            </div>
            <div className="text-right shrink-0 ml-2">
              <div className="font-medium">€ {c.amount.toFixed(2)}</div>
              <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function QuickAccessWidget() {
  const shortcuts = ["Genera nuovo link", "Richiedi payout", "Scarica materiali", "Invita affiliato"];
  return (
    <Card>
      <h3 className="text-sm font-medium mb-4">Accesso rapido</h3>
      <div className="grid grid-cols-2 gap-2">
        {shortcuts.map((s) => (
          <button
            key={s}
            className="text-xs text-left px-3 py-2 rounded-lg border border-surface-border hover:border-bp-green-light hover:text-bp-green-light transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </Card>
  );
}
