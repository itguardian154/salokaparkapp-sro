import {
    type RowData,
    type ReactTable,
} from "@tanstack/react-table";
import type { ReactNode } from "react";

import { dataTableFeatures } from "./table-features";

interface MobileDataCardProps<TData extends RowData> {
    table: ReactTable<typeof dataTableFeatures, TData>;
    titleKey?: keyof TData;
    titleLabel?: string;
    icon?: ReactNode;
    emptyTitle?: string;
    emptyDescription?: string;
}

const MobileDataCard = <TData extends RowData,>({
    table,
    titleKey,
    titleLabel = "Agen",
    icon,
    emptyTitle = "Belum ada data agen",
    emptyDescription = "Data agen akan ditampilkan di sini.",
}: MobileDataCardProps<TData>) => {
    const rows = table.getRowModel().rows;

    if (rows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900/50">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/70 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {icon ?? <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M8 9h8M8 13h5" />
                    </svg>}
                </div>

                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {emptyTitle}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {emptyDescription}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {rows.map((row) => {
                const title = titleKey ? row.original[titleKey] : undefined;
                const titleCell = titleKey
                    ? row.getVisibleCells().find(
                          (cell) => cell.column.id === String(titleKey),
                      )
                    : undefined;

                // Ambil kolom aksi
                const actionCell = row
                    .getVisibleCells()
                    .find((cell) =>
                        ["aksi", "action", "actions"].includes(
                            cell.column.id.toLowerCase(),
                        ),
                    );

                // Informasi selain judul dan aksi
                const cells = row.getVisibleCells().filter(
                    (cell) =>
                        (!titleKey || cell.column.id !== String(titleKey)) &&
                        cell.id !== actionCell?.id,
                );

                return (
                    <article
                        key={row.id}
                        className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                    >
                        {/* Aksen atas */}
                        <div className="h-1 bg-linear-to-r from-emerald-500 via-emerald-400 to-teal-300" />

                        {/* Header Card */}
                        <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-700">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                {icon ?? <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="21"
                                    height="21"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M3 21h18" />
                                    <path d="M5 21V7l8-4v18" />
                                    <path d="M19 21V11l-6-4" />
                                    <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
                                </svg>}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400">
                                    {titleLabel}
                                </p>

                                <h3 className="wrap-break-word text-sm font-bold leading-5 text-slate-800 dark:text-slate-100">
                                    {title != null && String(title).trim() !== "" ? (
                                        titleCell ? (
                                            <table.FlexRender cell={titleCell} />
                                        ) : (
                                            String(title)
                                        )
                                    ) : (
                                        `Data ${titleLabel} ${row.index + 1}`
                                    )}
                                </h3>
                            </div>

                            {/* Aksi di pojok kanan atas */}
                            {actionCell && (
                                <div className="ml-auto flex shrink-0 items-center justify-end">
                                    <table.FlexRender cell={actionCell} />
                                </div>
                            )}
                        </div>

                        {/* Informasi Card */}
                        {cells.length > 0 && (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-0 px-4 py-1">
                                {cells.map((cell) => {
                                    const column = cell.column;
                                    const header = column.columnDef.header;

                                    const label =
                                        typeof header === "string"
                                            ? header
                                            : column.id;

                                    return (
                                        <div
                                            key={cell.id}
                                            className="min-w-0 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-700/80"
                                        >
                                            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                {label}
                                            </p>

                                            <div className="min-w-0 text-sm leading-5 text-slate-700 dark:text-slate-200 [&_button]:max-w-full [&_button]:text-xs">
                                                <table.FlexRender cell={cell} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </article>
                );
            })}
        </div>
    );
};

export default MobileDataCard;
