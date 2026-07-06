import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Base path per la pubblicazione su GitHub Pages come project site
  // (https://<utente>.github.io/betpassion-affiliate-hub/). Se il repo
  // su GitHub avra' un nome diverso, aggiornare questo valore di conseguenza.
  base: "/betpassion-affiliate-hub/",
  plugins: [react()],
});
