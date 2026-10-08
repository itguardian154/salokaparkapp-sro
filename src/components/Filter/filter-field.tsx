import type { ReactNode } from "react";

type FilterFieldProps = {
  label: string;
  children: ReactNode;
};

export default function FilterField({
  label,
  children,
}: FilterFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </label>

      {children}
    </div>
  );
}
