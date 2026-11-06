import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { LoaderCircle, Users } from "lucide-react";
import useDebounce from "@/hooks/use-debounce";
import useCustomer from "../hooks/use-customer";
import type { CustomerRecord } from "../types/customer";

type CustomerSuggestionFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (customer: CustomerRecord) => void;
};

export default function CustomerSuggestionField({
  value,
  onChange,
  onSelect,
}: CustomerSuggestionFieldProps) {
  const [open, setOpen] = useState(false);
  const { dataCustomer, loadingData, setSearchData } = useCustomer();
  const debouncedSearch = useDebounce(value, 400);

  useEffect(() => {
    setSearchData(debouncedSearch);
  }, [debouncedSearch, setSearchData]);

  const suggestions = dataCustomer.filter((customer) =>
    customer.name.toLowerCase().includes(value.toLowerCase().trim()),
  );

  return (
    <div className="relative w-full">
      <Input
        placeholder="Masukkan nama group"
        value={value}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
      />
      {open && value.trim() && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/70">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                <Users className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Data Terdaftar
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Data yang sudah terdaftar pada master
                </p>
              </div>
            </div>
            {!loadingData && suggestions.length > 0 && (
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-400">
                {suggestions.length} hasil
              </span>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto p-1.5">
            {loadingData ? (
              <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-slate-500 dark:text-slate-400">
                <LoaderCircle className="h-4 w-4 animate-spin text-emerald-600" />
                Mencari customer...
              </div>
            ) : suggestions.length === 0 ? (
              <div className="px-3 py-5 text-center">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Belum ada customer yang cocok
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Nama yang diketik tetap bisa digunakan secara manual.
                </p>
              </div>
            ) : (
              suggestions.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  className="group flex w-full items-start justify-between gap-3 rounded-lg px-3 py-0 text-left transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:bg-emerald-950/40"
                  onClick={() => {
                    onSelect(customer);
                    setOpen(false);
                  }}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-800 group-hover:text-emerald-800 dark:text-slate-100 dark:group-hover:text-emerald-200">
                      {customer.name}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      {customer.phone && (
                        <span className="inline-flex items-center gap-1">
                          {customer.phone}
                        </span>
                      )}
                    </span>
                  </span>
                  {customer.segment?.name && (
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {customer.segment.name}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
