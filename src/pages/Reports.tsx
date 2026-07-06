import { PlaceholderPage } from "../components/ui/PlaceholderPage";

export function Reports() {
  return (
    <PlaceholderPage
      title="Report & Analytics"
      description="Analisi approfondite su traffico, conversioni e ricavi, con schema analytics partizionato lato backend."
      plannedSections={[
        "Report personalizzabili per intervallo di date e dimensione",
        "Confronto periodo su periodo",
        "Funnel di conversione (click → registrazione → FTD → deposito ricorrente)",
        "Export CSV/Excel programmabile",
      ]}
    />
  );
}
