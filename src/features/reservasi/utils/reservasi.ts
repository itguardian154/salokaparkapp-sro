
import type { ReactNode } from "react";

import type {
    InvoicePayment,
    InvoicePaymentRow,
} from "@/features/invoice/types/invoice";

import type { ActivityItemData } from "@/components/activity/activity-item";
import type { ReservasiActivity } from "../types/reservasi";

export const hasValue = (value: unknown): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim() !== "";
    if (Array.isArray(value)) return value.length > 0;

    return true;
};

export const formatDate = (value: unknown): string => {
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

export const formatTime = (value: unknown): string => {
    if (!hasValue(value)) return "-";

    const time = String(value);

    return time.length >= 5 ? time.slice(0, 5) : time;
};

export const formatCurrency = (value: unknown): string => {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number.isFinite(amount) ? amount : 0);
};

export const formatValue = (value: unknown): ReactNode => {
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

export const mapInvoicePayments = (
    payments: InvoicePayment[],
): InvoicePaymentRow[] => {
    return payments.map((payment, index) => {
        const proof = payment.proof_of_payment ?? "";

        const attachments =
            payment.attachments?.length
                ? payment.attachments
                : proof
                    ? [
                        {
                            name: "Bukti Pembayaran",
                            url: proof,
                        },
                    ]
                    : [];

        return {
            id: String(payment.id ?? payment.payment_id ?? index + 1),
            serverId: payment.payment_id ?? payment.id,
            paymentDate: payment.payment_date ?? null,
            paymentType: payment.payment_type ?? "",
            paymentTypeValue: payment.payment_type ?? "",
            uploadType:
                payment.payment_type === "surat_keterangan"
                    ? "surat_keterangan"
                    : "bukti_bayar",
            paymentMethod: payment.payment_method ?? "",
            accountHolderName: payment.account_holder_name ?? "",
            depositNumber: payment.deposit_number ?? "",
            fromBank: payment.from_bank ?? "",
            toBank: payment.to_bank ?? "",
            amount: payment.amount ?? 0,
            notes: payment.notes ?? "",
            proof,
            attachments,
            pending: payment.pending ?? false,
            editable: false,
        };
    });
};

export const getEventOrderStatus = (
    status?: string | null,
    statusLabel?: string | null,
) => {
    const label = statusLabel || status || "-";
    const normalized = (status || statusLabel || "").toLowerCase();

    return {
        label,
        normalized,
    };
};

export const mapReservasiActivityLogs = (
    activities: ReservasiActivity[],
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
