
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ReactNode } from "react";

import {
    FaCheckCircle,
    FaDownload,
    FaFileInvoice,
    FaTimes,
    FaUndo,
} from "react-icons/fa";
import { MdWorkHistory } from "react-icons/md";

import {
    AlertTriangle,
    Building2Icon,
    CalendarDays,
    ClipboardList,
    HandCoins,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import DetailActionFooter, {
    type DetailAction,
} from "@/components/detail-page/detail-action-footer";
import DetailPageLayout from "@/components/detail-page/detail-page-ayout";
import DetailSection from "@/components/detail-page/detail-section";

import DetailOrderTable from "@/features/invoice/components/detail-order-table";
import DetailPaymentTable from "@/features/invoice/components/detail-payment-table";
import PaymentInformation from "@/features/invoice/components/payment-information";

import type { InvoiceOrder } from "@/features/invoice/types/invoice-order";
import type { ActivityItemData } from "@/components/activity/activity-item";

import { useDepartemen } from "@/features/departemen/hooks/use-departemen";
import { useDetailReservasi } from "../hooks/use-detail-reservasi";

import {
    formatDate,
    formatTime,
    hasValue,
    mapInvoicePayments,
} from "../utils/reservasi";

import { isEligibleReservasi } from "../utils/view-revenue";

import type {
    ReservasiItem,
    ReservasiDetailEO,
    ReservasiActivity,
    CreateReservasiEventOrder,
} from "../types/reservasi";

import CreateEventOrderModal from "./create-event-order";
import ActivitySheet from "@/components/activity/activity-sheet";
import EventOrderContent from "./event-order-content";
import { FaCheck } from "react-icons/fa6";

// ==============================
// ACTIVITY LOG MAPPING
// ==============================

const mapReservasiActivityLogs = (
    activities: ReservasiActivity[] = [],
): ActivityItemData[] => {
    return activities.map((activity) => ({
        id: activity.id,
        primaryText: activity.user?.name ?? "System",
        secondaryText: activity.description,
        occurredAt: activity.created_at,
        occurredAtLabel: activity.created_at_human,
        changes: activity.changes ?? {},
        action: activity.event,
        detailText:
            activity.event?.toLowerCase() === "created"
                ? "Data reservasi berhasil ditambahkan."
                : undefined,
    }));
};

// ==============================
// INFO ITEM
// ==============================

const InfoItem = ({
    label,
    value,
}: {
    label: string;
    value: ReactNode;
}) => {
    if (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "")
    ) {
        return null;
    }

    return (
        <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {label}
            </p>

            <div className="wrap-break-word text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-200">
                {value}
            </div>
        </div>
    );
};

// ==============================
// MAIN COMPONENT
// ==============================

const DetailReservasi = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const {
        detail,
        setDetail,
        loading,
        error,
    } = useDetailReservasi(id);

    const [openActivity, setOpenActivity] = useState(false);

    const [openCreateEventOrder, setOpenCreateEventOrder] =
        useState(false);

    const [editingEventOrderIndex, setEditingEventOrderIndex] =
        useState<number | null>(null);

    // ==============================
    // DEPARTEMEN
    // ==============================

    const departmentId = localStorage.getItem("idDepartemen");
    const subDepartmentId = localStorage.getItem("id_sub_dept");

    const eligibleReservasi = isEligibleReservasi(
        departmentId,
        subDepartmentId,
    );

    // ID departemen pengguna yang sedang login.
    const loginDepartmentId = departmentId;

    const {
        departemen,
        searchDepartemen,
        setSearchDepartemen,
        loading: loadingDepartemen,
        error: departemenError,
    } = useDepartemen();

    const departemenOptions = {
        items: departemen,
        search: searchDepartemen,
        onSearchChange: setSearchDepartemen,
        loading: loadingDepartemen,
        error: departemenError,
    };

    // ==============================
    // ACTIVITY LOGS
    // ==============================

    const activityLogs = useMemo(
        () => mapReservasiActivityLogs(detail?.activities ?? []),
        [detail?.activities],
    );

    // ==============================
    // DETAIL PESANAN
    // ==============================

    const invoiceOrderItems: InvoiceOrder[] = useMemo(() => {
        return ((detail?.items ?? []) as ReservasiItem[]).map((item) => ({
            id: item.id,
            productId: item.product_id ?? 0,
            product: item.product_name ?? "",
            description: item.product_description ?? "",
            quantity: Number(item.quantity) || 0,
            compliment: Number(item.bonus_quantity) || 0,
            unitPrice: Number(item.unit_price) || 0,
            discountPrice: Number(item.discount_amount) || 0,
            subtotal: Number(item.subtotal) || 0,
            isTicket: Boolean(item.is_ticket),
        }));
    }, [detail?.items]);

    // ==============================
    // EVENT ORDER
    // ==============================

    const eventOrders: ReservasiDetailEO[] = useMemo(
        () => detail?.event_orders ?? [],
        [detail?.event_orders],
    );

    // ==============================
    // EVENT ORDER HANDLERS
    // ==============================

    const handleEditEventOrder = (index: number) => {
        const selectedEventOrder = eventOrders[index];

        // Pastikan hanya departemen pemilik Event Order
        // yang dapat membuka modal edit.
        if (
            !loginDepartmentId ||
            !selectedEventOrder ||
            String(selectedEventOrder.department_id) !==
                String(loginDepartmentId)
        ) {
            return;
        }

        setEditingEventOrderIndex(index);
        setOpenCreateEventOrder(true);
    };

    const handleCloseEventOrderModal = () => {
        setOpenCreateEventOrder(false);
        setEditingEventOrderIndex(null);
    };

    const handleSubmitEventOrder = async (
        payload: CreateReservasiEventOrder,
        attachments: File[],
    ): Promise<void> => {
        if (editingEventOrderIndex === null) return;

        // Tidak mengubah mekanisme upload.
        void attachments;

        const toNullableNumber = (
            value: number | string | null | undefined,
        ): number | null => {
            if (value === null || value === undefined || value === "") {
                return null;
            }

            const numberValue = Number(value);

            return Number.isNaN(numberValue) ? null : numberValue;
        };

        // Attachment dari form tidak digunakan untuk menggantikan
        // attachment object yang berasal dari response GET Detail.
        const {
            attachments: _payloadAttachments,
            ...payloadWithoutAttachments
        } = payload;

        setDetail((prev) => {
            if (!prev) return prev;

            const updatedEventOrders: ReservasiDetailEO[] =
                prev.event_orders.map((event, index) => {
                    if (index !== editingEventOrderIndex) {
                        return event;
                    }

                    return {
                        ...event,
                        ...payloadWithoutAttachments,
                        attachments: event.attachments ?? [],
                        quantity: toNullableNumber(payload.quantity),
                        unit_price: toNullableNumber(payload.unit_price),
                        total_price: toNullableNumber(payload.total_price),
                    };
                });

            return {
                ...prev,
                event_orders: updatedEventOrders,
            };
        });

        handleCloseEventOrderModal();
    };

    // ==============================
    // PAYMENT SUMMARY
    // ==============================

    const totalAmount = Number(
        detail?.invoice?.total_amount ?? detail?.total_amount ?? 0,
    );

    const paidAmount = Number(
        detail?.invoice?.paid_amount ?? detail?.paid_amount ?? 0,
    );

    const remainingAmount = Math.max(totalAmount - paidAmount, 0);

    const paymentItems = detail?.invoice?.payments ?? [];

    // ==============================
    // ACTIONS
    // ==============================

    const actions: DetailAction[] = [
        {
            id: "download",
            label: "Download",
            icon: <FaDownload size={15} />,
            variant: "blue",
            mobileColor: "bg-blue-600",
            position: "left",
            onClick: () => {
                // TODO: Download
            },
        },
        {
            id: "approve",
            label: "Approve",
            icon: <FaCheck size={15} />,
            variant: "success",
            mobileColor: "bg-emerald-600",
            position: "right",
            onClick: () => {
                // TODO: Approve
            },
        },
        {
            id: "accept",
            label: "Accept",
            icon: <FaCheckCircle size={15} />,
            variant: "accept",
            mobileColor: "bg-teal-600",
            position: "right",
            onClick: () => {
                // TODO: Accept
            },
        },
        {
            id: "back-to-draft",
            label: "Back to Draft",
            icon: <FaUndo size={15} />,
            variant: "back",
            mobileColor: "bg-gray-500",
            position: "right",
            onClick: () => {
                // TODO: Back to Draft
            },
        },
        {
            id: "reject",
            label: "Reject",
            icon: <FaTimes size={15} />,
            variant: "destructive",
            mobileColor: "bg-red-600",
            position: "right",
            onClick: () => {
                // TODO: Reject
            },
        },
    ];

    // ==============================
    // LOADING
    // ==============================

    if (loading) {
        return (
            <DetailPageLayout
                icon={FaFileInvoice}
                title="Detail Reservasi"
                subtitle="Memuat informasi reservasi..."
                onClose={() => navigate("/reservation")}
            >
                <div className="flex min-h-[250px] items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primer-60 border-t-transparent" />

                        <p className="text-sm text-muted-foreground">
                            Memuat data reservasi...
                        </p>
                    </div>
                </div>
            </DetailPageLayout>
        );
    }

    // ==============================
    // ERROR / DATA NOT FOUND
    // ==============================

    if (error || !detail) {
        return (
            <DetailPageLayout
                icon={FaFileInvoice}
                title="Detail Reservasi"
                subtitle="Informasi detail reservasi"
                onClose={() => navigate("/reservation")}
                footer={<DetailActionFooter actions={actions} />}
            >
                <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-center">
                    <p className="text-sm font-medium text-red-600">
                        {error || "Data reservasi tidak ditemukan."}
                    </p>
                </div>
            </DetailPageLayout>
        );
    }

    // ==============================
    // RENDER
    // ==============================

    return (
        <>
            <DetailPageLayout
                icon={FaFileInvoice}
                title="Detail Reservasi"
                subtitle={
                    detail.sales_order_number ||
                    "Informasi detail reservasi"
                }
                onClose={() => navigate("/reservation")}
                footer={<DetailActionFooter actions={actions} />}
            >
                {/* INFORMASI RESERVASI */}

                <DetailSection
                    icon={CalendarDays}
                    title="Informasi Reservasi"
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
                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
                        {/* INFORMASI RESERVASI - KOLOM 1 SAMPAI 3 */}

                        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:col-span-2 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3">
                            {hasValue(detail.sales_order_number) && (
                                <InfoItem
                                    label="Nomor Sales Order"
                                    value={detail.sales_order_number}
                                />
                            )}

                            {hasValue(detail.invoice_number) && (
                                <InfoItem
                                    label="Nomor Invoice"
                                    value={detail.invoice_number}
                                />
                            )}

                            {hasValue(detail.booking_type) && (
                                <InfoItem
                                    label="Jenis Pemesanan"
                                    value={detail.booking_type}
                                />
                            )}

                            {hasValue(detail.customer_name) && (
                                <InfoItem
                                    label="Nama Pelanggan"
                                    value={detail.customer_name}
                                />
                            )}

                            {hasValue(detail.customer_address) && (
                                <InfoItem
                                    label="Alamat Pelanggan"
                                    value={detail.customer_address}
                                />
                            )}

                            {hasValue(detail.customer_city) && (
                                <InfoItem
                                    label="Kota Pelanggan"
                                    value={detail.customer_city}
                                />
                            )}

                            {hasValue(detail.customer_province) && (
                                <InfoItem
                                    label="Provinsi Pelanggan"
                                    value={detail.customer_province}
                                />
                            )}

                            {hasValue(detail.customer_phone) && (
                                <InfoItem
                                    label="Nomor Telepon Pelanggan"
                                    value={detail.customer_phone}
                                />
                            )}

                            {hasValue(detail.customer_contact_person) && (
                                <InfoItem
                                    label="PIC Pelanggan"
                                    value={detail.customer_contact_person}
                                />
                            )}

                            {hasValue(detail.partner_name) && (
                                <InfoItem
                                    label="Nama Group"
                                    value={detail.partner_name}
                                />
                            )}

                            {hasValue(detail.partner_association_name) && (
                                <InfoItem
                                    label="Asosiasi"
                                    value={detail.partner_association_name}
                                />
                            )}

                            {hasValue(detail.partner_city) && (
                                <InfoItem
                                    label="Kota Group"
                                    value={detail.partner_city}
                                />
                            )}

                            {hasValue(detail.partner_province) && (
                                <InfoItem
                                    label="Provinsi Group"
                                    value={detail.partner_province}
                                />
                            )}

                            {hasValue(detail.partner_phone) && (
                                <InfoItem
                                    label="Nomor Telepon Group"
                                    value={detail.partner_phone}
                                />
                            )}

                            {hasValue(detail.partner_contact_person) && (
                                <InfoItem
                                    label="PIC Group"
                                    value={detail.partner_contact_person}
                                />
                            )}

                            {hasValue(detail.partner_branch_name) && (
                                <InfoItem
                                    label="Nama Cabang"
                                    value={detail.partner_branch_name}
                                />
                            )}

                            {hasValue(detail.partner_branch_city) && (
                                <InfoItem
                                    label="Kota Cabang"
                                    value={detail.partner_branch_city}
                                />
                            )}

                            {hasValue(detail.partner_branch_province) && (
                                <InfoItem
                                    label="Provinsi Cabang"
                                    value={detail.partner_branch_province}
                                />
                            )}

                            {hasValue(detail.partner_branch_phone) && (
                                <InfoItem
                                    label="Nomor Telepon Cabang"
                                    value={detail.partner_branch_phone}
                                />
                            )}

                            {hasValue(detail.partner_branch_contact_person) && (
                                <InfoItem
                                    label="PIC Cabang"
                                    value={detail.partner_branch_contact_person}
                                />
                            )}

                            {hasValue(detail.sales_person_name) && (
                                <InfoItem
                                    label="Nama Sales"
                                    value={detail.sales_person_name}
                                />
                            )}

                            {hasValue(detail.segment_name) && (
                                <InfoItem
                                    label="Segmen"
                                    value={detail.segment_name}
                                />
                            )}

                            {hasValue(detail.segment_detail_name) && (
                                <InfoItem
                                    label="Detail Segmen"
                                    value={detail.segment_detail_name}
                                />
                            )}

                            {hasValue(detail.sub_segment_detail_name) && (
                                <InfoItem
                                    label="Sub Segmen"
                                    value={detail.sub_segment_detail_name}
                                />
                            )}

                            {hasValue(detail.segment_option_name) && (
                                <InfoItem
                                    label="Pilihan Segmen"
                                    value={detail.segment_option_name}
                                />
                            )}

                            {hasValue(detail.access_tour_leader) && (
                                <InfoItem
                                    label="Akses Tour Leader"
                                    value={detail.access_tour_leader}
                                />
                            )}
                        </div>

                        {/* INFORMASI KEDATANGAN & STATUS - KOLOM 4 */}

                        {(hasValue(detail.arrival_date) ||
                            hasValue(detail.arrival_type) ||
                            hasValue(detail.arrival_time) ||
                            hasValue(detail.status_label || detail.status)) && (
                            <div className="flex flex-col gap-5 border-l border-slate-200 pl-5 dark:border-slate-700">
                                {hasValue(detail.arrival_date) && (
                                    <InfoItem
                                        label="Tanggal Kedatangan"
                                        value={formatDate(detail.arrival_date)}
                                    />
                                )}

                                {hasValue(detail.arrival_type) && (
                                    <div>
                                        <p className="mb-1 text-sm text-muted-foreground">
                                            Tipe Kedatangan
                                        </p>

                                        {String(detail.arrival_type).toLowerCase() === "early" ? (
                                            <Badge className="gap-1.5 border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                                <AlertTriangle className="h-3.5 w-3.5" />
                                                EARLY - PERHATIAN
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                {String(detail.arrival_type).toUpperCase()}
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                {hasValue(detail.arrival_time) && (
                                    <InfoItem
                                        label="Jam Kedatangan"
                                        value={formatTime(detail.arrival_time)}
                                    />
                                )}

                                {hasValue(detail.status_label || detail.status) && (
                                    <InfoItem
                                        label="Status Reservasi"
                                        value={
                                            detail.status_label ||
                                            detail.status
                                        }
                                    />
                                )}
                            </div>
                        )}

                        {/* DESKRIPSI */}

                        {hasValue(detail.notes) && (
                            <div className="col-span-full mt-2 border-t border-slate-200 pt-5 dark:border-slate-700">
                                <InfoItem
                                    label="Deskripsi"
                                    value={
                                        <p className="text-sm italic leading-relaxed text-slate-600 dark:text-slate-300">
                                            "{detail.notes}"
                                        </p>
                                    }
                                />
                            </div>
                        )}
                    </div>
                </DetailSection>

                {/* DETAIL PESANAN */}

                <DetailSection
                    icon={ClipboardList}
                    title="Detail Pesanan"
                    variant="orange"
                >
                    <div className="p-5">
                        {invoiceOrderItems.length > 0 ? (
                            <DetailOrderTable
                                data={invoiceOrderItems}
                                hideActions
                                showFinancialColumns={eligibleReservasi}
                            />
                        ) : (
                            <div className="rounded-lg border border-dashed p-8 text-center">
                                <ClipboardList
                                    size={30}
                                    className="mx-auto mb-2 text-muted-foreground"
                                />

                                <p className="text-sm text-muted-foreground">
                                    Belum ada detail pesanan.
                                </p>
                            </div>
                        )}
                    </div>
                </DetailSection>

                {/* INFORMASI PEMBAYARAN */}

                {eligibleReservasi && (
                    <DetailSection
                        icon={HandCoins}
                        title="Informasi Pembayaran"
                        variant="blue"
                    >
                        <div className="p-5">
                            <PaymentInformation
                                totalAmount={totalAmount}
                                paidAmount={paidAmount}
                                remainingAmount={remainingAmount}
                            />
                        </div>

                        <div className="p-5">
                            <DetailPaymentTable
                                data={mapInvoicePayments(paymentItems)}
                                hideActions
                            />
                        </div>
                    </DetailSection>
                )}

                {/* EVENT ORDER */}

                <DetailSection
                    icon={Building2Icon}
                    title="Event Order"
                    variant="orange"
                >
                    <div className="space-y-4 p-5">
                        {eventOrders.map((item, index) => {
                            const isMyDepartment =
                                Boolean(loginDepartmentId) &&
                                String(item.department_id) ===
                                    String(loginDepartmentId);

                            return (
                                <EventOrderContent
                                    key={item.id ?? index}
                                    item={item}
                                    isAssignedDepartment={isMyDepartment}
                                    onEdit={
                                        isMyDepartment
                                            ? () => handleEditEventOrder(index)
                                            : undefined
                                    }
                                />
                            );
                        })}
                    </div>
                </DetailSection>

                <CreateEventOrderModal
                    open={openCreateEventOrder}
                    onClose={handleCloseEventOrderModal}
                    onSubmit={handleSubmitEventOrder}
                    initialData={
                        editingEventOrderIndex !== null
                            ? eventOrders[
                                  editingEventOrderIndex
                              ] as unknown as CreateReservasiEventOrder
                            : null
                    }
                    departemenOptions={departemenOptions}
                    invoiceItems={detail.items ?? []}
                />
            </DetailPageLayout>

            {/* ACTIVITY SHEET */}

            <ActivitySheet
                open={openActivity}
                onOpenChange={setOpenActivity}
                data={activityLogs}
            />
        </>
    );
};

export default DetailReservasi;
