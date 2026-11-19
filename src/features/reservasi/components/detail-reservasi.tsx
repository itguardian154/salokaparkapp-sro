
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import type { ReactNode } from "react";

import {
    FaArrowLeft,
    FaFileInvoice,
} from "react-icons/fa";

import { FaPen, FaUser } from "react-icons/fa6";

import {
    AlertTriangle,
    Building2,
    CalendarDays,
    ClipboardList,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import DetailActionFooter, {
    type DetailAction,
} from "@/components/detail-page/detail-action-footer";
import DetailPageLayout from "@/components/detail-page/detail-page-ayout";
import DetailSection from "@/components/detail-page/detail-section";

import DetailOrderTable from "@/features/invoice/components/detail-order-table";
import type { InvoiceOrder } from "@/features/invoice/types/invoice-order";

import { useDepartemen } from "@/features/departemen/hooks/use-departemen";

import { getReservasiDetail } from "../service/reservasi-service";

import type {
    ReservasiDetail,
    ReservasiItem,
    CreateReservasiEventOrder,
} from "../types/reservasi";

import CreateEventOrderModal from "./create-event-order";

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

type ShoppingVoucherView = {
    name?: string | null;
    quantity?: string | number | null;
    pecahan?: string | number | null;
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
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {label}
            </p>

            <div className="break-words text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-200">
                {value}
            </div>
        </div>
    );
};

// ==============================
// EVENT ORDER STATUS
// ==============================

const getEventOrderStatus = (
    status?: unknown,
    statusLabel?: unknown,
) => {
    const value = String(statusLabel || status || "").trim();

    return {
        label: value || "-",
        normalized: String(status || statusLabel || "")
            .trim()
            .toLowerCase(),
    };
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
    // DEPARTEMEN
    // ==============================

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
    // EVENT ORDER MODAL
    // ==============================

    const [openCreateEventOrder, setOpenCreateEventOrder] = useState(false);

    const [editingEventOrderIndex, setEditingEventOrderIndex] =
        useState<number | null>(null);

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
    // EVENT ORDER HANDLERS
    // ==============================

    const handleEditEventOrder = (index: number) => {
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

        // Attachments belum dikirim karena endpoint update
        // Event Order belum dihubungkan pada halaman detail.
        void attachments;

        setDetail((prev) => {
            if (!prev) return prev;

            const currentEventOrders =
                (prev.event_orders ?? []) as unknown as EventOrderView[];

            const updatedEventOrders = currentEventOrders.map(
                (event, index) =>
                    index === editingEventOrderIndex
                        ? {
                            ...event,
                            ...payload,
                        }
                        : event,
            );

            return {
                ...prev,
                event_orders: updatedEventOrders,
            } as ReservasiDetailView;
        });

        handleCloseEventOrderModal();
    };

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
            {/* INFORMASI RESERVASI */}

            <DetailSection
                icon={CalendarDays}
                title="Informasi Reservasi"
                variant="blue"
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

                        {hasValue(detail.arrival_date) && (
                            <InfoItem
                                label="Tanggal Kedatangan"
                                value={detail.arrival_date}
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

                    {(hasValue(detail.arrival_type) ||
                        hasValue(detail.arrival_time) ||
                        hasValue(detail.status_label || detail.status)) && (
                            <div className="flex flex-col gap-5 border-l border-slate-200 pl-5 dark:border-slate-700">
                                {hasValue(detail.arrival_type) && (
                                    <div>
                                        <p className="mb-1 text-sm text-muted-foreground">
                                            Tipe Kedatangan
                                        </p>

                                        {String(detail.arrival_type).toLowerCase() === "early" ? (
                                            <Badge className="gap-1.5 border border-red-200 bg-red-50 text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
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
                                        value={detail.status_label || detail.status}
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

            {/* EVENT ORDER */}

            <DetailSection
                icon={FaUser}
                title="Event Order"
                variant="orange"
            >
                <div className="space-y-4 p-5">
                    {eventOrders.length > 0 ? (
                        eventOrders.map((event, index) => {
                            const isIR =
                                String(event.department_id) === "DP005";

                            const isFinance =
                                String(event.department_id) === "DP013";

                            const status = getEventOrderStatus(
                                event.status,
                                event.status_label,
                            );

                            const isDraft =
                                status.normalized === "draft" ||
                                String(event.status_label || "")
                                    .trim()
                                    .toLowerCase() === "draft";

                            const shoppingVouchers: ShoppingVoucherView[] =
                                Array.isArray(event.shopping_voucher)
                                    ? event.shopping_voucher as ShoppingVoucherView[]
                                    : [];

                            return (
                                <div
                                    key={
                                        hasValue(event.id)
                                            ? String(event.id)
                                            : `event-order-${index}`
                                    }
                                    className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                                >
                                    {/* HEADER */}

                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/30">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                                                <Building2 size={19} />
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="break-words text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                    {hasValue(event.department_name)
                                                        ? String(event.department_name)
                                                        : "Nama Departemen -"}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {hasValue(event.status_label || event.status) && (
                                                <Badge variant="secondary">
                                                    {status.label}
                                                </Badge>
                                            )}

                                            {isDraft && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleEditEventOrder(index)}
                                                    title="Edit Event Order"
                                                    className="border-orange-300 text-orange-500 hover:bg-orange-50 hover:text-orange-600 dark:border-orange-500/40 dark:hover:bg-orange-500/10"
                                                >
                                                    <FaPen className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* DETAIL */}

                                    <div className="space-y-4 p-4">

                                        {/* IR */}

                                        {isIR && (
                                            <>
                                                {/* FOOD & BEVERAGE */}

                                                <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
                                                    <h4 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                        Food & Beverage
                                                    </h4>

                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                                        <InfoItem
                                                            label="Paket"
                                                            value={formatValue(event.product_description)}
                                                        />

                                                        <InfoItem
                                                            label="Penyajian"
                                                            value={formatValue(event.serving_type)}
                                                        />

                                                        <InfoItem
                                                            label="Jumlah Pax"
                                                            value={formatValue(event.quantity)}
                                                        />

                                                        <InfoItem
                                                            label="Jam Penyajian"
                                                            value={formatTime(event.serving_time)}
                                                        />

                                                        <InfoItem
                                                            label="Harga"
                                                            value={formatCurrency(event.unit_price)}
                                                        />

                                                        <InfoItem
                                                            label="Tempat Penyajian"
                                                            value={formatValue(event.serving_location)}
                                                        />

                                                        <InfoItem
                                                            label="Detail Menu"
                                                            value={formatValue(event.product_description)}
                                                        />
                                                    </div>
                                                </div>

                                                {/* RETAIL & MERCHANDISE */}

                                                <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
                                                    <h4 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                        Retail & Merchandise
                                                    </h4>

                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                                        <InfoItem
                                                            label="Nama Barang"
                                                            value={formatValue(event.product_description)}
                                                        />

                                                        <InfoItem
                                                            label="Jumlah"
                                                            value={formatValue(event.quantity)}
                                                        />

                                                        <InfoItem
                                                            label="Harga"
                                                            value={formatCurrency(event.unit_price)}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* FINANCE & ACCOUNTING */}

                                        {isFinance && (
                                            <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                                    <InfoItem
                                                        label="Tanggal Cetak Tiket"
                                                        value={formatDate(event.ticket_print_date)}
                                                    />

                                                    <InfoItem
                                                        label="Kupon Makan"
                                                        value={formatValue(event.meal_voucher)}
                                                    />

                                                    <InfoItem
                                                        label="Voucher Tour Leader"
                                                        value={formatValue(event.voucher_tour_leader)}
                                                    />

                                                    <InfoItem
                                                        label="Kupon Belanja"
                                                        value={
                                                            shoppingVouchers.length > 0 ? (
                                                                <div className="flex flex-col gap-1">
                                                                    {shoppingVouchers.map((voucher, voucherIndex) => (
                                                                        <div key={voucherIndex}>
                                                                            {voucherIndex + 1}. {voucher.name || "-"} (
                                                                            {voucher.quantity ?? "-"} x{" "}
                                                                            {formatCurrency(voucher.pecahan)}
                                                                            )
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                "-"
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* DEPARTEMEN LAINNYA */}

                                        {!isIR && !isFinance && (
                                            <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
                                                <InfoItem
                                                    label="Desc Request"
                                                    value={
                                                        hasValue(event.description) ? (
                                                            <p className="text-sm italic leading-relaxed text-slate-600 dark:text-slate-300">
                                                                "{String(event.description)}"
                                                            </p>
                                                        ) : (
                                                            "-"
                                                        )
                                                    }
                                                />
                                            </div>
                                        )}

                                        {/* DESC REQUEST IR DAN FINANCE */}

                                        {(isIR || isFinance) && (
                                            <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
                                                <InfoItem
                                                    label="Desc Request"
                                                    value={
                                                        hasValue(event.description) ? (
                                                            <p className="text-sm italic leading-relaxed text-slate-600 dark:text-slate-300">
                                                                "{String(event.description)}"
                                                            </p>
                                                        ) : (
                                                            "-"
                                                        )
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-8 text-center dark:border-slate-700 dark:bg-slate-900/30">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                <Building2 size={30} strokeWidth={1.5} />
                            </div>

                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Belum Ada Event Order
                            </h3>

                            <p className="mt-1 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                Event Order belum tersedia untuk reservasi ini.
                            </p>
                        </div>
                    )}
                </div>
            </DetailSection>

            {/* MODAL EDIT EVENT ORDER */}

            <CreateEventOrderModal
                open={openCreateEventOrder}
                onClose={handleCloseEventOrderModal}
                onSubmit={handleSubmitEventOrder}
                initialData={
                    editingEventOrderIndex !== null
                        ? eventOrders[editingEventOrderIndex] as unknown as CreateReservasiEventOrder
                        : null
                }
                departemenOptions={departemenOptions}
                invoiceItems={detail?.items ?? []}
            />
        </DetailPageLayout>
    );
};

export default DetailReservasi;
