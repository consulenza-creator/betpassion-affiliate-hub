import { PlaceholderPage } from "../components/ui/PlaceholderPage";

export function Network() {
  return (
    <PlaceholderPage
      title="Rete Affiliati"
      description="Gestione della gerarchia: Affiliate Manager, Master Affiliate, Affiliate Standard."
      plannedSections={[
        "Albero gerarchico della rete con drill-down",
        "Dettaglio performance per singolo affiliato/sotto-rete",
        "Gestione inviti e onboarding nuovi affiliati",
        "Override commissioni di rete per Master Affiliate",
      ]}
    />
  );
}
