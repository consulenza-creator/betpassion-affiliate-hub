import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { Card } from "../ui/Card";
import type { AssetType } from "../../types";

const TYPE_OPTIONS: { id: AssetType; label: string }[] = [
  { id: "banner", label: "Banner" },
  { id: "landing_page", label: "Landing Page" },
  { id: "video", label: "Video" },
  { id: "logo", label: "Logo" },
  { id: "social_creative", label: "Social Creative" },
];

// Visibile solo a Super Admin — vedi AuthContext/role gating in MarketingCenter.tsx
export function AdminUploadForm() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<AssetType>("banner");

  return (
    <Card>
      <h3 className="text-sm font-medium mb-4">Carica nuovo asset (Super Admin)</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs text-text-muted block mb-1">Titolo asset</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="es. Banner Bonus Estate 2026"
            className="w-full bg-surface-base border border-surface-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-bp-green-light"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Tipo asset</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as AssetType)}
            className="w-full bg-surface-base border border-surface-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-bp-green-light"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-2 border-dashed border-surface-border rounded-lg h-28 flex flex-col items-center justify-center gap-2 text-text-muted text-sm">
        <UploadCloud size={22} />
        Trascina il file qui o clicca per selezionarlo
      </div>

      <div className="flex justify-end mt-4">
        <button className="text-sm px-4 py-1.5 rounded-md bg-bp-green-light text-bp-black font-medium">
          Pubblica asset
        </button>
      </div>
    </Card>
  );
}
