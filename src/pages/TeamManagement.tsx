import { PlaceholderPage } from "../components/ui/PlaceholderPage";

export function TeamManagement() {
  return (
    <PlaceholderPage
      title="Gestione Team"
      description="Amministrazione utenti interni e permessi, riservata a Super Admin e Affiliate Manager."
      plannedSections={[
        "Elenco utenti interni con ruolo assegnato",
        "Gestione permessi granulari per modulo",
        "Log delle azioni amministrative",
        "Invito nuovi membri del team",
      ]}
    />
  );
}
