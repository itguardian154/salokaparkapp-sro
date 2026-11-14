import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import type { ReactNode } from "react";

import {
    FaArrowLeft,
    FaFileInvoice,
} from "react-icons/fa";

import {
    Building2,
    CalendarDays,
    ClipboardList,
    Clock,
    FileText,
    MapPin,
    Package,
    ShoppingBag,
    Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import DetailActionFooter, {
    type DetailAction,
} from "@/components/detail-page/detail-action-footer";
import DetailPageLayout from "@/components/detail-page/detail-page-ayout";
import DetailSection from "@/components/detail-page/detail-section";

import DetailOrderTable from "@/features/invoice/components/detail-order-table";
import type { InvoiceOrder } from "@/features/invoice/types/invoice-order";

import { getReservasiDetail } from "../service/reservasi-service";
import type {
    ReservasiDetail,
    ReservasiItem,
} from "../types/reservasi";

// ==============================
// TYPES
// ==============================

type ReservasiDetailView = ReservasiDetail & {
    booking_type?: string | null;
    payment_status?: string | null;
    segment_option_id?: number | null;
    segment_option_name?: string | null;
    total_ticket_count?: number | null;
};

type EventOrderView = Record<string, unknown>;

// ==============================
// HELPERS
// ==============================

const hasValue = (value: unknown): boolean => {
    if (value === null || value === undefined) return false;

    if (typeof value === "string" && value.trim() === "") {
        return false;
    }

    if (Array.isArray(value) && value.length === 0) {
        return false;
    }

    return true;
};

const formatDate = (value: unknown): string => {
    if (!hasValue(value)) return "-";

    const date = new Date(String(value));

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

const formatDateTime = (value: unknown): string => {
    if (!hasValue(value)) return "-";

    const date = new Date(String(value));

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatTime = (value: unknown): string => {
    if (!hasValue(value)) return "-";

    const time = String(value);

    return time.length >= 5 ? time.slice(0, 5) : time;
};

const formatCurrency = (value: unknown): string => {
    if (!hasValue(value)) return "-";

    const number = Number(value);

    if (Number.isNaN(number)) return String(value);

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(number);
};

const formatValue = (value: unknown): ReactNode => {
    if (!hasValue(value)) return "-";

    if (Array.isArray(value)) {
        return value.map((item) => String(item)).join(", ");
    }

    if (typeof value === "boolean") {
        return value ? "Ya" : "Tidak";
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return String(value);
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
            <p className="text-xs font-medium text-muted-foreground">
                {label}
            </p>

            <div className="break-words text-sm font-semibold text-foreground">
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

    const [detail, setDetail] = useState<ReservasiDetailView | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==============================
    // GET DETAIL RESERVASI
    // ==============================

    useEffect(() => {
        if (!id) {
            setError("ID reservasi tidak ditemukan.");
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        const fetchDetail = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getReservasiDetail(
                    id,
                    controller.signal,
                );

                setDetail(response as ReservasiDetailView);
            } catch (err) {
                if (axios.isCancel(err) || controller.signal.aborted) {
                    return;
                }

                console.error("Gagal mengambil detail reservasi:", err);

                setError(
                    axios.isAxiosError(err)
                        ? err.response?.data?.message ||
                        "Gagal mengambil detail reservasi."
                        : "Terjadi kesalahan saat mengambil detail reservasi.",
                );
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchDetail();

        return () => controller.abort();
    }, [id]);

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
    }, [detail]);

    // ==============================
    // EVENT ORDER
    // ==============================

    const eventOrders: EventOrderView[] = useMemo(() => {
        return (detail?.event_orders ?? []) as unknown as EventOrderView[];
    }, [detail]);

    // ==============================
    // FOOTER ACTION
    // ==============================

    const actions: DetailAction[] = [
        {
            id: "back",
            label: "Kembali",
            icon: <FaArrowLeft size={15} />,
            variant: "primer",
            mobileColor: "bg-primer-60",
            position: "right",
            onClick: () => navigate("/reservation"),
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
        <DetailPageLayout
            icon={FaFileInvoice}
            title="Detail Reservasi"
            subtitle={detail.sales_order_number || "Informasi detail reservasi"}
            onClose={() => navigate("/reservation")}
            footer={<DetailActionFooter actions={actions} />}
        >
            {/* ========================================= */}
            {/* INFORMASI RESERVASI */}
            {/* ========================================= */}

            <DetailSection
                icon={CalendarDays}
                title="Informasi Reservasi"
                variant="blue"
            >
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {/* Informasi Invoice dan Reservasi */}
                    <InfoItem label="Nomor Sales Order" value={formatValue(detail.sales_order_number)} />
                    <InfoItem label="Nomor Invoice" value={formatValue(detail.invoice_number)} />
                    <InfoItem label="Tipe Booking" value={formatValue(detail.booking_type)} />
                    <InfoItem label="Tanggal Sales Order" value={formatDate(detail.sales_order_date)} />
                    <InfoItem label="Status Reservasi" value={
                        <Badge variant="secondary">{detail.status_label || detail.status}</Badge>
                    } />

                    {/* Customer */}
                    <InfoItem label="Nama Customer" value={formatValue(detail.customer_name)} />
                    <InfoItem label="Alamat Customer" value={formatValue(detail.customer_address)} />

                    {/* Partner */}
                    <InfoItem label="Nama Partner" value={formatValue(detail.partner_name)} />
                    <InfoItem label="Nama Cabang Partner" value={formatValue(detail.partner_branch_name)} />

                    {/* Segment */}
                    <InfoItem label="Segment" value={formatValue(detail.segment_name)} />
                    <InfoItem label="Detail Segment" value={formatValue(detail.segment_detail_name)} />
                    <InfoItem label="Sub Segment Detail" value={formatValue(detail.sub_segment_detail_name)} />
                    <InfoItem label="Segment Option" value={formatValue(detail.segment_option_name)} />

                    {/* Sales */}
                    <InfoItem label="Nama Sales Person" value={formatValue(detail.sales_person_name)} />
                    <InfoItem label="Dibuat Oleh" value={formatValue(detail.created_by_name)} />

                    {/* Kedatangan */}
                    <InfoItem label="Tanggal Kedatangan" value={formatDate(detail.arrival_date)} />
                    <InfoItem label="Access Tour Leader" value={formatValue(detail.access_tour_leader)} />
                    <InfoItem label="Arrival Type" value={formatValue(detail.arrival_type)} />
                    <InfoItem label="Arrival Time" value={formatTime(detail.arrival_time)} />

                    {/* Metadata */}
                    <InfoItem label="Catatan" value={formatValue(detail.notes)} />
                </div>
            </DetailSection>
            {/* ========================================= */}
            {/* DETAIL PESANAN */}
            {/* ========================================= */}

            <DetailSection
                icon={ClipboardList}
                title="Detail Pesanan"
                variant="orange"
            >
                <div className="p-5">
                    {invoiceOrderItems.length > 0 ? (
                        <DetailOrderTable data={invoiceOrderItems} />
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

            {/* ========================================= */}
            {/* EVENT ORDER */}
            {/* ========================================= */}

            <DetailSection
                icon={Building2}
                title="Event Order"
                variant="green"
            >
                <div className="space-y-4 p-5">
                    {eventOrders.length > 0 ? (
                        eventOrders.map((event, index) => (
                            <div
                                key={
                                    hasValue(event.id)
                                        ? String(event.id)
                                        : `event-order-${index}`
                                }
                                className="overflow-hidden rounded-xl border bg-card"
                            >
                                {/* Header Event Order */}

                                <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primer-60/10 text-primer-60">
                                            <Building2 size={18} />
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold">
                                                {hasValue(event.department_name)
                                                    ? String(event.department_name)
                                                    : `Event Order ${index + 1}`}
                                            </p>

                                            {hasValue(event.department_id) && (
                                                <p className="text-xs text-muted-foreground">
                                                    {String(event.department_id)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {hasValue(event.status_label) && (
                                        <Badge variant="secondary">
                                            {String(event.status_label)}
                                        </Badge>
                                    )}
                                </div>

                                {/* Isi Event Order */}

                                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <InfoItem
                                        label="ID Sub Department"
                                        value={formatValue(event.sub_department_id)}
                                    />

                                    <InfoItem
                                        label="Nama Sub Department"
                                        value={formatValue(event.sub_department_name)}
                                    />

                                    <InfoItem
                                        label="Product ID"
                                        value={formatValue(event.product_id)}
                                    />

                                    <InfoItem
                                        label="Product Code"
                                        value={formatValue(event.product_code)}
                                    />

                                    <InfoItem
                                        label="Product Description"
                                        value={formatValue(event.product_description)}
                                    />

                                    <InfoItem
                                        label="Quantity"
                                        value={formatValue(event.quantity)}
                                    />

                                    <InfoItem
                                        label="Unit Price"
                                        value={
                                            hasValue(event.unit_price)
                                                ? formatCurrency(event.unit_price)
                                                : null
                                        }
                                    />

                                    <InfoItem
                                        label="Total Price"
                                        value={
                                            hasValue(event.total_price)
                                                ? formatCurrency(event.total_price)
                                                : null
                                        }
                                    />

                                    <InfoItem
                                        label="Meal Voucher"
                                        value={formatValue(event.meal_voucher)}
                                    />

                                    <InfoItem
                                        label="Voucher Tour Leader"
                                        value={formatValue(event.voucher_tour_leader)}
                                    />

                                    <InfoItem
                                        label="Shopping Voucher"
                                        value={formatValue(event.shopping_voucher)}
                                    />

                                    <InfoItem
                                        label="Location ID"
                                        value={formatValue(event.location_id)}
                                    />

                                    <InfoItem
                                        label="Location Detail"
                                        value={formatValue(event.location_detail)}
                                    />

                                    <InfoItem
                                        label="Serving Time"
                                        value={formatValue(event.serving_time)}
                                    />

                                    <InfoItem
                                        label="Serving Location"
                                        value={formatValue(event.serving_location)}
                                    />

                                    <InfoItem
                                        label="Serving Type"
                                        value={formatValue(event.serving_type)}
                                    />

                                    <InfoItem
                                        label="Ticket Print Date"
                                        value={formatDate(event.ticket_print_date)}
                                    />

                                    <InfoItem
                                        label="Start At"
                                        value={formatDateTime(event.start_at)}
                                    />

                                    <InfoItem
                                        label="End At"
                                        value={formatDateTime(event.end_at)}
                                    />

                                    <InfoItem
                                        label="Diterima Oleh"
                                        value={formatValue(event.received_by)}
                                    />

                                    <InfoItem
                                        label="Diterima Pada"
                                        value={formatDateTime(event.received_at)}
                                    />

                                    <InfoItem
                                        label="Dibuat Oleh"
                                        value={formatValue(event.created_by)}
                                    />

                                    <InfoItem
                                        label="Dibuat Pada"
                                        value={formatDateTime(event.created_at)}
                                    />

                                    <InfoItem
                                        label="Diperbarui Pada"
                                        value={formatDateTime(event.updated_at)}
                                    />

                                    <InfoItem
                                        label="Deskripsi"
                                        value={formatValue(event.description)}
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-lg border border-dashed p-8 text-center">
                            <Building2
                                size={30}
                                className="mx-auto mb-2 text-muted-foreground"
                            />

                            <p className="text-sm text-muted-foreground">
                                Belum ada Event Order.
                            </p>
                        </div>
                    )}
                </div>
            </DetailSection>
        </DetailPageLayout>
    );
};

export default DetailReservasi;