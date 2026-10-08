import type { ChangeEventHandler, ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import { FaFilter } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";

type FilterBarProps = {
  search: string;
  onSearchChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  active?: boolean;
  children?: ReactNode;
  onReset?: () => void;
};

export default function FilterBar({
  search,
  onSearchChange,
  placeholder = "Cari data disini...",
  active = false,
  children,
  onReset,
}: FilterBarProps) {
  // Cek apakah ada isi filter
  const hasFilter = !!children;

  return (
    <div className="relative flex w-full gap-3">
      {/* Search + Filter */}
      <div className="relative flex-1">
        <input
          type="text"
          value={search}
          onChange={onSearchChange}
          placeholder={placeholder}
          className="
            w-full
            pl-5
            pr-14
            py-2.5
            rounded-full
            border
            border-slate-200
            dark:border-slate-600
            bg-slate-50
            dark:bg-slate-700
            text-sm
            shadow-sm
            transition
            focus:outline-none
            focus:ring-2
            focus:ring-emerald-500/20
            focus:border-emerald-500
          "
        />

        {/* Filter */}
        {hasFilter ? (
          <Popover>
            <PopoverTrigger
              className="
                  absolute
                  right-1
                  top-1/2
                  -translate-y-1/2
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-primer-60
                  text-white
                  shadow-md
                  transition
                  hover:bg-primer-80
                  focus:outline-none
                  focus:ring-2
                  focus:ring-primer-80/30
                "
            >
                <FaFilter className="h-3.5 w-3.5" />

                {active && (
                  <span
                    className="
                      absolute
                      -right-1
                      -top-1
                      h-3
                      w-3
                      rounded-full
                      border-2
                      border-white
                      bg-red-500
                    "
                  />
                )}
            </PopoverTrigger>

            <PopoverContent
              align="end"
              sideOffset={10}
              className="
              lg:w-150
              rounded-2xl
              p-4
              space-y-1
              bg-white
              dark:bg-slate-700
            "
          >
            {children}

              {onReset && (
                <div
                  className="
                    flex
                    justify-end
                    border-t
                    pt-3
                  "
                >
                  <Button size="sm" variant="ghost" onClick={onReset}>
                    Reset
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        ) : (
          /* Tidak ada filter */
          <button
            type="button"
            className="
                  absolute
                  right-1
                  top-1/2
                  -translate-y-1/2
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-500
                  text-white
                  shadow-md
                  transition
                  hover:bg-emerald-600
                  focus:outline-none
                  focus:ring-2
                  focus:ring-emerald-500/30
                "
            title="Tidak ada filter"
          >
            <FaSearch className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
