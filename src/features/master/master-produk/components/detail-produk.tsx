import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import ActivitySheet from "@/components/activity/activity-sheet";
import type { ActivityItemData } from "@/components/activity/activity-item";
import SROHistoryApproval from "@/components/detail-page/history-approval";
import DetailPageLayout from "@/components/detail-page/detail-page-ayout";
import DetailActionFooter, {
  type DetailAction,
} from "@/components/detail-page/detail-action-footer";
import DetailSection from "@/components/detail-page/detail-section";
import { formatRupiah } from "@/lib/utils";
import { FaDatabase, FaTimes } from "react-icons/fa";
import { MdWorkHistory } from "react-icons/md";
import { Package } from "lucide-react";
import type { ProdukDetail } from "../types/master-produk";
import { Button } from "@/components/ui/button";
import ReferenceFilePreview from "./reference-file-preview";
import DepartmentOwnerList from "./department-owner-list";

type DetailMasterProdukProps = {
  open: boolean;
  produk: ProdukDetail | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
};

type InfoItemProps = {
  label: string;
  value: ReactNode;
};

const InfoItem = ({ label, value }: InfoItemProps) => (
  <div className="space-y-1">
    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
      {label}
    </p>
    <div className="mt-1 wrap-break-word text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-200">
      {value ?? "-"}
    </div>
  </div>
);

const DetailMasterProduk = ({
  open,
  produk,
  loading,
  error,
  onClose,
}: DetailMasterProdukProps) => {
  const [openActivity, setOpenActivity] = useState(false);

  const activityLogs = useMemo<ActivityItemData[]>(
    () =>
      (produk?.activities ?? []).map((activity) => ({
          id: activity.id,
          primaryText: activity.user?.name ?? "System",
          secondaryText: activity.description,
          occurredAt: activity.created_at,
          occurredAtLabel: activity.created_at_human,
          changes: activity.changes.after,
          changesTitle: "Update",
        })),
    [produk?.activities],
  );

  const approvals = useMemo(
    () =>
      (produk?.approvals ?? []).flatMap((approval) => {
        if (typeof approval !== "object" || approval === null) return [];

        const item = approval as Record<string, unknown>;
        if (
          typeof item.action !== "string" ||
          typeof item.grade !== "string" ||
          typeof item.name !== "string"
        ) {
          return [];
        }

        return [{ action: item.action, grade: item.grade, name: item.name }];
      }),
    [produk?.approvals],
  );

  if (!open) return null;

  const approvalVariant =
    produk?.status_label === "Full Approved"
      ? "success"
      : produk?.status_label?.toLocaleLowerCase().includes("waiting")
        ? "warning"
        : "muted";

  const actions: DetailAction[] = [
    {
      id: "activity",
      label: "Aktivitas",
      icon: <MdWorkHistory size={16} />,
      variant: "primer",
      mobileColor: "bg-emerald-500",
      position: "right",
      onClick: () => setOpenActivity(true),
    },
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
    <>
      <DetailPageLayout
        icon={FaDatabase}
        title="Detail Master Produk"
        subtitle={produk?.name ?? "Detail data master produk"}
        onClose={onClose}
        footer={<DetailActionFooter actions={actions} />}
      >
        <DetailSection
          icon={Package}
          title="Informasi Produk"
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
            {loading ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Memuat detail produk...
              </p>
            ) : error ? (
              <p role="alert" className="py-8 text-center text-sm text-red-600">
                {error}
              </p>
            ) : produk ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                <InfoItem label="Nama Produk" value={produk.name} />
                <InfoItem label="Harga" value={formatRupiah(produk.price)} />
                <InfoItem
                  label="Referensi"
                  value={
                    <ReferenceFilePreview
                      referenceFile={produk.reference_file}
                      size="medium"
                    />
                  }
                />
                   <InfoItem
                  label="Departemen Terkait"
                  value={
                    <DepartmentOwnerList
                      owners={produk.department_owner ?? []}
                      fallback={produk.departemen}
                    />
                  }
                />
                <InfoItem label="Tipe Hari" value={produk.day_type} />
                <InfoItem
                  label="Status Approval"
                  value={
                    <Badge variant={approvalVariant}>
                      {produk.status_label}
                    </Badge>
                  }
                />
                <InfoItem
                  label="Status Produk"
                  value={
                    <Badge variant={produk.is_active ? "success" : "warning"}>
                      {produk.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  }
                />
                <InfoItem
                  label="Jenis Produk"
                  value={produk.is_ticket ? "Tiket" : "Non-tiket"}
                />
                <div className="md:col-span-2 lg:col-span-3">
                  <InfoItem
                    label="Deskripsi"
                    value={
                      <div className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                "
                                {produk.description || "-"}
                                "
                              </p>
                            </div>
                    }
                  />
                </div>
              </div>
            ) : null}
          </div>
        </DetailSection>

        {!loading && !error && <SROHistoryApproval approvals={approvals} />}
      </DetailPageLayout>

      <ActivitySheet
        open={openActivity}
        onOpenChange={setOpenActivity}
        data={activityLogs}
      />
    </>
  );
};

export default DetailMasterProduk;
