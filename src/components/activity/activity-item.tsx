import { CalendarDays } from "lucide-react";
import { formatDateTime, type DateInput } from "@/lib/utils";

export type ActivityItemData = {
  id: string | number;
  primaryText: string;
  secondaryText: string;
  occurredAt: DateInput;
  occurredAtLabel?: string;
  changes: unknown;
  changesTitle?: string;
};

type ActivityItemProps = {
  item: ActivityItemData;
};

export default function ActivityItem({ item }: ActivityItemProps) {
  return (
    <li className="mb-10 ms-6">
      {/* Icon */}
      <span className="absolute flex items-center justify-center w-6 h-6 bg-brand-softer rounded-full -inset-s-3 ring-8 ring-blue-300">
        <CalendarDays className="w-3 h-3 text-fg-brand-strong" />
      </span>

      <div className="flex flex-row gap-2">
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
            className="truncate capitalize italic text-sm text-slate-600 dark:text-slate-300"
            title={item.secondaryText}
          >
            {item.secondaryText}
          </p>
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <div className="min-w-0">
          <time
            dateTime={String(item.occurredAt)}
            title={formatDateTime(item.occurredAt)}
            className="text-xs font-medium text-slate-600 dark:text-slate-300"
          >
            {formatDateTime(item.occurredAt)}
          </time>
        </div>
        <div className="min-w-0">
          <span className="rounded bg-slate-100 w-fit px-1.5 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {item.occurredAtLabel}
          </span>
        </div>
      </div>

      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {item.changesTitle ?? "Update"}
        </p>
        <pre className="max-h-64 overflow-auto rounded-md bg-slate-100 p-2 text-[11px] leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {JSON.stringify(item.changes, null, 2)}
        </pre>
      </div>
    </li>
  );
}
