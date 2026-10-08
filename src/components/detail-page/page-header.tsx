import type { ComponentType, ReactNode } from "react";
import { FaTimes } from "react-icons/fa";

type PageHeaderProps = {
  icon?: ComponentType<{ size?: number }>;
  title: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
};

export default function PageHeader({
  icon: Icon,
  title,
  subtitle,
  onClose,
}: PageHeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <Icon size={20} />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-slate-800 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup halaman detail"
        className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-rose-400"
      >
        <FaTimes aria-hidden="true" />
      </button>
    </header>
  );
}
