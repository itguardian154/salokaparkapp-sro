import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";
import { useState } from "react";
import { FaDatabase, FaTimes } from "react-icons/fa";
import ActivitySheet from "@/components/activity/activity-sheet";
import { Building2, Signature } from "lucide-react";
import SROHistoryApproval from "@/components/detail-page/history-approval";
import DetailPageLayout from "@/components/detail-page/detail-page-ayout";
import DetailActionFooter, {
  type DetailAction,
} from "@/components/detail-page/detail-action-footer";
import DetailSection from "@/components/detail-page/detail-section";
import type { DataTableRecord } from "../types/datatable";

type DetailMasterAgentProps = {
  open: boolean;
  agent: DataTableRecord | null;
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

  // LOGS TETAP SEPERTI SEMULA
  const logs = [
    {
      id: 1,
      created_at: "2025-03-13",
      activity: "Antika Lorien",
      detail_activity: "Produk Master Produk berhasil ditambahkan ke sistem.",
      pic: "Antika",
    },
    {
      id: 2,
      created_at: "2025-03-15",
      activity: "Antika Lorien",
      detail_activity: "Harga produk diubah dari Rp250.000 menjadi Rp300.000.",
      pic: "Admin",
    },
    {
      id: 3,
      created_at: "2025-03-18",
      activity: "John Doe",
      detail_activity: "Status produk berubah menjadi Active.",
      pic: "Supervisor",
    },
  ];

  const InfoItem = ({ label, value }: InfoItemProps) => (
    <div className="space-y-1">
      <p className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
        {label}
      </p>

      <p className="text-sm font-semibold mt-1 text-slate-700 dark:text-slate-200 wrap-break-word leading-relaxed">
        {value || "-"}
      </p>
    </div>
  );

  // APPROVALS TETAP SEPERTI SEMULA
  const approvals = [
    {
      action: "Dibuat oleh,",
      grade: "Officer",
      name: "Antika Lorien",
    },
  ];

  const actions: DetailAction[] = [
    {
      id: "reject",
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
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Nama Travel"
              value={agent.nama_travel}
            />

            <InfoItem
              label="Nama Pelanggan"
              value={agent.name_customer}
            />

            <InfoItem
              label="Nomor Telepon"
              value={agent.no_telepon}
            />

            <InfoItem
              label="Kota"
              value={agent.city}
            />

            <InfoItem
              label="Asosiasi"
              value={agent.asosiasi}
            />

            <InfoItem
              label="Status"
              value={
                <Badge variant={agent.is_active ? "success" : "secondary"}>
                  {agent.is_active ? "Aktif" : "Inactive"}
                </Badge>
              }
            />
          </div>
        </div>
      </DetailSection>

      <SROHistoryApproval approvals={approvals} />

      <ActivitySheet
        open={openActivity}
        onOpenChange={setOpenActivity}
        data={logs}
      />
    </DetailPageLayout>
  );
};

export default DetailMasterAgen;
