# Betpassion Affiliate Hub — Prototipo Frontend

Leggi prima `CONTEXT.md` per tutto il contesto di progetto (decisioni, stato, regole operative).

## Setup
```bash
npm install
npm run dev
```

## Stato
- Layout completo (Sidebar, Topbar, routing 11 pagine)
- Affiliate Dashboard: completa
- Marketing Center / Media Library: completa (mock data 14 asset, filtri, personalizzazione, upload Super Admin)
- Altre 9 pagine: struttura + sezioni pianificate, da sviluppare

## Note tecniche
- Tailwind v4 CSS-first: tema in `src/index.css` (`@theme`), NON in `tailwind.config.js`
- Componenti UI in stile shadcn costruiti a mano da primitive Radix (`src/components/ui`)
- Ruolo utente mock cambiabile dalla Topbar per testare le 4 viste
