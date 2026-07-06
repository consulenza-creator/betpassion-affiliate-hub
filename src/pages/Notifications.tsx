import { PlaceholderPage } from "../components/ui/PlaceholderPage";

export function Notifications() {
  return (
    <PlaceholderPage
      title="Notifiche"
      description="Centro notifiche completo, oltre al dropdown rapido presente in Topbar."
      plannedSections={[
        "Elenco completo notifiche con filtri (commissioni, rete, sistema)",
        "Preferenze di notifica (email, in-app, entrambe)",
        "Segna come letto / archivia",
      ]}
    />
  );
}
