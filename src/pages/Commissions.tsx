import { PlaceholderPage } from "../components/ui/PlaceholderPage";

export function Commissions() {
  return (
    <PlaceholderPage
      title="Commissioni"
      description="Dettaglio e storico delle commissioni: CPA, RevShare, Hybrid, bonus manuali, override di rete."
      plannedSections={[
        "Tabella commissioni filtrabile per tipo, periodo, stato",
        "Dettaglio calcolo per singola commissione (piano applicato, base di calcolo)",
        "Vista aggregata per affiliato e per sotto-rete",
        "Export dati per riconciliazione contabile",
      ]}
    />
  );
}
