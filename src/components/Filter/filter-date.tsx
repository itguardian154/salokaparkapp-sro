import Datepicker from "react-tailwindcss-datepicker";
import type { ComponentProps } from "react";

type FilterDateProps = {
  label: string;
  useRange?: boolean;
} & Pick<ComponentProps<typeof Datepicker>, "value" | "onChange">;

export default function FilterDate({
  label,
  value,
  onChange,
  useRange = false,
}: FilterDateProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-200">
        {label}
      </label>

      <Datepicker
        useRange={false}
        asSingle={!useRange}

        value={value}
        displayFormat="DD-MM-YYYY"
        onChange={onChange}
        primaryColor="emerald"
        inputClassName="
          w-full
          px-4
          py-3
          rounded-xl
          border
          border-slate-300
          dark:border-slate-600
          bg-white
          dark:bg-slate-800
          dark:text-white
          text-sm
          focus:ring-2
          focus:ring-emerald-500/20
          focus:border-emerald-500
        "
      />
    </div>
  );
}
