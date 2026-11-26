import axios from "axios";

export interface PrinterTicketPayload {
    id: number;
    barcode: string;
    line1: string;
    line2: string;
    line3: string;
    line4: string;
    line5: string;
    line6: string;
}

export interface PrinterResponse {
    success?: boolean;
    message?: string;
}

const PRINTER_API_URL = "http://192.168.0.140:9696/api/print";

export const printTickets = async (
    tickets: PrinterTicketPayload[],
): Promise<PrinterResponse> => {
    const response = await axios.post<PrinterResponse>(
        PRINTER_API_URL,
        tickets,
        {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            timeout: 30000,
        },
    );

    if (response.data?.success === false) {
        throw new Error(
            response.data.message ?? "Aplikasi printer gagal mencetak tiket.",
        );
    }

    return response.data;
};