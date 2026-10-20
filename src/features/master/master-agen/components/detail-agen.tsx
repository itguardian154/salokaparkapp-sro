import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { FaDatabase, FaTimes } from "react-icons/fa";
import ActivitySheet from "@/components/activity/activity-sheet";
import type { ActivityItemData } from "@/components/activity/activity-item";
import { GitBranch } from "lucide-react";
import DetailPageLayout from "@/components/detail-page/detail-page-ayout";
import DetailActionFooter, {
  type DetailAction,
} from "@/components/detail-page/detail-action-footer";
import { MdWorkHistory } from "react-icons/md";
import { Package } from "lucide-react";
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
        changes: activity.changes?.after ?? {},
        changesTitle: "Update",
      })),
    [agent?.activities],
  );

  if (!open || !agent) return null;

  const InfoItem = ({ label, value }: InfoItemProps) => (
    <div className="space-y-1">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <div className="mt-1 wrap-break-word text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-200">
        {value || "-"}
      </div>
    </div>
  );

  const actions: DetailAction[] = [
    
   
    {
      id: "close",
      label: "Tutup",
      icon: <FaTimes size={15} />,
      variant: "destructive",
      mobileColor: "bg-red-500",
      position: "right",
      onClick: onClose,
    },
  ];

  return (
    <DetailPageLayout
      icon={FaDatabase}
      title="Detail Master Agen"
      subtitle="Detail data master agen"
      onClose={onClose}
      footer={<DetailActionFooter actions={actions} />}
    >
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
        <div className="p-5">
          {agent.logo_url && (
            <div className="mb-5">
              <img
                src={agent.logo_url}
                alt={`Logo ${agent.name}`}
                className="h-20 w-20 rounded-lg border border-slate-200 object-contain p-2 dark:border-slate-700"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="Nama Agen" value={agent.name} />
            <InfoItem
              label="Nama Asosiasi"
              value={agent.association_name}
            />
            <InfoItem
              label="Nama PIC"
              value={agent.contact_person}
            />
            <InfoItem label="Nomor Telepon" value={agent.phone} />
            <InfoItem
              label="Provinsi"
              value={agent.province?.name}
            />
            <InfoItem
              label="Kota/Kabupaten"
              value={agent.city?.name}
            />
            <InfoItem
              label="Status"
              value={
                <Badge
                  variant={agent.is_active ? "success" : "secondary"}
                >
                  {agent.is_active ? "Aktif" : "Nonaktif"}
                </Badge>
              }
            />
          </div>
        </div>
      </DetailSection>

      <DetailSection
        icon={GitBranch}
        title={`Cabang Agen (${agent.branches?.length ?? 0})`}
        variant="blue"
      >
        <div className="space-y-4 p-5">
          {!agent.branches?.length ? (
            <p className="text-sm text-slate-500">
              Belum ada data cabang agen.
            </p>
          ) : (
            agent.branches.map((branch) => (
              <div
                key={branch.id}
                className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      {branch.name}
                    </h3>
                  </div>

                  <Badge
                    variant={branch.is_active ? "success" : "secondary"}
                  >
                    {branch.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <InfoItem
                    label="Nama PIC"
                    value={branch.contact_person}
                  />
                  <InfoItem
                    label="Nomor Telepon"
                    value={branch.phone}
                  />
                  <InfoItem
                    label="Provinsi"
                    value={branch.province?.name}
                  />
                  <InfoItem
                    label="Kota/Kabupaten"
                    value={branch.city?.name}
                  />
                </div>
              </div>
            ))
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
