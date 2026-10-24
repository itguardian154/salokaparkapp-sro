import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import ActivitySheet from "@/components/activity/activity-sheet";
import type { ActivityItemData } from "@/components/activity/activity-item";
import DetailPageLayout from "@/components/detail-page/detail-page-ayout";
import DetailSection from "@/components/detail-page/detail-section";

import { FaUsers } from "react-icons/fa";
import { MdWorkHistory } from "react-icons/md";
import { Building2} from "lucide-react";
import { Button } from "@/components/ui/button";

import type { CustomerDetail } from "../types/customer";

type DetailCustomerProps = {
  open: boolean;
  customer: CustomerDetail | null;
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

const DetailCustomer = ({
  open,
  customer,
  loading,
  error,
  onClose,
}: DetailCustomerProps) => {
  const [openActivity, setOpenActivity] = useState(false);

  const activityLogs = useMemo<ActivityItemData[]>(
    () =>
      (customer?.activities ?? []).map((activity) => ({
        id: activity.id,
        primaryText: activity.user?.name ?? "System",
        secondaryText: activity.description,
        occurredAt: activity.created_at,
        occurredAtLabel: activity.created_at_human,
        changes: activity.changes.after,
        changesTitle: "Update",
      })),
    [customer?.activities],
  );

  if (!open) return null;

  return (
    <>
      <DetailPageLayout
        icon={FaUsers}
        title="Detail Customer"
        subtitle={customer?.name ?? "Detail data customer"}
        onClose={onClose}
      >
        <DetailSection
          icon={Building2}
          title="Informasi Customer"
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
                Memuat detail customer...
              </p>
            ) : error ? (
              <p
                role="alert"
                className="py-8 text-center text-sm text-red-600"
              >
                {error}
              </p>
            ) : customer ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                <InfoItem
                  label="Nama Customer"
                  value={customer.name}
                />

                <InfoItem
                  label="WhatsApp Customer"
                  value={customer.phone}
                />

                <InfoItem
                  label="Email Customer"
                  value={customer.email}
                />

                <InfoItem
                  label="Nama PIC"
                  value={customer.contact_person}
                />

                <InfoItem
                  label="Segment"
                  value={customer.segment?.name}
                />

                <InfoItem
                  label="Segment Detail"
                  value={customer.segment_detail?.name}
                />

                <InfoItem
                  label="Provinsi"
                  value={customer.province_name}
                />

                <InfoItem
                  label="Kota/Kabupaten"
                  value={customer.city_name}
                />

                <InfoItem
                  label="Status Customer"
                  value={
                    <Badge
                      variant={customer.is_active ? "success" : "warning"}
                    >
                      {customer.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  }
                />
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

export default DetailCustomer;