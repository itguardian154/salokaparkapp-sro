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
import { FaDatabase, FaSave, FaTimes } from "react-icons/fa";
import { MdWorkHistory } from "react-icons/md";
import { Package, Signature } from "lucide-react";
import type { ProdukDetail } from "../types/master-produk";
import type { ProdukApprovalAction } from "../hooks/use-produk-approval";
import { Button } from "@/components/ui/button";
import ReferenceFilePreview from "./reference-file-preview";
import DepartmentOwnerList from "./department-owner-list";

type DetailMasterProdukProps = {
  open: boolean;
  produk: ProdukDetail | null;
  loading: boolean;
  error: string | null;
  canApprove: boolean;
  checkingApprovalPermission: boolean;
  approvalPermissionError: string | null;
  loadingApprovalAction: ProdukApprovalAction | null;
  onApprovalAction: (action: ProdukApprovalAction) => void;
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
  canApprove,
  checkingApprovalPermission,
  approvalPermissionError,
  loadingApprovalAction,
  onApprovalAction,
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
        changes: activity.changes ?? {},
        action: activity.event,
        detailText:
          activity.event?.toLowerCase() === "created"
            ? "Data agen berhasil ditambahkan."
            : undefined,
      })),
    [produk?.activities],
  );

  const approvals = useMemo(
    () =>
      (produk?.approvals ?? []).map((approval) => ({
        action:
          approval.action === "submit"
            ? "Dibuat oleh,"
            : approval.action === "approve"
              ? "Disetujui oleh,"
              : approval.action === "reject"
                ? "Ditolak oleh,"
                : approval.action,
        name: approval.employee_name,
        grade:
          approval.grade ?? approval.position ?? approval.department ?? "-",
      })),
    [produk?.approvals],
  );

  if (!open) return null;

  const approvalVariant =
    produk?.status_label === "Full Approved"
      ? "success"
      : produk?.status_label === "Menunggu Persetujuan SPV/Manager Sales"
        ? "blue"
        : produk?.status_label === "Waiting Finance"
          ? "warning"
          : produk?.status_label === "Done"
            ? "success"
            : "muted";

  const isDraft =
    produk?.status?.toLocaleLowerCase() === "draft" ||
    produk?.status_label?.toLocaleLowerCase() === "Draft";
  const actionDisabled =
    loading || checkingApprovalPermission || loadingApprovalAction !== null;
  const actions: DetailAction[] = [];

  if (isDraft) {
    actions.push({
      id: "submit",
      label: loadingApprovalAction === "submit" ? "Memproses..." : "Submit",
      icon: <FaSave size={15} />,
      variant: "blue",
      mobileColor: "bg-blue-600",
      position: "right",
      disabled: actionDisabled,
      onClick: () => onApprovalAction("submit"),
    });
  }

  if (canApprove) {
    actions.push(
      {
        id: "reject",
        label: loadingApprovalAction === "reject" ? "Memproses..." : "Reject",
        icon: <FaTimes size={15} />,
        variant: "destructive",
        mobileColor: "bg-red-500",
        position: "right",
        disabled: actionDisabled,
        onClick: () => onApprovalAction("reject"),
      },
      {
        id: "approve",
        label: loadingApprovalAction === "approve" ? "Memproses..." : "Approve",
        icon: <Signature size={15} />,
        variant: "primer",
        mobileColor: "bg-emerald-500",
        position: "right",
        disabled: actionDisabled,
        onClick: () => onApprovalAction("approve"),
      },
    );
  }

  return (
    <>
      <DetailPageLayout
        icon={FaDatabase}
        title="Detail Master Produk"
        subtitle={produk?.name ?? "Detail data master produk"}
        onClose={onClose}
        footer={
          actions.length > 0 ? (
            <DetailActionFooter actions={actions} />
          ) : undefined
        }
      >
        {approvalPermissionError && (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            Gagal memeriksa izin approval: {approvalPermissionError}
          </p>
        )}
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
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-0 sm:grid-cols-2 lg:col-span-2">
                    <InfoItem label="Nama Produk" value={produk.name} />
                    <InfoItem
                      label="Harga"
                      value={
                        <span className="text-emerald-700 dark:text-emerald-400">
                          {formatRupiah(produk.price)}
                        </span>
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
                      label="Jenis Produk"
                      value={produk.is_ticket ? "Tiket" : "Non-tiket"}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 border-t border-slate-200 pt-5 dark:border-slate-700 sm:grid-cols-2 lg:grid-cols-1 lg:border-l lg:border-t-0 lg:py-0 lg:pl-6">
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
                        <Badge
                          variant={produk.is_active ? "success" : "warning"}
                        >
                          {produk.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      }
                    />
                  </div>
                </div>

                  <InfoItem
                    label="Deskripsi"
                    value={
                      <p className="text-sm italic leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-200 pt-5 dark:border-slate-700 sm:grid-cols-2 lg:grid-cols-1 lg:border-l lg:border-t-0 lg:py-0 lg:pl-6">
                        "{produk.description || "-"}"
                      </p>
                    }
                  />
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
