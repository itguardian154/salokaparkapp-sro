import dayjs from "dayjs";
import { useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { FaCalendarDays } from "react-icons/fa6";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type FilterDateValue = {
  startDate: Date | null;
  endDate: Date | null;
} | null;

type FilterDateProps = {
  label: string;
  useRange?: boolean;
  hideLabel?: boolean;
  value: FilterDateValue;
  onChange: (value: FilterDateValue) => void;
};

const calendarClassNames = {
  root: "p-1 text-slate-700 dark:text-slate-200",
  months: "relative",
  month: "relative w-full",
  month_caption:
    "relative flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-12 dark:border-slate-600 dark:bg-slate-800",
  caption_label: "sr-only",
  dropdowns: "flex items-center justify-center gap-3",
  dropdown_root: "relative",
  dropdown:
    "h-9 cursor-pointer appearance-none border-0 bg-transparent px-1 text-center text-sm font-medium text-slate-600 outline-none focus:text-emerald-700 dark:text-slate-200",
  months_dropdown: "w-20",
  years_dropdown: "w-16",
  button_previous:
    "absolute left-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700",
  button_next:
    "absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700",
  month_grid: "w-full border-collapse",
  weekdays: "border-b border-slate-200 dark:border-slate-700",
  weekday: "h-9 text-center text-xs font-medium text-slate-500",
  day: "h-9 w-10 p-0 text-center",
  day_button:
    "inline-flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:bg-emerald-900/40",
  outside: "text-slate-300 dark:text-slate-600",
  today: "font-semibold text-emerald-600",
  disabled: "cursor-not-allowed opacity-40",
   selected: "bg-emerald-600 text-white hover:bg-emerald-700 rounded-full",
  range_start: "filter-date-range-start",
  range_middle: "filter-date-range-middle",
  range_end: "filter-date-range-end",
};

const getMonthBounds = () => ({
  startMonth: new Date(new Date().getFullYear() - 10, 0),
  endMonth: new Date(new Date().getFullYear() + 20, 11, 31),
});

export default function FilterDate({
  label,
  value,
  onChange,
  useRange = false,
  hideLabel = false,
}: FilterDateProps) {
  const [open, setOpen] = useState(false);
  const startDate = value?.startDate ?? null;
  const endDate = value?.endDate ?? null;
  const range: DateRange | undefined = startDate
    ? { from: startDate, to: endDate ?? undefined }
    : undefined;
  const formattedValue = startDate
    ? `${dayjs(startDate).format("DD-MM-YYYY")}${useRange ? ` ~ ${endDate ? dayjs(endDate).format("DD-MM-YYYY") : "DD-MM-YYYY"}` : ""}`
    : useRange
      ? "DD-MM-YYYY ~ DD-MM-YYYY"
      : "DD-MM-YYYY";

  return (
    <div className="space-y-1.5">
      {!hideLabel && (
        <label className="text-xs font-medium text-slate-500 dark:text-slate-200">
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          className="flex h-11 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
        >
          <span className={startDate ? "" : "text-slate-400"}>
            {formattedValue}
          </span>
          <FaCalendarDays className="text-slate-500" aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-auto! border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
        >
          {useRange ? (
            <DayPicker
              mode="range"
              captionLayout="dropdown"
              navLayout="around"
              {...getMonthBounds()}
              min={1}
              resetOnSelect
              selected={range}
              onSelect={(nextRange) => {
                onChange({
                  startDate: nextRange?.from ?? null,
                  endDate: nextRange?.to ?? null,
                });
                if (nextRange?.from && nextRange.to) setOpen(false);
              }}
              fixedWeeks
              className="filter-date-calendar"
              classNames={calendarClassNames}
            />
          ) : (
            <DayPicker
              mode="single"
              captionLayout="dropdown"
              navLayout="around"
              {...getMonthBounds()}
              selected={startDate ?? undefined}
              onSelect={(date) => {
                onChange({ startDate: date ?? null, endDate: null });
                if (date) setOpen(false);
              }}
              fixedWeeks
              className="filter-date-calendar"
              classNames={calendarClassNames}
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
