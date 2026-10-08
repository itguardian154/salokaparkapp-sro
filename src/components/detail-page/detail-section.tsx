import type { ComponentType, ReactNode } from "react";
import DetailSectionHeader from "./detail-section-header";

export type DetailSectionVariant = "blue" | "orange" | "green";

type DetailSectionProps = {
  children?: ReactNode;
  icon?: ComponentType<{ size?: number }>;
  title?: ReactNode;
  action?: ReactNode;
  variant?: DetailSectionVariant;
  className?: string;
  headerClassName?: string;
};

export default function DetailSection({
  children,
  icon,
  title,
  action,
  variant = "blue",
  className = "",
  headerClassName = "",
}: DetailSectionProps) {
  return (
    <section
      className={`overflow-visible rounded-3xl border border-slate-200 bg-white shadow-[0_8px_40px_rgba(15,23,42,0.06)] dark:border-slate-700/70 dark:bg-slate-900 ${className}`}
    >
      {(title || icon || action) && (
        <div className={headerClassName}>
          <DetailSectionHeader
            icon={icon}
            title={title}
            action={action}
            variant={variant}
          />
        </div>
      )}

      {children}
    </section>
  );
}
