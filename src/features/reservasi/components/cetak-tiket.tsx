import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    AlertCircle,
    Loader2,
    Printer,
    Ticket,
} from "lucide-react";

import AppModal from "@/components/base-modal";
import { Button } from "@/components/ui/button";

import { useTiket } from "../hooks/use-tiket";
import { usePrinter } from "../hooks/use-printer";

import type { Ticket as TicketData } from "../service/tiket-service";
import type { PrinterTicketPayload } from "../service/printer-service";
import type { ReservasiItem } from "../types/reservasi";

interface CetakTiketModalProps {
    open: boolean;
    onClose: () => void;
    salesOrderId: number;
    ticket_created_count: number;
    ticket_printed_count: number;
    items: ReservasiItem[];
    onSuccess?: () => void;
}

const formatTicketDate = (value: string | null): string => {
    if (!value) return "-";

    const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dateOnly) {
        return `${dateOnly[3]}-${dateOnly[2]}-${dateOnly[1]}`;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
};

const formatRupiah = (
    value: number | null | undefined,
): string => {
    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return "-";
    }

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value));
};

const CetakTiketModal = ({
    open,
    onClose,
    salesOrderId,
    ticket_created_count,
    ticket_printed_count,
    items,
    onSuccess,
}: CetakTiketModalProps) => {
    const {
        tickets,
        loading,
        ambilKandidatCetak,
        tandaiSudahDicetak,
    } = useTiket(salesOrderId);

    const {
        printing,
        cetakTiket,
    } = usePrinter();

    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const requestedQuantity = Math.max(
        ticket_created_count - ticket_printed_count,
        0,
    );

    // Mengambil kandidat tiket yang belum dicetak.
    useEffect(() => {
        if (!open || requestedQuantity <= 0) return;

        let cancelled = false;

        const fetchCandidates = async () => {
            setLoadingCandidates(true);
            setError("");
            setSuccessMessage("");

            try {
                await ambilKandidatCetak(requestedQuantity);
            } catch (err) {
                if (cancelled) return;

                setError(
                    axios.isAxiosError(err)
                        ? err.response?.data?.message ??
                          "Gagal mengambil daftar tiket."
                        : err instanceof Error
                          ? err.message
                          : "Gagal mengambil daftar tiket.",
                );
            } finally {
                if (!cancelled) {
                    setLoadingCandidates(false);
                }
            }
        };

        fetchCandidates();

        return () => {
            cancelled = true;
        };
    }, [open, requestedQuantity, ambilKandidatCetak]);

    // Pemetaan harga berdasarkan produk.
    const productPriceMap = useMemo(() => {
        const map = new Map<number, number>();

        items.forEach((item) => {
            map.set(
                Number(item.product_id),
                Number(item.unit_price) || 0,
            );
        });

        return map;
    }, [items]);

    // Konversi data tiket SRO ke format aplikasi printer.
    const printerPayload: PrinterTicketPayload[] = useMemo(() => {
        return tickets.map((ticket: TicketData) => {
            const price = productPriceMap.get(
                Number(ticket.product_id),
            );

            const ticketDate = formatTicketDate(
                ticket.date ?? ticket.date_plan,
            );

            return {
                id: ticket.id,
                barcode: ticket.barcode,
                line1: "SALOKA THEME PARK",
                line2: `Nama Produk: ${ticket.product_name}`,
                line3: `Tanggal: ${ticketDate}`,
                line4: `Harga: ${formatRupiah(price)}`,
                line5: "Terima Kasih",
                line6: "Selamat Menikmati",
            };
        });
    }, [tickets, productPriceMap]);

    // Proses pengiriman tiket ke aplikasi printer.
    const handlePrint = async () => {
        if (printerPayload.length === 0) {
            setError("Tidak ada tiket yang tersedia untuk dicetak.");
            return;
        }

        if (printerPayload.length !== requestedQuantity) {
            setError(
                `Jumlah tiket tersedia (${printerPayload.length}) tidak sesuai dengan jumlah tiket belum dicetak (${requestedQuantity}). Periksa kembali data tiket.`,
            );
            return;
        }

        setError("");
        setSuccessMessage("");

        try {
            // 1. Kirim tiket ke aplikasi printer lokal.
            await cetakTiket(printerPayload);

            // 2. Jika aplikasi printer menerima request,
            // perbarui status tiket pada backend SRO.
            try {
                await tandaiSudahDicetak(
                    tickets.map((ticket) => ticket.id),
                );

                setSuccessMessage(
                    `${tickets.length} tiket berhasil dikirim ke aplikasi printer dan statusnya diperbarui di SRO.`,
                );

                onSuccess?.();
            } catch {
                setError(
                    "Tiket berhasil dikirim ke aplikasi printer, tetapi status tiket gagal diperbarui di SRO. Periksa status cetak sebelum mencoba kembali agar tidak terjadi cetak ganda.",
                );
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Terjadi kesalahan saat mengirim tiket ke printer.",
            );
        }
    };

    const handleClose = () => {
        if (printing || loadingCandidates || loading) return;

        setError("");
        setSuccessMessage("");
        onClose();
    };

    const isLoading = loadingCandidates || loading;

    return (
        <AppModal
            open={open}
            onClose={handleClose}
            title="Cetak Tiket"
            icon={<Printer size={18} />}
            className="max-w-2xl"
            footer={
                <div className="flex w-full justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={printing || isLoading}
                    >
                        Tutup
                    </Button>

                    <Button
                        type="button"
                        onClick={handlePrint}
                        disabled={
                            printing ||
                            isLoading ||
                            printerPayload.length === 0
                        }
                        className="gap-2"
                    >
                        {printing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Mengirim Tiket...
                            </>
                        ) : (
                            <>
                                <Printer className="h-4 w-4" />
                                Cetak {printerPayload.length} Tiket
                            </>
                        )}
                    </Button>
                </div>
            }
        >
            <div className="space-y-5">
                {/* Ringkasan tiket */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-900">
                        <p className="text-xs font-medium text-muted-foreground">
                            Total Tiket Dibuat
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {ticket_created_count}
                        </p>
                    </div>

                    <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-900">
                        <p className="text-xs font-medium text-muted-foreground">
                            Belum Dicetak
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {requestedQuantity}
                        </p>
                    </div>
                </div>

                {/* Pesan error */}
                {error && (
                    <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Pesan berhasil */}
                {successMessage && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
                        {successMessage}
                    </div>
                )}

                {/* Loading */}
                {isLoading ? (
                    <div className="flex min-h-36 flex-col items-center justify-center gap-3">
                        <Loader2 className="h-7 w-7 animate-spin text-primary" />

                        <p className="text-sm text-muted-foreground">
                            Mengambil daftar tiket...
                        </p>
                    </div>
                ) : printerPayload.length > 0 ? (
                    /* Daftar tiket */
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">
                                Daftar Tiket
                            </p>

                            <span className="text-xs text-muted-foreground">
                                {printerPayload.length} tiket siap dicetak
                            </span>
                        </div>

                        <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border p-3">
                            {tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="flex items-center gap-3 rounded-md border p-3"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                        <Ticket className="h-5 w-5 text-primary" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold">
                                            {ticket.product_name}
                                        </p>

                                        <p className="truncate text-xs text-muted-foreground">
                                            {ticket.barcode}
                                        </p>
                                    </div>

                                    <span className="text-xs text-muted-foreground">
                                        #{ticket.id}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Kondisi tiket kosong */
                    <div className="rounded-lg border border-dashed p-8 text-center">
                        <Ticket className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />

                        <p className="text-sm font-medium">
                            Tidak ada tiket yang perlu dicetak.
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Semua tiket sudah dicetak atau belum tersedia.
                        </p>
                    </div>
                )}

                <p className="text-xs leading-relaxed text-muted-foreground">
                    Pastikan aplikasi printer sudah berjalan di laptop ini
                    sebelum menekan tombol Cetak.
                </p>
            </div>
        </AppModal>
    );
};

export default CetakTiketModal;