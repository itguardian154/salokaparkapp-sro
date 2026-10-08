import type { ComponentType, ReactNode } from "react";
import type { DetailSectionVariant } from "./detail-section";

type DetailSectionHeaderProps = {
  icon?: ComponentType<{ size?: number }>;
  title?: ReactNode;
  action?: ReactNode;
  variant?: DetailSectionVariant;
};

export default function DetailSectionHeader({
  icon: Icon,
  title,
  action,
  variant = "blue",
}: DetailSectionHeaderProps) {
  const variants = {
    blue: {
      icon: "from-sky-500 to-teal-600",
      shadow: "shadow-teal-500/25",
    },

    orange: {
      icon: "from-amber-500 to-orange-600",
      shadow: "shadow-orange-500/25",
    },

    green: {
      icon: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/25",
    },
  };

  const current = variants[variant];

  return (
    <div className="relative overflow-hidden border-b border-slate-100 px-6 py-3 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-xl bg-linear-to-br ${current.icon} text-white shadow-lg ${current.shadow}`}
          >
            {Icon && <Icon size={12} />}
          </div>

          <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h2>
        </div>

        {action}
      </div>
    </div>
  );
}
