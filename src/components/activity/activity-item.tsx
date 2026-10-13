import { CalendarDays } from "lucide-react";
import { formatTanggal, type DateInput } from "@/lib/utils";

export type ActivityItemData = {
  id: string | number;
  created_at: DateInput;
  created_at_human?: string;
  activity: string;
  detail_activity: string;
  pic?: string | null;
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

      {/* Tanggal */}
      <time
        dateTime={String(item.created_at)}
        title={formatTanggal(item.created_at)}
        className="bg-neutral-secondary-medium border border-default-medium text-heading text-xs font-medium px-1.5 py-0.5 rounded"
      >
        {item.created_at_human ?? formatTanggal(item.created_at)}
      </time>

      {/* Activity */}
      <h3 className="flex items-center mb-1 text-sm font-semibold text-heading my-2">
        {item.activity}
      </h3>

      {/* Detail Activity */}
      <p className="mb-2 text-xs text-slate-600 dark:text-slate-300">
        {item.detail_activity}
      </p>

      {/* PIC */}
      {item.pic && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          PIC: <span className="font-medium">{item.pic}</span>
        </p>
      )}
    </li>
  );
}

