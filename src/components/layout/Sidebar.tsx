import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Link2,
  Wallet,
  Image,
  Users,
  BarChart3,
  Settings,
  FileText,
  Network,
  Bell,
  LifeBuoy,
} from "lucide-react";

const NAV_ITEMS: { to: string; label: string; icon: typeof LayoutDashboard; adminOnly?: boolean }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/links", label: "Link & Tracking", icon: Link2 },
  { to: "/commissions", label: "Commissioni", icon: Wallet },
  { to: "/marketing", label: "Marketing Center", icon: Image },
  { to: "/network", label: "Rete Affiliati", icon: Network },
  { to: "/reports", label: "Report & Analytics", icon: BarChart3 },
  { to: "/payouts", label: "Pagamenti", icon: FileText },
  { to: "/team", label: "Gestione Team", icon: Users, adminOnly: true },
  { to: "/notifications", label: "Notifiche", icon: Bell },
  { to: "/support", label: "Assistenza", icon: LifeBuoy },
  { to: "/settings", label: "Impostazioni", icon: Settings },
];

export function Sidebar() {
  const { currentUser } = useAuth();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || currentUser?.role === "super_admin");

  return (
    <aside className="w-[260px] shrink-0 bg-surface-sidebar border-r border-surface-border flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-surface-border">
        <span className="font-bold tracking-wide text-lg">
          <span className="text-bp-gray-light">BET</span>
          <span className="text-bp-green-light">PASSION</span>
        </span>
        <span className="ml-2 text-xs text-text-muted">Affiliate Hub</span>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-6 py-2.5 text-sm transition-colors",
                isActive
                  ? "sidebar-active-rail bg-surface-raised text-text-primary"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-raised/60",
              ].join(" ")
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-surface-border text-xs text-text-muted">
        Betpassion Affiliate Hub · v0.1 prototipo
      </div>
    </aside>
  );
}
