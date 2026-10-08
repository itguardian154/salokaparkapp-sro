import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import type { ReactNode } from "react";
import { useState } from "react";
import { FaDatabase, FaTimes } from "react-icons/fa";
import ActivitySheet from "@/components/activity/activity-sheet";
import { Package, Signature } from "lucide-react";
import SROHistoryApproval from "@/components/detail-page/history-approval";
import DetailPageLayout from "@/components/detail-page/detail-page-ayout";
import DetailActionFooter, {
  type DetailAction,
} from "@/components/detail-page/detail-action-footer";
import DetailSection from "@/components/detail-page/detail-section";

type DetailMasterProdukProps = {
  open: boolean;
  onClose: () => void;
};

type InfoItemProps = {
  label: string;
  value: ReactNode;
};

const DetailMasterProduk = ({
  open,
  onClose,
}: DetailMasterProdukProps) => {
  const [openActivity, setOpenActivity] = useState(false);

  if (!open) return null;

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

  const InfoItem = ({ label, value }: InfoItemProps) => {
    return (
      <div className="space-y-1">
        <p className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
          {label}
        </p>

        <p className="text-sm font-semibold mt-1 text-slate-700 dark:text-slate-200 wrap-break-word leading-relaxed">
          {value || "-"}
        </p>
      </div>
    );
  };

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
      label: "Reject",
      icon: <FaTimes size={15} />,
      variant: "destructive",
      mobileColor: "bg-red-500",
      position: "right",
      onClick: () => {},
    },

    {
      id: "approve",
      label: "Approve",
      icon: <Signature size={15} />,
      variant: "primer",
      mobileColor: "bg-emerald-500",
      position: "right",
      onClick: () => {},
    },
  ];

  return (
    <DetailPageLayout
      icon={FaDatabase}
      title="Detail Master Produk"
      subtitle="Detail data master produk"
      onClose={onClose}
      footer={<DetailActionFooter actions={actions} />}
    >
      {/* CONTENT SCROLL */}
      <DetailSection icon={Package} title="Master Produk" variant="blue">
        {/* Body */}
        <div className="p-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Nama Produk"
              value={
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 dark:text-white">
                    Ticket Travel Corpo WD
                  </span>
                </div>
              }
            />

            <InfoItem
              label="Harga"
              value={
                <span className="font-semibold text-slate-800 dark:text-white">
                  {formatRupiah(1000000)}
                </span>
              }
            />

            <InfoItem
              label="Departemen Terkait"
              value={
                <div className="flex flex-wrap gap-1.5">
                  {["Finance & Accounting", "Inpark Revenue", "IT"].map(
                    (item, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        {item}
                      </span>
                    ),
                  )}
                </div>
              }
            />

            <InfoItem
              label="Status"
              value={
                <div className="flex items-center">
                  <Badge variant="success">Full Approved</Badge>
                </div>
              }
            />

            <div className="md:col-span-2">
              <InfoItem
                label="Deskripsi"
                value={
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3 text-[13px] leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                    produk best seller ya
                  </div>
                }
              />
            </div>
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

export default DetailMasterProduk;
