# Betpassion Affiliate Hub — Contesto di Progetto

## Cos'è
Piattaforma proprietaria di affiliate management per Betpassion.it (iGaming/scommesse sportive, mercato italiano), pensata per sostituire soluzioni terze (in particolare Income Access) con un sistema interamente di proprietà per gestire reti di affiliati, tracking performance, calcolo commissioni e distribuzione materiali marketing.

## Decisioni strategiche chiave (già prese, non rimetterle in discussione)
- **Tracking proprietario basato su webhook**, non Income Access → per mantenere piena ownership dei dati. Income Access è stato valutato ed esplicitamente scartato come layer dati.
- Gerarchia utenti: **Super Admin → Affiliate Manager → Master Affiliate → Affiliate Standard**
- Tipi di commissione: CPA, RevShare, Hybrid, bonus manuali, override di rete
- Competitor di riferimento analizzati: Income Access, NetRefer, Affilka, ReferOn, Impact.com, Amazon Associates

## Stack tecnico
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS v4 (config CSS-first via `@tailwindcss/postcss`, NON il vecchio `tailwind.config.js` di v3) + Radix UI primitives (componenti shadcn-style **costruiti a mano**, non installati via CLI) + Lucide React + Recharts
- **Backend (pianificato)**: NestJS, architettura monolito-modulare, PostgreSQL 15+ con schema analytics partizionato
- **Integrazione**: webhook tracking verso Betpassion.it
- **Design reference**: Figma per handoff

## Stato attuale del prototipo frontend
Scaffolding funzionante e confermato, con:
- Mock auth/role context, routing su 11 route totali, sidebar dark 260px con accent rail attivo, topbar con role switcher e dropdown notifiche
- **Affiliate Dashboard completa**: hero section, 9 KPI card con badge delta, grafico performance interattivo con filtri periodo, widget top links, widget ultime commissioni, widget notifiche, shortcut di accesso rapido
- **In lavorazione (interrotto a metà)**: Marketing Center / Media Library — mock data per 14 asset, `MediaAssetCard`, `AssetCustomizerPanel` con anteprima mock live, `LibraryFiltersBar`, `AdminUploadForm` per ruolo Super Admin

## Prossimi passi (roadmap)
1. Completare Marketing Center / Media Library
2. Costruire le restanti schermate frontend (11 route totali, tutte e 4 le viste ruolo)
3. Backend NestJS + PostgreSQL
4. Layer di integrazione webhook con Betpassion.it
5. Fase beta ed eventuale rilascio produzione (roadmap 6–7 mesi)

## Regole operative da rispettare sempre
- **Modifiche chirurgiche**: intervenire solo sulle parti di codice direttamente coinvolte dalla richiesta. Non toccare, riformattare o "migliorare" altre sezioni.
- **Zero effetti collaterali**: non aggiungere/rimuovere/spostare nulla fuori dallo scope esplicito. Problemi notati altrove → segnalarli a parole, non correggerli senza autorizzazione esplicita.
- **Riepilogo obbligatorio** a fine intervento, in questo formato:
  - Modificato: descrizione precisa dei blocchi/righe toccati e motivazione tecnica
  - Scope rispettato: sì/no + eventuale nota
  - Note: anomalie rilevate altrove, solo segnalazione
- **Verifica ZIP/archivi**: prima di consegnare un archivio, ispezionarne il contenuto per conferma che rifletta le modifiche descritte.
- shadcn-style components: sempre costruiti a mano da primitive Radix, mai via CLI d'installazione.
- Tailwind v4: config CSS-first, non creare/usare `tailwind.config.js`.

## Da ignorare
Qualsiasi riferimento a un progetto "Marketing Analyzer" non correlato — inserito per errore in passato e scartato esplicitamente.
