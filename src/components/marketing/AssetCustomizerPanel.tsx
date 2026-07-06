import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { MediaAsset } from "../../types";

interface Props {
  asset: MediaAsset | null;
  onClose: () => void;
}

// Tracker link di esempio — in produzione generato dal layer webhook proprietario, non da Income Access
const TRACKER_BASE = "https://track.betpassion.it/aff";

export function AssetCustomizerPanel({ asset, onClose }: Props) {
  const [affiliateCode, setAffiliateCode] = useState("AFF1234");
  const [ctaText, setCtaText] = useState("Registrati ora");

  if (!asset) return null;

  const trackedUrl = `${TRACKER_BASE}/${affiliateCode}?asset=${asset.id}`;

  return (
    <Dialog.Root open={!!asset} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-raised border border-surface-border rounded-xl p-6 w-[560px] max-w-[90vw]">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-base font-semibold">Personalizza: {asset.title}</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-text-muted hover:text-text-primary">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Controlli */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted block mb-1">Codice affiliato</label>
                <input
                  value={affiliateCode}
                  onChange={(e) => setAffiliateCode(e.target.value)}
                  className="w-full bg-surface-base border border-surface-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-bp-green-light"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Testo CTA</label>
                <input
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full bg-surface-base border border-surface-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-bp-green-light"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Link tracciato (mock)</label>
                <div className="text-xs bg-surface-base border border-surface-border rounded-md px-3 py-2 break-all text-bp-green-light">
                  {trackedUrl}
                </div>
              </div>
            </div>

            {/* Anteprima live mock */}
            <div>
              <label className="text-xs text-text-muted block mb-1">Anteprima</label>
              <div
                className="rounded-lg h-40 flex flex-col items-center justify-center gap-2 text-center px-4"
                style={{ backgroundColor: `${asset.thumbnailColor}22` }}
              >
                <span className="text-sm font-medium">{asset.title}</span>
                <button
                  className="text-xs px-4 py-1.5 rounded-md font-semibold"
                  style={{ backgroundColor: asset.thumbnailColor, color: "#fff" }}
                >
                  {ctaText}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Dialog.Close asChild>
              <button className="text-sm px-4 py-1.5 rounded-md border border-surface-border text-text-muted hover:text-text-primary">
                Annulla
              </button>
            </Dialog.Close>
            <button className="text-sm px-4 py-1.5 rounded-md bg-bp-green-light text-bp-black font-medium">
              Scarica asset
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
