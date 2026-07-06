import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { MEDIA_ASSETS } from "../data/mockMediaAssets";
import { MediaAssetCard } from "../components/marketing/MediaAssetCard";
import { LibraryFiltersBar } from "../components/marketing/LibraryFiltersBar";
import { AssetCustomizerPanel } from "../components/marketing/AssetCustomizerPanel";
import { AdminUploadForm } from "../components/marketing/AdminUploadForm";
import type { AssetType, MediaAsset } from "../types";

export function MarketingCenter() {
  const { currentUser } = useAuth();
  const [activeType, setActiveType] = useState<AssetType | "all">("all");
  const [search, setSearch] = useState("");
  const [customizing, setCustomizing] = useState<MediaAsset | null>(null);

  const filteredAssets = useMemo(() => {
    return MEDIA_ASSETS.filter((asset) => {
      const matchesType = activeType === "all" || asset.type === activeType;
      const matchesSearch = asset.title.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [activeType, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Marketing Center</h1>
        <p className="text-sm text-text-muted mt-1">
          Libreria materiali marketing pronti all'uso: banner, landing page, video e creative social.
        </p>
      </div>

      {currentUser.role === "super_admin" && <AdminUploadForm />}

      <LibraryFiltersBar
        activeType={activeType}
        onTypeChange={setActiveType}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="grid grid-cols-4 gap-4">
        {filteredAssets.map((asset) => (
          <MediaAssetCard key={asset.id} asset={asset} onCustomize={setCustomizing} />
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-sm text-text-muted text-center py-12">
          Nessun asset corrisponde ai filtri selezionati.
        </div>
      )}

      <AssetCustomizerPanel asset={customizing} onClose={() => setCustomizing(null)} />
    </div>
  );
}
