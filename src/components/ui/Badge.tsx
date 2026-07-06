import { ReactNode } from "react";

type Tone = "green" | "neutral" | "warning";

const TONE_CLASSES: Record<Tone, string> = {
  green: "bg-bp-green-light/15 text-bp-green-light",
  neutral: "bg-surface-border text-text-muted",
  warning: "bg-amber-500/15 text-amber-400",
};

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}
