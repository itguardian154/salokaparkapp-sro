import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";
import { useState } from "react";
import { FaDatabase, FaTimes } from "react-icons/fa";
import ActivitySheet from "@/components/activity/activity-sheet";
import { Building2, GitBranch, Globe, MapPin } from "lucide-react";
import DetailPageLayout from "@/components/detail-page/detail-page-ayout";
import DetailActionFooter, {
  type DetailAction,
} from "@/components/detail-page/detail-action-footer";
import DetailSection from "@/components/detail-page/detail-section";
import type { AgentDetail } from "../types/master-agen";

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

  if (!open || !agent) return null;

  const logs = (agent.activities ?? []).map((activity) => ({
    id: activity.id,
    created_at: activity.created_at,
    activity: activity.user?.name ?? activity.description,
    detail_activity: `${activity.description} ${
      activity.changes?.after
        ? Object.keys(activity.changes.after).join(", ")
        : ""
    }`.trim(),
    pic: activity.user?.name ?? "-",
  }));

  const InfoItem = ({ label, value }: InfoItemProps) => (
    <div className="space-y-1">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <div className="mt-1 break-words text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-200">
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
        icon={Building2}
        title="Informasi Agen"
        variant="blue"
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
            <InfoItem label="Kode Agen" value={agent.code} />

            <InfoItem label="Nama Agen" value={agent.name} />

            <InfoItem
              label="Nama Asosiasi"
              value={agent.association_name}
            />

            <InfoItem label="Tipe Agen" value={agent.type} />

            <InfoItem
              label="Contact Person"
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
              label="Alamat"
              value={agent.address}
            />

            <InfoItem
              label="Website"
              value={
                agent.website ? (
                  <a
                    href={agent.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {agent.website}
                  </a>
                ) : (
                  "-"
                )
              }
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
                    <p className="mt-1 text-xs text-slate-500">
                      Kode cabang: {branch.code}
                    </p>
                  </div>

                  <Badge
                    variant={branch.is_active ? "success" : "secondary"}
                  >
                    {branch.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <InfoItem
                    label="Contact Person"
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

                  <div className="md:col-span-2 lg:col-span-3">
                    <InfoItem
                      label="Alamat Cabang"
                      value={branch.address}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DetailSection>

      <DetailSection
        icon={MapPin}
        title="Informasi Tambahan"
        variant="blue"
      >
        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
          <InfoItem
            label="Dibuat Pada"
            value={agent.created_at}
          />

          <InfoItem
            label="Terakhir Diperbarui"
            value={agent.updated_at}
          />
        </div>
      </DetailSection>

      <ActivitySheet
        open={openActivity}
        onOpenChange={setOpenActivity}
        data={logs}
      />
    </DetailPageLayout>
  );
};

export default DetailMasterAgen;
