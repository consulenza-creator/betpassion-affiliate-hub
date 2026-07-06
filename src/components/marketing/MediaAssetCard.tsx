import { Image, Video, FileText, Layers } from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import type { MediaAsset } from "../../types";

const TYPE_ICON = {
  banner: Image,
  landing_page: FileText,
  video: Video,
  logo: Layers,
  social_creative: Image,
} as const;

const TYPE_LABEL: Record<MediaAsset["type"], string> = {
  banner: "Banner",
  landing_page: "Landing Page",
  video: "Video",
  logo: "Logo",
  social_creative: "Social Creative",
};

interface Props {
  asset: MediaAsset;
  onCustomize: (asset: MediaAsset) => void;
}

export function MediaAssetCard({ asset, onCustomize }: Props) {
  const Icon = TYPE_ICON[asset.type];

  return (
    <Card className="flex flex-col gap-3">
      {/* Anteprima mock — placeholder colore, in attesa di asset reali dal backend media */}
      <div
        className="h-28 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${asset.thumbnailColor}22` }}
      >
        <Icon size={28} color={asset.thumbnailColor} />
      </div>

      <div>
        <div className="text-sm font-medium truncate">{asset.title}</div>
        <div className="text-xs text-text-muted mt-0.5">{asset.format}</div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge tone="neutral">{TYPE_LABEL[asset.type]}</Badge>
        <Badge tone="neutral">{asset.language.toUpperCase()}</Badge>
      </div>

      <button
        onClick={() => onCustomize(asset)}
        className="mt-1 text-xs font-medium text-bp-green-light hover:underline text-left"
      >
        Personalizza →
      </button>
    </Card>
  );
}
