
import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import ActivitySheet from "@/components/activity/activity-sheet";
import type { ActivityItemData } from "@/components/activity/activity-item";
import DetailPageLayout from "@/components/detail-page/detail-page-ayout";
import DetailSection from "@/components/detail-page/detail-section";
import { Button } from "@/components/ui/button";

import { FaUserShield } from "react-icons/fa";
import { MdWorkHistory } from "react-icons/md";
import { ShieldCheck, KeyRound } from "lucide-react";

import type { RoleAksesDetail } from "../types/role-akses";

type DetailRoleAksesProps = {
  open: boolean;
  roleAkses: RoleAksesDetail | null;
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

const DetailRoleAkses = ({
  open,
  roleAkses,
  loading,
  error,
  onClose,
}: DetailRoleAksesProps) => {
  const [openActivity, setOpenActivity] = useState(false);

  const activityLogs = useMemo<ActivityItemData[]>(
    () =>
      (roleAkses?.activities ?? []).map((activity) => ({
        id: activity.id,
        primaryText: activity.user?.name ?? "System",
        secondaryText: activity.description,
        occurredAt: activity.created_at,
        occurredAtLabel: activity.created_at_human,
        changes: activity.changes ?? {},
        action: activity.event,
        detailText:
          activity.event?.toLowerCase() === "created"
            ? "Data Role Akses berhasil ditambahkan."
            : undefined,
      })),
    [roleAkses?.activities],
  );

  if (!open) return null;

  return (
    <>
      <DetailPageLayout
        icon={FaUserShield}
        title="Detail Role Akses"
        subtitle={roleAkses?.name ?? "Detail data role akses"}
        onClose={onClose}
      >
        <DetailSection
          icon={ShieldCheck}
          title="Informasi Role Akses"
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
                Memuat detail role akses...
              </p>
            ) : error ? (
              <p
                role="alert"
                className="py-8 text-center text-sm text-red-600"
              >
                {error}
              </p>
            ) : roleAkses ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                  <InfoItem
                    label="Nama Role"
                    value={roleAkses.name}
                  />

                  <InfoItem
                    label="Guard Name"
                    value={
                      <Badge variant="muted">
                        {roleAkses.guard_name}
                      </Badge>
                    }
                  />

                  <InfoItem
                    label="Jumlah Permission"
                    value={
                      <Badge variant="blue">
                        {roleAkses.permissions?.length ?? 0} Permission
                      </Badge>
                    }
                  />

                  <InfoItem
                    label="Tanggal Dibuat"
                    value={
                      roleAkses.created_at
                        ? new Date(roleAkses.created_at).toLocaleString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "-"
                    }
                  />

                  <InfoItem
                    label="Terakhir Diperbarui"
                    value={
                      roleAkses.updated_at
                        ? new Date(roleAkses.updated_at).toLocaleString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "-"
                    }
                  />
                </div>

                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center gap-2">
                    <KeyRound
                      size={18}
                      className="text-slate-500"
                    />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      Daftar Permission
                    </h3>
                  </div>

                  {roleAkses.permissions?.length ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {roleAkses.permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex min-w-0 items-start gap-3 rounded-lg border p-3"
                        >
                          <ShieldCheck
                            size={18}
                            className="mt-0.5 shrink-0 text-blue-500"
                          />

                          <div className="min-w-0">
                            <p className="wrap-break-word text-sm font-medium text-slate-800 dark:text-slate-100">
                              {permission.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Guard: {permission.guard_name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-dashed py-8 text-center text-sm text-slate-500">
                      Belum ada permission yang diberikan untuk role ini.
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </DetailSection>
      </DetailPageLayout>

      <ActivitySheet
        open={openActivity}
        onOpenChange={setOpenActivity}
        data={activityLogs}
      />
    </>
  );
};

export default DetailRoleAkses;
