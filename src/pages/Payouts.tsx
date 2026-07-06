import { PlaceholderPage } from "../components/ui/PlaceholderPage";

export function Payouts() {
  return (
    <PlaceholderPage
      title="Pagamenti"
      description="Gestione richieste di payout, metodi di pagamento e storico versamenti."
      plannedSections={[
        "Richiesta payout con soglia minima configurabile",
        "Storico pagamenti con stato (in attesa, elaborato, completato)",
        "Gestione metodi di pagamento per affiliato",
        "Fatture e documentazione fiscale scaricabile",
      ]}
    />
  );
}
