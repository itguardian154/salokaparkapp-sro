import { CalendarDays, CheckCircle2 } from "lucide-react";
import { formatDateTime, type DateInput } from "@/lib/utils";

export type ActivityItemData = {
  id: string | number;
  primaryText: string;
  secondaryText: string;
  occurredAt: DateInput;
  occurredAtLabel?: string;
  changes: unknown;
  changesTitle?: string;
  action?: string | null;
  detailText?: string;
};

type ActivityItemProps = {
  item: ActivityItemData;
};

// Pemetaan label Bahasa Indonesia untuk properti JSON
const FIELD_LABELS: Record<string, string> = {
  name: "Nama Produk",
  price: "Harga",
  status: "Status Produk",
  status_label: "Status Produk",
  max_qty: "Maks. Qty",
  min_qty: "Min. Qty",
  day_type: "Tipe Hari",
  has_bonus: "Bonus",
  is_active: "Status Aktif",
  is_ticket: "Jenis Produk",
  description: "Deskripsi",
  phone: "No. HP",
  city_name: "Kota/Kabupaten",
  province_name: "Provinsi",
};

// Helper untuk memformat value
function formatFieldValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";

  if (typeof value === "boolean") {
    return value ? "Ya" : "Tidak";
  }

  if (key === "day_type") {
    if (value === "weekday") return "Hari kerja";
    if (value === "weekend") return "Akhir pekan";
  }

  const lowerKey = key.toLowerCase();

  if (
    (lowerKey.includes("price") || lowerKey.includes("harga")) &&
    !isNaN(Number(value))
  ) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value));
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat("id-ID").format(value);
  }

  return String(value);
}

// Komponen tabel perubahan data
function ChangeTable({ changes }: { changes: unknown }) {
  if (!changes || typeof changes !== "object") return null;

  let beforeData: Record<string, any> = {};
  let afterData: Record<string, any> = {};

  const raw = changes as Record<string, any>;

  // Cek apakah data berisi pasangan before/after atau old/new
  if (raw.before || raw.after || raw.old || raw.new) {
    beforeData = raw.before || raw.old || {};
    afterData = raw.after || raw.new || {};
  } else {
    afterData = raw;
  }

  const allKeys = Array.from(
    new Set([...Object.keys(beforeData), ...Object.keys(afterData)])
  ).filter((key) => {
    const valBefore = beforeData[key];
    const valAfter = afterData[key];

    return (
      (valBefore !== null &&
        valBefore !== undefined &&
        valBefore !== "") ||
      (valAfter !== null &&
        valAfter !== undefined &&
        valAfter !== "")
    );
  });

  if (allKeys.length === 0) return null;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full table-fixed text-left text-xs">
        <thead className="border-b border-slate-100 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
          <tr>
            <th className="w-1/3 px-3 py-2">Field</th>
            <th className="w-1/3 px-3 py-2 text-center">Sebelum</th>
            <th className="w-1/3 px-3 py-2 text-center">Sesudah</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {allKeys.map((key) => {
            const label = FIELD_LABELS[key] || key.replace(/_/g, " ");
            const beforeVal = formatFieldValue(key, beforeData[key]);
            const afterVal = formatFieldValue(key, afterData[key]);

            return (
              <tr key={key}>
                {/* Field Label */}
                <td className="break-words px-3 py-2 font-medium capitalize text-slate-700 dark:text-slate-300">
                  {label}
                </td>

                {/* Sebelum */}
                <td className="px-2 py-1.5 align-top">
                  <span className="block w-full whitespace-normal break-words rounded-md bg-rose-50 px-2 py-1 text-center font-medium text-rose-500 dark:bg-rose-950/40 dark:text-rose-400">
                    {beforeVal}
                  </span>
                </td>

                {/* Sesudah */}
                <td className="px-2 py-1.5 align-top">
                  <span className="block w-full whitespace-normal break-words rounded-md bg-emerald-50 px-2 py-1 text-center font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    {afterVal}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ActivityItem({ item }: ActivityItemProps) {
  return (
    <li className="mb-10 ms-6">
      {/* Icon */}
      <span className="absolute -inset-s-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand-softer ring-8 ring-blue-300">
        <CalendarDays className="h-3 w-3 text-fg-brand-strong" />
      </span>

      {/* Judul aktivitas */}
      <div className="flex flex-col gap-0 lg:flex-row lg:gap-2">
        <div className="min-w-0">
          <p
            className="truncate text-sm font-semibold text-heading"
            title={item.primaryText}
          >
            {item.primaryText}
          </p>
        </div>

        <div className="min-w-0">
          <p
            className="truncate text-sm italic text-slate-600 capitalize dark:text-slate-300"
            title={item.secondaryText}
          >
            {item.secondaryText}
          </p>
        </div>
      </div>

      {/* Tanggal dan label waktu */}
      <div className="mb-2 flex flex-col gap-0 lg:flex-row lg:gap-2">
        <div className="min-w-0">
          <time
            dateTime={String(item.occurredAt)}
            title={formatDateTime(item.occurredAt)}
            className="text-xs font-medium text-slate-600 dark:text-slate-300"
          >
            {formatDateTime(item.occurredAt)}
          </time>
        </div>

        {item.occurredAtLabel && (
          <div className="min-w-0">
            <span className="w-fit rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {item.occurredAtLabel}
            </span>
          </div>
        )}
      </div>

      {/* Detail teks untuk Create */}
      {item.action?.toLowerCase() === "created" && item.detailText && (
        <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <CheckCircle2
            size={16}
            className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
          />

          <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
            {item.detailText}
          </p>
        </div>
      )}

      {/* Tabel perubahan khusus Update */}
      {item.action?.toLowerCase() === "updated" && (
        <div className="mt-2">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {item.changesTitle ?? "Perubahan Data"}
          </p>

          <ChangeTable changes={item.changes} />
        </div>
      )}
    </li>
  );
}
