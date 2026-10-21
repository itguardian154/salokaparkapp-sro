import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { FaDatabase } from "react-icons/fa";
import {
  Building2,
  GitBranch,
  MapPin,
  Package,
  Phone,
  UserRound,
  CircleCheck,
  CircleX,
  FolderOpen,
} from "lucide-react";
import ActivitySheet from "@/components/activity/activity-sheet";
import type { ActivityItemData } from "@/components/activity/activity-item";
import DetailPageLayout from "@/components/detail-page/detail-page-ayout";
import { MdWorkHistory } from "react-icons/md";
import DetailSection from "@/components/detail-page/detail-section";
import type { AgentDetail } from "../types/master-agen";
import { Button } from "@/components/ui/button";

type DetailMasterAgentProps = {
  open: boolean;
  agent: AgentDetail | null;
  onClose: () => void;
};

type InfoItemProps = {
  label: string;
  value: ReactNode;
};

const DetailMasterAgen = ({
  open,
  agent,
  onClose,
}: DetailMasterAgentProps) => {
  const [openActivity, setOpenActivity] = useState(false);

  const activityLogs = useMemo<ActivityItemData[]>(
    () =>
      (agent?.activities ?? []).map((activity) => ({
        id: activity.id,
        primaryText: activity.user?.name ?? "System",
        secondaryText: activity.description,
        occurredAt: activity.created_at,
        occurredAtLabel: activity.created_at_human,
        changes: activity.changes ?? {},
        action: activity.event,
        detailText:
          activity.event?.toLowerCase() === "created"
            ? "Data agen berhasil ditambahkan."
            : undefined,
      })),
    [agent?.activities],
  );

  if (!open || !agent) return null;

  const InfoItem = ({ label, value }: InfoItemProps) => (
    <div className="min-w-0 space-y-1">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <div className="mt-1 break-words text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-200">
        {value || "-"}
      </div>
    </div>
  );

  const StatusItem = ({
    active,
    label = "Status",
  }: {
    active: boolean;
    label?: string;
  }) => (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 dark:border-slate-700 dark:bg-slate-900/30">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {active ? "Data sedang aktif" : "Data sedang nonaktif"}
        </p>
      </div>

      <Badge
        variant={active ? "success" : "secondary"}
        className="shrink-0 gap-1.5 px-2.5 py-1"
      >
        {active ? (
          <CircleCheck size={13} />
        ) : (
          <CircleX size={13} />
        )}
        {active ? "Aktif" : "Nonaktif"}
      </Badge>
    </div>
  );

  return (
    <DetailPageLayout
      icon={FaDatabase}
      title="Detail Master Agen"
      subtitle="Detail data master agen"
      onClose={onClose}
    >
      {/* INFORMASI AGEN */}
      <DetailSection
        icon={Package}
        title="Informasi Agen"
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
        <div className="space-y-5 p-5">
          {agent.logo_url && (
            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/30">
              <img
                src={agent.logo_url}
                alt={`Logo ${agent.name}`}
                className="h-20 w-20 shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-2 dark:border-slate-700"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Logo Agen
                </p>
                <h3 className="mt-1 break-words font-semibold text-slate-800 dark:text-slate-100">
                  {agent.name}
                </h3>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="Nama Agen" value={agent.name} />
            <InfoItem
              label="Asosiasi"
              value={agent.association_name}
            />
            <InfoItem
              label="Nama PIC"
              value={
                agent.contact_person ? (
                  <span className="inline-flex items-center gap-2">
                    <UserRound size={15} className="shrink-0 text-slate-400" />
                    {agent.contact_person}
                  </span>
                ) : (
                  "-"
                )
              }
            />
            <InfoItem
              label="WhatsApp"
              value={
                agent.phone ? (
                  <span className="inline-flex items-center gap-2">
                    <Phone size={15} className="shrink-0 text-slate-400" />
                    {agent.phone}
                  </span>
                ) : (
                  "-"
                )
              }
            />
            <InfoItem
              label="Provinsi"
              value={agent.province_name}
            />
            <InfoItem
              label="Kota/Kabupaten"
              value={
                agent.city_name ? (
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={15} className="shrink-0 text-slate-400" />
                    {agent.city_name}
                  </span>
                ) : (
                  "-"
                )
              }
            />
          </div>

          <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
            <StatusItem active={agent.is_active} label="Status Agen" />
          </div>
        </div>
      </DetailSection>

      {/* CABANG AGEN */}
      <DetailSection
        icon={GitBranch}
        title={`Cabang Agen`}
        variant="blue"
      >
        <div className="p-5">
          {!agent.branches?.length ? (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-8 text-center dark:border-slate-700 dark:bg-slate-900/30">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <FolderOpen size={30} strokeWidth={1.5} />
              </div>

              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Belum Ada Cabang
              </h3>

              <p className="mt-1 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Agen ini belum memiliki data cabang. Informasi cabang akan ditampilkan di sini setelah ditambahkan.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {agent.branches.map((branch, index) => (
                <div
                  key={branch.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                >
                  {/* HEADER CABANG */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/30">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                        <Building2 size={19} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Cabang {index + 1}
                        </p>
                        <h3 className="break-words text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {branch.name}
                        </h3>
                      </div>
                    </div>

                    <Badge
                      variant={branch.is_active ? "success" : "secondary"}
                      className="shrink-0 gap-1.5 px-2.5 py-1"
                    >
                      {branch.is_active ? (
                        <CircleCheck size={13} />
                      ) : (
                        <CircleX size={13} />
                      )}
                      {branch.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>

                  {/* INFORMASI CABANG */}
                  <div className="space-y-4 p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <InfoItem
                        label="Nama PIC"
                        value={branch.contact_person}
                      />
                      <InfoItem
                        label="WhatsApp"
                        value={branch.phone}
                      />
                      <InfoItem
                        label="Provinsi"
                        value={branch.province_name}
                      />
                      <InfoItem
                        label="Kota/Kabupaten"
                        value={branch.city_name}
                      />
                    </div>

                    <div className="border-t border-slate-100 pt-3 dark:border-slate-700">
                      <StatusItem
                        active={branch.is_active}
                        label="Status Cabang"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DetailSection>

      <ActivitySheet
        open={openActivity}
        onOpenChange={setOpenActivity}
        data={activityLogs}
      />
    </DetailPageLayout>
  );
};

export default DetailMasterAgen;
