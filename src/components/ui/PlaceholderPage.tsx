import { Card } from "./Card";

interface Props {
  title: string;
  description: string;
  plannedSections: string[];
}

// Pagina segnaposto strutturata: da sostituire con l'implementazione reale
// mantenendo titolo/descrizione/sezioni come guida per lo sviluppo.
export function PlaceholderPage({ title, description, plannedSections }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-text-muted mt-1">{description}</p>
      </div>

      <Card>
        <h3 className="text-sm font-medium mb-3">Sezioni pianificate</h3>
        <ul className="space-y-2 text-sm text-text-muted list-disc list-inside">
          {plannedSections.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
