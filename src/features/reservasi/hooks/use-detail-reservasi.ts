
import { useEffect, useState } from "react";
import axios from "axios";

import { getReservasiDetail } from "../service/reservasi-service";

import type { ReservasiDetail } from "../types/reservasi";
import type { InvoicePayment } from "@/features/invoice/types/invoice";

export type ReservasiDetailView = Omit<ReservasiDetail, "payments"> & {
    booking_type?: string | null;
    payment_status?: string | null;
    segment_option_id?: number | null;
    segment_option_name?: string | null;
    total_ticket_count?: number | null;
    payments?: InvoicePayment[];
    invoice?: {
        id: number;
        invoice_number: string;
        total_amount?: number | string | null;
        paid_amount?: number | string | null;
        payments?: InvoicePayment[];
    } | null;
};

export const useDetailReservasi = (id?: string) => {
    const [detail, setDetail] = useState<ReservasiDetailView | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) {
            setDetail(null);
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

                if (axios.isAxiosError(err)) {
                    setError(
                        err.response?.data?.message ??
                            "Gagal mengambil detail reservasi.",
                    );
                } else if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError(
                        "Terjadi kesalahan saat mengambil detail reservasi.",
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchDetail();

        return () => {
            controller.abort();
        };
    }, [id]);

    return {
        detail,
        setDetail,
        loading,
        error,
    };
};
