import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactTable, RowData } from "@tanstack/react-table";
import { dataTableFeatures } from "./table-features";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";

interface ColumnVisibilityProps<TData extends RowData> {
  table: ReactTable<typeof dataTableFeatures, TData>;
}

const ColumnVisibility = <TData extends RowData>({
  table,
}: ColumnVisibilityProps<TData>) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        !menuRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => {
          if (!open && ref.current) {
            const bounds = ref.current.getBoundingClientRect();
            setMenuPosition({ top: bounds.bottom, left: bounds.left });
          }
          setOpen((v) => !v);
        }}
        className="
          flex items-center gap-2
          px-3 py-1.5
          text-sm font-medium
          rounded-lg
          border border-slate-200
          bg-white
          text-slate-700
          shadow-sm
          hover:bg-slate-50
          hover:shadow
          transition
          dark:bg-slate-800
          dark:border-slate-700
          dark:text-slate-200
        "
      >
        <HiOutlineAdjustmentsHorizontal className="w-4 h-4 text-slate-500" />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
            }}
            className="
             z-1000 mt-2 w-52
            rounded-md border border-gray-200
            bg-white shadow-lg
            dark:bg-slate-800 dark:border-slate-700
          "
          >
            <div className="p-2 space-y-1">
              {columns.map((column) => (
                <label
                  key={column.id}
                  className="
                  group
                  flex items-center gap-2
                  px-2 py-1.5
                  text-xs cursor-pointer
                  rounded
                  hover:bg-gray-100
                  dark:hover:bg-slate-700
                "
                >
                  <input
                    type="checkbox"
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                    className="peer sr-only"
                  />

                  <span
                    className="
      flex size-4 items-center justify-center
      rounded border border-gray-300 bg-white
      transition
      group-has-checked:border-sky-500
      group-has-checked:bg-sky-500
    "
                  >
                    <svg
                      className="
        size-3 text-white
        opacity-0
        transition-opacity
        group-has-checked:opacity-100
      "
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M5 12l4 4L19 7" />
                    </svg>
                  </span>

                  {typeof column.columnDef.header === "string"
                    ? column.columnDef.header
                    : column.id}
                </label>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default ColumnVisibility;
