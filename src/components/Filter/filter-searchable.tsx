import type { ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FaChevronDown, FaCheck } from "react-icons/fa6";

type FilterSearchableProps<T> = {
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  selectedLabel?: string | null;
  selectedKey?: string | null;
  emptyText?: string;
  items?: T[];
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string;
  onSelect: (item: T | null) => void;
  disabled?: boolean;
};

export default function FilterSearchable<T>({
  label,
  open,
  onOpenChange,
  search,
  onSearchChange,
  placeholder = "Pilih",
  selectedLabel,
  selectedKey,
  emptyText = "Tidak ditemukan",
  items = [],
  renderItem,
  getKey,
  onSelect,
  disabled = false,
}: FilterSearchableProps<T>) {
  return (
    <div className="space-y-1.5">
      {/* Label sama seperti FilterSelect */}
      <label className="text-xs font-medium text-slate-500 dark:text-slate-200">
        {label}
      </label>

      <Popover
        open={disabled ? false : open}
        onOpenChange={disabled ? () => {} : onOpenChange}
      >
        <PopoverTrigger
          disabled={disabled}
          className={`flex h-10 w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition-colors
            ${
              disabled
                ? "cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-700 dark:text-slate-500 opacity-90"
                : "cursor-pointer bg-white hover:bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-input dark:hover:bg-slate-700"
            }`}
        >
            <span
              className={
                selectedLabel
                  ? "truncate text-slate-900 dark:text-white"
                  : "truncate text-slate-500 dark:text-slate-400"
              }
            >
              {selectedLabel || placeholder}
            </span>

            <FaChevronDown className="ml-2 shrink-0 text-xs text-slate-400" />
        </PopoverTrigger>

        <PopoverContent
          className="z-999999 w-[--radix-popover-trigger-width] border border-slate-200 bg-white p-0 shadow-xl dark:border-slate-800 dark:bg-slate-900"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Cari data disini..."
              value={search}
              onValueChange={onSearchChange}
              className="h-9 border-none bg-transparent focus:ring-0"
            />

            <CommandList className="max-h-62.5 overflow-y-auto">
              {items.length > 0 ? (
                <CommandGroup>
                  {/* Semua */}
                  <CommandItem
                    value="all"
                    onSelect={() => onSelect(null)}
                    className="
                      cursor-pointer
                      rounded-md
                      mx-1
                      my-1
                      px-3
                      py-2
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
                    <div className="flex w-full items-center justify-between">
                      <span>{placeholder}</span>

                      {!selectedKey && (
                        <FaCheck className="h-3 w-3 text-green-600" />
                      )}
                    </div>
                  </CommandItem>

                  {items.map((item) => {
                    const key = getKey(item);
                    const isSelected = selectedKey === key;

                    return (
                      <CommandItem
                        key={key}
                        value={key}
                        onSelect={() => onSelect(item)}
                        className={`
                          cursor-pointer rounded-md px-3 py-2 text-sm
                          aria-selected:bg-blue-50
                          aria-selected:text-blue-600
                          dark:aria-selected:bg-slate-800
                          dark:aria-selected:text-blue-400
                          ${
                            isSelected
                              ? "bg-slate-200 dark:bg-slate-800 dark:text-blue-400"
                              : ""
                          }
                        `}
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="truncate">{renderItem(item)}</div>

                          {isSelected && (
                            <FaCheck className="ml-2 h-3 w-3 shrink-0 text-green-600" />
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ) : (
                <CommandEmpty>{emptyText}</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
