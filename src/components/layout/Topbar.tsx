import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell, ChevronDown } from "lucide-react";
import { useAuth, ROLE_LABELS } from "../../context/AuthContext";
import type { UserRole } from "../../types";

const ALL_ROLES: UserRole[] = [
  "super_admin",
  "affiliate_manager",
  "master_affiliate",
  "affiliate_standard",
];

export function Topbar() {
  const { currentUser, setRole } = useAuth();

  return (
    <header className="h-16 border-b border-surface-border bg-surface-base flex items-center justify-between px-6">
      <div className="text-sm text-text-muted">
        Vista corrente: <span className="text-text-primary font-medium">{ROLE_LABELS[currentUser.role]}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Role switcher — solo per demo/prototipo, in produzione il ruolo arriva dall'auth reale */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border border-surface-border hover:bg-surface-raised transition-colors">
              Cambia ruolo <ChevronDown size={14} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="bg-surface-raised border border-surface-border rounded-md shadow-lg py-1 min-w-[180px]"
              sideOffset={6}
            >
              {ALL_ROLES.map((role) => (
                <DropdownMenu.Item
                  key={role}
                  onSelect={() => setRole(role)}
                  className="px-3 py-2 text-sm cursor-pointer outline-none hover:bg-bp-green-light/10 hover:text-bp-green-light"
                >
                  {ROLE_LABELS[role]}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Notifiche */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="relative p-2 rounded-md hover:bg-surface-raised transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-bp-green-light" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="bg-surface-raised border border-surface-border rounded-md shadow-lg py-2 w-72"
              sideOffset={6}
              align="end"
            >
              <div className="px-3 pb-2 text-xs font-medium text-text-muted uppercase tracking-wide">
                Notifiche recenti
              </div>
              {[
                "Nuova commissione CPA approvata",
                "3 nuovi affiliati nella tua rete",
                "Pagamento mensile elaborato",
              ].map((note, i) => (
                <div key={i} className="px-3 py-2 text-sm hover:bg-surface-base/60 cursor-pointer">
                  {note}
                </div>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <div className="w-8 h-8 rounded-full bg-bp-green-light flex items-center justify-center text-xs font-semibold text-bp-black">
          {currentUser.avatarInitials}
        </div>
      </div>
    </header>
  );
}
