import { Search } from "lucide-react";
import type { AssetType } from "../../types";

const TYPE_FILTERS: { id: AssetType | "all"; label: string }[] = [
  { id: "all", label: "Tutti" },
  { id: "banner", label: "Banner" },
  { id: "landing_page", label: "Landing Page" },
  { id: "video", label: "Video" },
  { id: "logo", label: "Logo" },
  { id: "social_creative", label: "Social Creative" },
];

interface Props {
  activeType: AssetType | "all";
  onTypeChange: (type: AssetType | "all") => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export function LibraryFiltersBar({ activeType, onTypeChange, search, onSearchChange }: Props) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex gap-1 flex-wrap">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => onTypeChange(f.id)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              activeType === f.id
                ? "bg-bp-green-light text-bp-black font-medium"
                : "text-text-muted border border-surface-border hover:border-bp-green-light"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cerca asset..."
          className="bg-surface-raised border border-surface-border rounded-md pl-8 pr-3 py-1.5 text-sm w-56 outline-none focus:border-bp-green-light"
        />
      </div>
    </div>
  );
}
