import { useEffect, useRef, useState } from "react";
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
import useDebounce from "@/hooks/use-debounce";

type SelectedPopoverItem = {
  id: string;
  name: ReactNode;
};

type SearchablePopoverProps<T> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search?: string;
  onSearchChange?: (search: string) => void;
  placeholder?: string;
  selectedLabel?: string | null;
  selectedKey?: string | null;
  emptyText?: string;
  items?: T[];
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string;
  onSelect?: (item: T) => void;
  disabled?: boolean;
  multi?: boolean;
  selected?: SelectedPopoverItem[];
  onMultiSelect?: (items: SelectedPopoverItem[]) => void;
  debounceDelay?: number;
};

export default function SearchablePopover<T>({
  open,
  onOpenChange,
  search,
  onSearchChange,
  placeholder,
  selectedLabel,
  selectedKey,
  emptyText = "Tidak ditemukan",
  items = [],
  renderItem,
  getKey,
  onSelect,
  disabled = false,
  multi = false,
  selected = [],
  onMultiSelect,
  debounceDelay = 600,
}: SearchablePopoverProps<T>) {
  const [searchValue, setSearchValue] = useState(search ?? "");
  const onSearchChangeRef = useRef(onSearchChange);

  // Debounce pencarian
  const debouncedSearch = useDebounce(searchValue, debounceDelay);

  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  }, [onSearchChange]);

  useEffect(() => {
    setSearchValue(search ?? "");
  }, [search]);

  useEffect(() => {
    if (debouncedSearch !== (search ?? "")) {
      onSearchChangeRef.current?.(debouncedSearch);
    }
  }, [debouncedSearch, search]);

  return (
    <Popover
      open={disabled ? false : open}
      onOpenChange={disabled ? () => {} : onOpenChange}
    >
      <PopoverTrigger
        type="button"
        disabled={disabled}
        className={`flex h-10 w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors dark:border-slate-700 dark:bg-slate-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20
      ${
        disabled
          ? "cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-700 dark:text-slate-500 opacity-90"
          : "cursor-pointer bg-white hover:bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-input dark:hover:bg-slate-700"
      }`}
      >
          <span
            className={
              multi
                ? selected.length
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400"
                : selectedLabel
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400"
            }
          >
            {multi
              ? selected.length
                ? selected.map((i) => i.name).join(", ")
                : placeholder
              : selectedLabel || placeholder}
          </span>

          <FaChevronDown className="text-xs text-slate-400" />
      </PopoverTrigger>

      <PopoverContent
        className="w-(--anchor-width) p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-999999"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Cari data di sini..."
            value={searchValue}
            onValueChange={setSearchValue}
            className="h-9 border-none focus:ring-0 bg-transparent"
          />

          <CommandList className="max-h-62.5 overflow-y-auto">
            {items.length > 0 ? (
              <CommandGroup>
                {items.map((item) => {
                  const checked = multi
                    ? selected.some((s) => s.id === getKey(item))
                    : selectedKey === getKey(item);

                  return (
                    <CommandItem
                      key={getKey(item)}
                      onSelect={() => {
                        if (!multi) {
                          onSelect?.(item);
                          return;
                        }

                        const id = getKey(item);
                        const name = renderItem(item);

                        const exists = selected.some((s) => s.id === id);

                        if (exists) {
                          onMultiSelect?.(
                            selected.filter((s) => s.id !== id),
                          );
                        } else {
                          onMultiSelect?.([...selected, { id, name }]);
                        }
                      }}
                      className={`rounded-md px-3 py-2 text-sm cursor-pointer
                      aria-selected:bg-blue-50
                      dark:aria-selected:bg-slate-800
                      aria-selected:text-blue-600
                      dark:aria-selected:text-blue-400
                      ${
                        checked
                          ? "rounded-md bg-slate-200 dark:bg-slate-800 dark:text-blue-400"
                          : ""
                      }
                    `}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>{renderItem(item)}</div>

                        {checked && (
                          <FaCheck className="w-3 h-3 text-green-600" />
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
  );
}
