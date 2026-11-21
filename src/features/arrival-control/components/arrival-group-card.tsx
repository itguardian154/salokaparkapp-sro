import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type {
  ArrivalGroup,
  ArrivalStatus,
  CateringStatus,
} from "../types/arrival-control";
import {
  FaArrowRightToBracket,
  FaCheck,
  FaSchool,
  FaUtensils,
  FaUsers,
} from "react-icons/fa6";
import { FaClock, FaPencilAlt } from "react-icons/fa";

type ArrivalGroupCardProps = {
  group: ArrivalGroup;
  onArrivalStatusChange: (id: number, status: ArrivalStatus) => void;
  onCateringStatusChange: (id: number, status: CateringStatus) => void;
  onTicketEntry: (id: number) => void;
};

const arrivalPresentation: Record<
  ArrivalStatus,
  {
    label: string;
    variant: "orange" | "blue" | "violet" | "success";
    icon: typeof FaClock;
  }
> = {
  belum_datang: {
    label: "Belum Datang",
    variant: "orange",
    icon: FaClock,
  },
  rombongan_datang: {
    label: "Rombongan Datang",
    variant: "blue",
    icon: FaUsers,
  },
  masuk_in_park: {
    label: "Rombongan Sudah Masuk",
    variant: "blue",
    icon: FaArrowRightToBracket,
  },
  sudah_makan: {
    label: "Rombongan Sudah Makan",
    variant: "violet",
    icon: FaUtensils,
  },
  pulang: {
    label: "Rombongan Pulang",
    variant: "success",
    icon: FaCheck,
  },
};

const cateringPresentation: Record<
  CateringStatus,
  { label: string; variant: "rose" | "warning" | "success" }
> = {
  belum_siap: {
    label: "Belum Siap",
    variant: "rose",
  },
  siap: {
    label: "Siap",
    variant: "warning",
  },
  selesai: {
    label: "Sudah Makan",
    variant: "success",
  },
};

export default function ArrivalGroupCard({
  group,
  onArrivalStatusChange,
  onCateringStatusChange,
  onTicketEntry,
}: ArrivalGroupCardProps) {
  const statusStyle =
    arrivalPresentation[group.arrivalStatus] ??
    arrivalPresentation.belum_datang;
  const StatusIcon = statusStyle.icon;
  const cateringStyle = cateringPresentation[group.cateringStatus];
  const ticketProgress = group.totalTickets
    ? Math.min(
        100,
        Math.round((group.enteredTickets / group.totalTickets) * 100),
      )
    : 0;
  const remainingTickets = Math.max(
    0,
    group.totalTickets - group.enteredTickets,
  );
  const ticketTone =
    ticketProgress >= 80
      ? "from-emerald-400 to-emerald-600"
      : ticketProgress >= 40
        ? "from-amber-400 to-orange-500"
        : "from-rose-400 to-rose-600";

  const nextArrivalAction: Partial<
    Record<
      ArrivalStatus,
      {
        label: string;
        next: ArrivalStatus;
        variant: "primer" | "blue" | "sekunder";
      }
    >
  > = {
    belum_datang: {
      label: "Konfirmasi Kedatangan",
      next: "rombongan_datang",
      variant: "primer",
    },
    rombongan_datang: {
      label: "Konfirmasi Sudah Masuk",
      next: "masuk_in_park",
      variant: "blue",
    },
    sudah_makan: {
      label: "Konfirmasi Rombongan Pulang",
      next: "pulang",
      variant: "sekunder",
    },
  };
  const nextAction = nextArrivalAction[group.arrivalStatus];

  return (
    <Card className="gap-0 overflow-hidden border border-slate-200 bg-white p-0 shadow-md shadow-slate-200/70 transition-shadow hover:shadow-lg hover:shadow-slate-300/60 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/20 dark:hover:shadow-black/30">
      <div className="" />
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 text-orange-600 ring-1 ring-orange-200/80 dark:from-orange-950/70 dark:to-amber-950/40 dark:text-orange-300 dark:ring-orange-900">
              <FaSchool className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate font-bold text-slate-900 dark:text-white">
                {group.schoolName}
              </h3>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                {group.city} <span className="px-1 text-slate-300">·</span>{" "}
                Sales: {group.salesName}
              </p>
            </div>
          </div>
          <Badge
            variant={statusStyle.variant}
            className="max-w-full gap-2 px-3 py-1.5 text-left text-xs font-bold shadow-sm"
          >
            <StatusIcon aria-hidden="true" />
            {statusStyle.label}
          </Badge>
        </div>

        <div className="border-b border-slate-100 py-4 dark:border-slate-700">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                Tiket Masuk
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Progress tiket rombongan
              </p>
            </div>
            <p className="text-lg font-extrabold tabular-nums text-slate-900 dark:text-white">
              {group.enteredTickets}
              <span className="px-1 text-sm font-medium text-slate-400">/</span>
              {group.totalTickets}
            </p>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200 dark:bg-slate-700 dark:ring-slate-600"
            role="progressbar"
            aria-label={`Tiket masuk rombongan ${group.schoolName}`}
            aria-valuemin={0}
            aria-valuemax={group.totalTickets}
            aria-valuenow={group.enteredTickets}
          >
            <div
              className={`h-full rounded-full bg-gradient-to-r ${ticketTone} shadow-[0_0_10px_rgba(16,185,129,0.35)] transition-[width] duration-500`}
              style={{ width: `${ticketProgress}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span
              className={`font-bold ${ticketProgress >= 80 ? "text-emerald-700 dark:text-emerald-400" : ticketProgress >= 40 ? "text-amber-700 dark:text-amber-400" : "text-rose-700 dark:text-rose-400"}`}
            >
              100 tiket telah masuk
            </span>
            <div className="flex items-center gap-3">
              <span className="text-slate-500 dark:text-slate-400">
                {remainingTickets} tiket belum masuk
              </span>
              <button
                type="button"
                onClick={() => onTicketEntry(group.id)}
                disabled={
                  remainingTickets === 0 ||
                  !["rombongan_datang", "masuk_in_park"].includes(
                    group.arrivalStatus,
                  )
                }
                className="font-semibold text-blue-700 underline-offset-2 transition hover:text-blue-900 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline dark:text-blue-300 dark:hover:text-blue-200"
              ></button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-700 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/60">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/70 dark:text-orange-300">
              <FaUsers className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Status Rombongan
              </p>
              <p className="truncate text-sm font-bold text-slate-800 dark:text-white">
                {statusStyle.label}
              </p>
            </div>
          </div>

          {nextAction ? (
            <Button
              size="lg"
              variant={nextAction.variant}
              onClick={() => onArrivalStatusChange(group.id, nextAction.next)}
            >
              <FaCheck aria-hidden="true" />
              {nextAction.label}
            </Button>
          ) : (
            ""
          )}

          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-amber-50/80 p-2.5 dark:bg-amber-950/20">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300">
              <FaUtensils className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Status Penyajian IR
              </p>
              <Badge
                variant={cateringStyle.variant}
                className="mt-0.5 px-2 py-0.5 text-xs font-bold"
              >
                {cateringStyle.label}
              </Badge>
            </div>
          </div>
          <Button
            size="lg"
            variant="sekunder"
            disabled={
              group.cateringStatus === "selesai" ||
              group.arrivalStatus === "belum_datang" ||
              group.arrivalStatus === "rombongan_datang"
            }
            onClick={() =>
              onCateringStatusChange(
                group.id,
                group.cateringStatus === "belum_siap" ? "siap" : "selesai",
              )
            }
          >
            <FaPencilAlt aria-hidden="true" />
            {group.cateringStatus === "selesai" ? "IR Selesai" : "Update IR"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
