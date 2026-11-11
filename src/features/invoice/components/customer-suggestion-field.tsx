import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { LoaderCircle, Users, X } from "lucide-react";
import useDebounce from "@/hooks/use-debounce";
import useCustomer from "../../customers/hooks/use-customer";
import type { CustomerRecord } from "../../customers/types/customer";

type CustomerSuggestionFieldProps = {
  value: string;
  onAddTextTag: (value: string) => void;
  onSelect: (customer: CustomerRecord) => void;
  tags?: { id: string; label: string; onRemove: () => void }[];
  onReorderTags?: (ids: string[]) => void;
  plainText?: boolean;
  onPlainTextChange?: (value: string) => void;
  onClearPlainText?: () => void;
  segmentId?: number | null;
};

export default function CustomerSuggestionField({
  value,
  onAddTextTag,
  onSelect,
  tags = [],
  onReorderTags,
  plainText = false,
  onPlainTextChange,
  onClearPlainText,
}: CustomerSuggestionFieldProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const fieldRef = useRef<HTMLDivElement>(null);
  const selectingCustomer = useRef(false);
  const { dataCustomer, loadingData, setSearchData } = useCustomer();
  const searchQuery = [value, text].filter(Boolean).join(" ").trim();
  const debouncedSearch = useDebounce(searchQuery, 400);

  useEffect(() => {
    setSearchData(debouncedSearch);
  }, [debouncedSearch, setSearchData]);

  useEffect(() => {
    setText("");
    if (selectingCustomer.current) {
      selectingCustomer.current = false;
      return;
    }
    if (value.trim()) setOpen(true);
  }, [value]);

  useEffect(() => {
    if (!open) return;

    const handleOutsidePointer = (event: PointerEvent) => {
      if (!fieldRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", handleOutsidePointer);
  }, [open]);

  return (
    <div ref={fieldRef} className="relative w-full">
      <div
        className={
          tags.length > 0
            ? "min-h-10 w-full rounded-lg border border-input bg-white px-2 py-1.5 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 dark:bg-slate-900"
            : "w-full"
        }
      >
        {!plainText && tags.length > 0 && (
          <div className="mb-1 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag.id}
                draggable={Boolean(onReorderTags)}
                title={onReorderTags ? "Seret tag untuk mengubah urutan" : undefined}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/tag-id", tag.id);
                  event.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const draggedId = event.dataTransfer.getData("text/tag-id");
                  if (!draggedId || draggedId === tag.id) return;
                  const ids = tags.map((item) => item.id);
                  const from = ids.indexOf(draggedId);
                  const to = ids.indexOf(tag.id);
                  if (from < 0 || to < 0) return;
                  ids.splice(from, 1);
                  ids.splice(to, 0, draggedId);
                  onReorderTags?.(ids);
                }}
                className="inline-flex cursor-grab items-center gap-1 rounded-lg bg-slate-900 px-2 text-xs font-medium text-white active:cursor-grabbing dark:bg-slate-100 dark:text-slate-900"
              >
                {tag.label}
                <button
                  type="button"
                  aria-label={`Hapus ${tag.label}`}
                  onClick={tag.onRemove}
                  className="rounded-lg p-0.5 opacity-80 transition hover:bg-white/20 hover:opacity-100 dark:hover:bg-slate-900/15"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        <Input
          className={plainText ? "pr-10" : tags.length ? "h-8 border-0 px-1 shadow-none focus-visible:ring-0" : undefined}
          placeholder={!plainText && tags.length ? "Ketik nama di sini" : "Ketik nama group"}
          value={plainText ? value : text}
          readOnly={plainText}
          onFocus={() => setOpen(true)}
          onBlur={(event) => {
            const nextFocusedElement = event.relatedTarget;
            if (
              !(nextFocusedElement instanceof Node) ||
              !fieldRef.current?.contains(nextFocusedElement)
            ) {
              setOpen(false);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (!plainText && event.key === "Enter" && text.trim()) {
              event.preventDefault();
              onAddTextTag(text.trim());
              setText("");
              setOpen(true);
            }
          }}
          onChange={(event) => {
            if (plainText) {
              onPlainTextChange?.(event.target.value);
            } else {
              setText(event.target.value);
            }
            setOpen(true);
          }}
        />
        {plainText && (
          <button
            type="button"
            aria-label="Hapus customer terpilih"
            onClick={onClearPlainText}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {open && searchQuery.trim() && (
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
            <div className="flex items-center gap-2">
              {!loadingData && dataCustomer.length > 0 && (
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-400">
                  {dataCustomer.length} hasil
                </span>
              )}
              <button
                type="button"
                aria-label="Tutup saran customer"
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1.5">
            {loadingData ? (
              <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-slate-500 dark:text-slate-400">
                <LoaderCircle className="h-4 w-4 animate-spin text-emerald-600" />
                Mencari customer...
              </div>
            ) : dataCustomer.length === 0 ? (
              <div className="px-3 py-5 text-center">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Belum ada customer yang cocok
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Nama yang diketik tetap bisa digunakan secara manual.
                </p>
              </div>
            ) : (
              dataCustomer.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  className="group flex w-full items-start justify-between gap-3 rounded-lg px-3 py-0 text-left transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:bg-emerald-950/40"
                  onClick={() => {
                    selectingCustomer.current = true;
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
