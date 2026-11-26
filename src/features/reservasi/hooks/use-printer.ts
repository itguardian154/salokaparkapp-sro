import { useState } from "react";
import axios from "axios";

import {
    printTickets,
} from "../service/printer-service";

import type {
    PrinterTicketPayload,
    PrinterResponse,
} from "../service/printer-service";

export const usePrinter = () => {
    const [printing, setPrinting] = useState(false);

    const cetakTiket = async (
        tickets: PrinterTicketPayload[],
    ): Promise<PrinterResponse> => {
        if (tickets.length === 0) {
            throw new Error("Tidak ada tiket yang tersedia untuk dicetak.");
        }

        setPrinting(true);

        try {
            return await printTickets(tickets);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.code === "ECONNABORTED") {
                    throw new Error(
                        "Aplikasi printer tidak merespons. Periksa aplikasi printer di laptop.",
                    );
                }

                if (!error.response) {
                    throw new Error(
                        "Tidak dapat terhubung ke aplikasi printer. Pastikan aplikasi printer sudah berjalan dan endpoint localhost:9696 aktif.",
                    );
                }

                throw new Error(
                    error.response.data?.message ??
                    "Aplikasi printer gagal memproses tiket.",
                );
            }

            throw error;
        } finally {
            setPrinting(false);
        }
    };

    return {
        printing,
        cetakTiket,
    };
};