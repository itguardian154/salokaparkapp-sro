import { FaClock, FaCircleCheck, FaUsers } from "react-icons/fa6";

type ArrivalSummaryProps = {
  total: number;
  arrived: number;
  notArrived: number;
};

const summaryItems = [
  {
    key: "total",
    label: "Total Rombongan",
    icon: FaUsers,
    color: "text-orange-600",
    iconBg: "bg-orange-100 dark:bg-orange-950/60",
  },
  {
    key: "arrived",
    label: "Sudah Datang",
    icon: FaCircleCheck,
    color: "text-emerald-700",
    iconBg: "bg-emerald-100 dark:bg-emerald-950/60",
  },
  {
    key: "notArrived",
    label: "Belum Datang",
    icon: FaClock,
    color: "text-amber-700",
    iconBg: "bg-amber-100 dark:bg-amber-950/60",
  },
] as const;

export default function ArrivalSummary({
  total,
  arrived,
  notArrived,
}: ArrivalSummaryProps) {
  const values = { total, arrived, notArrived };

  return (
    <section
  aria-label="Ringkasan hari ini"
  className="flex w-full items-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-800"
>
  {summaryItems.map(({ key, label, icon: Icon, color, iconBg }, index) => (
    <div
      key={key}
      className={`flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-1 ${
        index !== 0
          ? "border-l border-slate-200 dark:border-slate-700"
          : ""
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={`flex size-6 items-center justify-center rounded-lg ${iconBg}`}
        >
          <Icon className={`size-3 ${color}`} aria-hidden="true" />
        </span>

        <p className={`text-lg font-bold leading-none tabular-nums ${color}`}>
          {values[key]}
        </p>
      </div>

      <p className="text-[11px] leading-tight text-center text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  ))}
</section>
  );
}
