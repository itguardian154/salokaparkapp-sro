import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FilterSelectOption = {
  value: string;
  label: string;
};

type FilterSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options?: FilterSelectOption[];
};

export default function FilterSelect({
  label,
  value,
  onChange,
  placeholder = "Pilih",
  options = [],
}: FilterSelectProps) {
  return (
    <div className="space-y-2">
      <label
        className="
        mb-2
          text-xs
          font-medium
          text-slate-500
          dark:text-slate-200
          "
      >
        {label}
      </label>
      <div className="mt-1.5">
        <Select
          value={value || ""}
          onValueChange={(val) => onChange(!val || val === "all" ? "" : val)}
        >
          <SelectTrigger
            className={`rounded-lg w-full ${
              !value ? "text-slate-500 " : "text-slate-900 dark:text-slate-200"
            }`}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>

          <SelectContent
            align="start"
            alignItemWithTrigger={false}
            sideOffset={4}
          >
            <SelectItem
              value="all"
              className="
                      cursor-pointer
                      rounded-md
                      text-sm
                      font-medium
                      text-slate-600
                      hover:bg-slate-200
                      aria-selected:bg-slate-200
                      aria-selected:text-slate-700
                      dark:bg-slate-800
                      dark:text-slate-300
                      dark:hover:bg-slate-700
                      dark:aria-selected:bg-slate-700
                    "
            >
              {placeholder}
            </SelectItem>

            {options.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
