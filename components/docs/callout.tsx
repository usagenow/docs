import type { ReactNode } from "react";
import { FlaskIcon, InfoIcon, LockIcon, NoteIcon, WarningIcon } from "@/components/ui/icons";

export type CalloutType = "info" | "note" | "experimental" | "privacy" | "warning";

const presets: Record<CalloutType, { label: string; Icon: typeof InfoIcon }> = {
  info: { label: "Info", Icon: InfoIcon },
  note: { label: "Note", Icon: NoteIcon },
  experimental: { label: "Experimental", Icon: FlaskIcon },
  privacy: { label: "Privacy", Icon: LockIcon },
  warning: { label: "Warning", Icon: WarningIcon },
};

export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}) {
  const { label, Icon } = presets[type];
  return (
    <div className="callout" data-type={type} role="note" aria-label={title ?? label}>
      <p className="callout-title">
        <Icon width={15} height={15} />
        <span>{title ?? label}</span>
      </p>
      <div className="callout-body">{children}</div>
    </div>
  );
}
