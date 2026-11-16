
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import type { ReactNode } from "react";

import {
    FaArrowLeft,
    FaFileInvoice,
} from "react-icons/fa";

import {
    AlertTriangle,
    Building2,
    CalendarDays,
    ClipboardList,
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
            {/* INFORMASI RESERVASI */}

            <DetailSection
                icon={CalendarDays}
                title="Informasi Reservasi"
                variant="blue"
            >
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Informasi Reservasi - Kolom 1 sampai 3 */}
                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:col-span-2 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3">
                        {hasValue(detail.sales_order_number) && (
                            <InfoItem label="Nomor Sales Order" value={detail.sales_order_number} />
                        )}
                        {hasValue(detail.invoice_number) && (
                            <InfoItem label="Nomor Invoice" value={detail.invoice_number} />
                        )}


                        {hasValue(detail.booking_type) && (
                            <InfoItem label="Jenis Pemesanan" value={detail.booking_type} />
                        )}

                        {hasValue(detail.customer_name) && (
                            <InfoItem label="Nama Pelanggan" value={detail.customer_name} />
                        )}

                        {hasValue(detail.customer_address) && (
                            <InfoItem label="Alamat Pelanggan" value={detail.customer_address} />
                        )}

                        {hasValue(detail.customer_city) && (
                            <InfoItem label="Kota Pelanggan" value={detail.customer_city} />
                        )}

                        {hasValue(detail.customer_province) && (
                            <InfoItem label="Provinsi Pelanggan" value={detail.customer_province} />
                        )}

                        {hasValue(detail.customer_phone) && (
                            <InfoItem label="Nomor Telepon Pelanggan" value={detail.customer_phone} />
                        )}

                        {hasValue(detail.customer_contact_person) && (
                            <InfoItem label="PIC Pelanggan" value={detail.customer_contact_person} />
                        )}

                        {hasValue(detail.partner_name) && (
                            <InfoItem label="Nama Group" value={detail.partner_name} />
                        )}

                        {hasValue(detail.partner_association_name) && (
                            <InfoItem label="Asosiasi" value={detail.partner_association_name} />
                        )}

                        {hasValue(detail.partner_city) && (
                            <InfoItem label="Kota Group" value={detail.partner_city} />
                        )}

                        {hasValue(detail.partner_province) && (
                            <InfoItem label="Provinsi Group" value={detail.partner_province} />
                        )}

                        {hasValue(detail.partner_phone) && (
                            <InfoItem label="Nomor Telepon Group" value={detail.partner_phone} />
                        )}

                        {hasValue(detail.partner_contact_person) && (
                            <InfoItem label="PIC Group" value={detail.partner_contact_person} />
                        )}

                        {hasValue(detail.partner_branch_name) && (
                            <InfoItem label="Nama Cabang" value={detail.partner_branch_name} />
                        )}

                        {hasValue(detail.partner_branch_city) && (
                            <InfoItem label="Kota Cabang" value={detail.partner_branch_city} />
                        )}

                        {hasValue(detail.partner_branch_province) && (
                            <InfoItem label="Provinsi Cabang" value={detail.partner_branch_province} />
                        )}

                        {hasValue(detail.partner_branch_phone) && (
                            <InfoItem label="Nomor Telepon Cabang" value={detail.partner_branch_phone} />
                        )}

                        {hasValue(detail.partner_branch_contact_person) && (
                            <InfoItem label="PIC Cabang" value={detail.partner_branch_contact_person} />
                        )}

                        {hasValue(detail.sales_person_name) && (
                            <InfoItem label="Nama Sales" value={detail.sales_person_name} />
                        )}

                        {hasValue(detail.arrival_date) && (
                            <InfoItem label="Tanggal Kedatangan" value={detail.arrival_date} />
                        )}

                        {hasValue(detail.segment_name) && (
                            <InfoItem label="Segmen" value={detail.segment_name} />
                        )}

                        {hasValue(detail.segment_detail_name) && (
                            <InfoItem label="Detail Segmen" value={detail.segment_detail_name} />
                        )}

                        {hasValue(detail.sub_segment_detail_name) && (
                            <InfoItem label="Sub Segmen" value={detail.sub_segment_detail_name} />
                        )}

                        {hasValue(detail.segment_option_name) && (
                            <InfoItem label="Pilihan Segmen" value={detail.segment_option_name} />
                        )}
                        {hasValue(detail.access_tour_leader) && (
                            <InfoItem label="Akses Tour Leader" value={detail.access_tour_leader} />
                        )}
                    </div>

                    {/* Informasi Kedatangan & Status - Kolom 4 */}
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
                                    <InfoItem label="Jam Kedatangan" value={formatTime(detail.arrival_time)} />
                                )}

                                {hasValue(detail.status_label || detail.status) && (
                                    <InfoItem
                                        label="Status Reservasi"
                                        value={detail.status_label || detail.status}
                                    />
                                )}
                            </div>
                        )}

                    {/* Deskripsi */}
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
                icon={Building2}
                title="Event Order"
                variant="green"
            >
                <div className="space-y-4 p-5">
                    {eventOrders.length > 0 ? (
                        eventOrders.map((event, index) => {
                            const isIR = String(event.department_id) === "DP005";
                            const isFinance = String(event.department_id) === "DP013";

                            const shoppingVouchers = Array.isArray(event.shopping_voucher)
                                ? event.shopping_voucher as ShoppingVoucherView[]
                                : [];

                            return (
                                <div
                                    key={
                                        hasValue(event.id)
                                            ? String(event.id)
                                            : `event-order-${index}`
                                    }
                                    className="overflow-hidden rounded-xl border bg-card"
                                >
                                    {/* HEADER EVENT ORDER */}

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

                                    {/* ISI EVENT ORDER */}

                                    <div className="space-y-4 p-4">

                                        {/* IR */}

                                        {isIR && (
                                            <>
                                                {/* FOOD & BEVERAGE */}

                                                <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
                                                    <h4 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                        Food & Beverage
                                                    </h4>

                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                                                            value={hasValue(event.unit_price)
                                                                ? formatCurrency(event.unit_price)
                                                                : null}
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

                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                                                            value={hasValue(event.unit_price)
                                                                ? formatCurrency(event.unit_price)
                                                                : null}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* FINANCE & ACCOUNTING */}

                                        {isFinance && (
                                            <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                                                </div>

                                                {/* KUPON BELANJA */}

                                                <div className="mt-5">
                                                    <p className="mb-3 text-xs font-medium text-muted-foreground">
                                                        Kupon Belanja
                                                    </p>

                                                    {shoppingVouchers.length > 0 ? (
                                                        <div className="overflow-x-auto rounded-lg border">
                                                            <table className="w-full min-w-[500px] text-sm">
                                                                <thead className="bg-muted/50">
                                                                    <tr>
                                                                        <th className="px-4 py-3 text-left font-semibold">No</th>
                                                                        <th className="px-4 py-3 text-left font-semibold">Nama Voucher</th>
                                                                        <th className="px-4 py-3 text-left font-semibold">Jumlah</th>
                                                                        <th className="px-4 py-3 text-left font-semibold">Pecahan</th>
                                                                    </tr>
                                                                </thead>

                                                                <tbody>
                                                                    {shoppingVouchers.map((voucher, voucherIndex) => (
                                                                        <tr
                                                                            key={voucherIndex}
                                                                            className="border-t"
                                                                        >
                                                                            <td className="px-4 py-3">
                                                                                {voucherIndex + 1}
                                                                            </td>

                                                                            <td className="px-4 py-3 font-medium">
                                                                                {voucher.name || "-"}
                                                                            </td>

                                                                            <td className="px-4 py-3">
                                                                                {voucher.quantity ?? "-"}
                                                                            </td>

                                                                            <td className="px-4 py-3">
                                                                                {hasValue(voucher.pecahan)
                                                                                    ? formatCurrency(voucher.pecahan)
                                                                                    : "-"}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">
                                                            Tidak ada kupon belanja.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* DEPARTEMEN LAINNYA */}

                                        {!isIR && !isFinance && (
                                            <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
                                                <InfoItem
                                                    label="Desc Request"
                                                    value={formatValue(event.description)}
                                                />
                                            </div>
                                        )}

                                        {/* DESC REQUEST IR DAN FINANCE */}

                                        {(isIR || isFinance) && (
                                            <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
                                                <InfoItem
                                                    label="Desc Request"
                                                    value={formatValue(event.description)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
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
