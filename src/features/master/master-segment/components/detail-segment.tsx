import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    CircleCheck,
    CircleX,
    FolderOpen,
    Layers,
    ListTree,
    Tags,
} from "lucide-react";
import { FaDatabase } from "react-icons/fa";
import { MdWorkHistory } from "react-icons/md";

import ActivitySheet from "@/components/activity/activity-sheet";
import type { ActivityItemData } from "@/components/activity/activity-item";
import DetailPageLayout from "@/components/detail-page/detail-page-ayout";
import DetailSection from "@/components/detail-page/detail-section";

import type { SegmentDetailRecord } from "../types/master-segment";

type DetailMasterSegmentProps = {
    open: boolean;
    segment: SegmentDetailRecord | null;
    onClose: () => void;
};

// Status Badge
const StatusBadge = ({ active }: { active: boolean | null }) => {
    const isActive = active === true;

    return (
        <Badge
            variant={isActive ? "success" : "secondary"}
            className="shrink-0 gap-1.5 px-2.5 py-1"
        >
            {isActive ? <CircleCheck size={13} /> : <CircleX size={13} />}
            {isActive ? "Aktif" : "Nonaktif"}
        </Badge>
    );
};

const DetailMasterSegment = ({
    open,
    segment,
    onClose,
}: DetailMasterSegmentProps) => {
    const [openActivity, setOpenActivity] = useState(false);

    // Mapping Log Aktivitas
    const activityLogs = useMemo<ActivityItemData[]>(
        () =>
            (segment?.activities ?? []).map((activity) => ({
                id: activity.id,
                primaryText: activity.user?.name ?? "System",
                secondaryText: activity.description,
                occurredAt: activity.created_at,
                occurredAtLabel: activity.created_at_human,
                changes: activity.changes ?? {},
                action: activity.event,
                detailText:
                    activity.event?.toLowerCase() === "created"
                        ? "Data segment berhasil ditambahkan."
                        : undefined,
            })),
        [segment?.activities],
    );

    if (!open || !segment) return null;

    const details = segment.details ?? [];


    return (
        <DetailPageLayout
            icon={FaDatabase}
            title="Detail Master Segment"
            subtitle="Detail informasi master segment"
            onClose={onClose}
        >
            {/* SECTION 1: INFORMASI MASTER SEGMENT */}
            <DetailSection
                icon={Layers}
                title="Informasi Master Segment"
                variant="blue"
                action={
                    <Button
                        onClick={() => setOpenActivity(true)}
                        variant="amberBorder"
                        size="lg"
                        className="bg-white/90 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <MdWorkHistory size={16} />
                        Log Aktivitas
                    </Button>
                }
            >
                <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 lg:grid-cols-3">
                    {/* Nama Segment */}
                    <div className="min-w-0 space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Nama Segment
                        </p>

                        <p className="break-words text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {segment.name || "-"}
                        </p>
                    </div>

                    {/* Status Segment */}
                    <div className="min-w-0 space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Status Segment
                        </p>

                        <StatusBadge active={segment.is_active} />
                    </div>
                </div>
            </DetailSection>

            {/* SECTION 2: DETAIL & SUB SEGMENT DETAIL */}
            <DetailSection
                icon={ListTree}
                title="Detail & Sub Segment Detail"
                variant="blue"
            >
                <div className="space-y-5 p-5">

                    {/* Empty State Detail */}
                    {!details.length ? (
                        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-8 text-center dark:border-slate-700 dark:bg-slate-900/30">
                            <FolderOpen
                                size={30}
                                className="mb-3 text-slate-400"
                                strokeWidth={1.5}
                            />

                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Belum Ada Detail Segment
                            </h3>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Segment ini belum memiliki detail segment.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {details.map((detail, index) => (
                                <div
                                    key={detail.id}
                                    className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                                >
                                    {/* Detail Segment */}
                                    <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                                <ListTree size={18} />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                    Detail Segment {index + 1}
                                                </p>

                                                <p className="break-words text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                    {detail.name || "-"}
                                                </p>
                                            </div>
                                        </div>

                                        <StatusBadge
                                            active={detail.is_active}
                                        />
                                    </div>

                                    {/* Sub Segment Detail */}
                                    <div className="space-y-3 p-4">
                                        <div className="flex items-center gap-2">
                                            <Tags
                                                size={15}
                                                className="text-slate-500 dark:text-slate-400"
                                            />

                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                Sub Segment Detail
                                            </p>
                                        </div>

                                        {!detail.sub_details?.length ? (
                                            <div className="rounded-lg border border-dashed border-slate-200 px-4 py-5 text-center dark:border-slate-700">
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    Belum ada sub segment detail.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                                {detail.sub_details.map(
                                                    (subDetail, subIndex) => (
                                                        <div
                                                            key={subDetail.id}
                                                            className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-3 transition-colors hover:bg-slate-100/80 dark:border-slate-700 dark:bg-slate-900/30 dark:hover:bg-slate-900/60"
                                                        >
                                                            <div className="flex min-w-0 items-center gap-3">
                                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                                    <Tags size={15} />
                                                                </div>

                                                                <div className="min-w-0">
                                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                                        Sub Detail {subIndex + 1}
                                                                    </p>

                                                                    <p className="break-words text-sm font-medium text-slate-700 dark:text-slate-200">
                                                                        {subDetail.name || "-"}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <StatusBadge
                                                                active={subDetail.is_active}
                                                            />
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DetailSection>

            {/* LOG AKTIVITAS */}
            <ActivitySheet
                open={openActivity}
                onOpenChange={setOpenActivity}
                data={activityLogs}
            />
        </DetailPageLayout>
    );
};

export default DetailMasterSegment;