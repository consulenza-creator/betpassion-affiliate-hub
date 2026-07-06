import { PlaceholderPage } from "../components/ui/PlaceholderPage";

export function Settings() {
  return (
    <PlaceholderPage
      title="Impostazioni"
      description="Configurazione account, sicurezza e preferenze generali."
      plannedSections={[
        "Dati account e profilo",
        "Sicurezza (password, 2FA)",
        "Preferenze di visualizzazione (valuta, lingua)",
        "Gestione API key per integrazioni (Super Admin)",
      ]}
    />
  );
}
