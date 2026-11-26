
import { useCallback, useState } from "react";

import {
    createTickets,
    getPrintCandidates,
    markTicketsPrinted,
} from "../service/tiket-service";

import type {
    Ticket,
    TicketQuantityPayload,
    MarkTicketsPrintedPayload,
} from "../service/tiket-service";

export const useTiket = (salesOrderId: number) => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(false);

    // ==============================
    // BUAT TIKET
    // ==============================

    const buatTiket = useCallback(async (quantity: number) => {
        setLoading(true);

        try {
            return await createTickets(salesOrderId, {
                quantity,
            } satisfies TicketQuantityPayload);
        } finally {
            setLoading(false);
        }
    }, [salesOrderId]);

    // ==============================
    // AMBIL KANDIDAT CETAK
    // ==============================

    const ambilKandidatCetak = useCallback(async (quantity: number) => {
        setLoading(true);

        try {
            const response = await getPrintCandidates(salesOrderId, {
                quantity,
            } satisfies TicketQuantityPayload);

            setTickets(response.data.tickets ?? []);

            return response;
        } finally {
            setLoading(false);
        }
    }, [salesOrderId]);

    // ==============================
    // TANDAI TIKET SUDAH DICETAK
    // ==============================

    const tandaiSudahDicetak = useCallback(async (ticketIds: number[]) => {
        setLoading(true);

        try {
            return await markTicketsPrinted(salesOrderId, {
                ticket_ids: ticketIds,
            } satisfies MarkTicketsPrintedPayload);
        } finally {
            setLoading(false);
        }
    }, [salesOrderId]);

    return {
        tickets,
        loading,
        buatTiket,
        ambilKandidatCetak,
        tandaiSudahDicetak,
    };
};
