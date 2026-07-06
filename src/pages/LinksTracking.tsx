import { PlaceholderPage } from "../components/ui/PlaceholderPage";

export function LinksTracking() {
  return (
    <PlaceholderPage
      title="Link & Tracking"
      description="Generazione e gestione dei link di affiliazione tracciati tramite webhook proprietario."
      plannedSections={[
        "Generatore link (per campagna, per asset, per sub-affiliato)",
        "Tabella link attivi con click/conversioni in tempo reale",
        "Configurazione parametri UTM e sub-ID",
        "Storico eventi webhook (click, registrazione, FTD, deposito)",
      ]}
    />
  );
}
