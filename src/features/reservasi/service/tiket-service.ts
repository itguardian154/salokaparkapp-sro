
import axios from "axios";
import API_URLS from "@/config/env";

// ==============================
// TYPES
// ==============================

export interface Ticket {
    id: number;
    sales_order_id: number;
    sales_order_detail_id: number;
    product_id: number;
    product_name: string;
    is_bonus: boolean;
    barcode: string;
    date: string | null;
    date_plan: string | null;
    status: string;
    is_printed: boolean;
    printed_at: string | null;
    date_used: string | null;
    created_at: string | null;
}

export interface TicketQuantityPayload {
    quantity: number;
}

export interface MarkTicketsPrintedPayload {
    ticket_ids: number[];
}

export interface CreateTicketsResponse {
    message: string;
    data: {
        sales_order_id: number;
    };
}

export interface PrintCandidatesResponse {
    data: {
        sales_order_id: number;
        requested_count: number;
        available_count: number;
        tickets: Ticket[];
    };
}

export interface MarkTicketsPrintedResponse {
    message: string;
    data: {
        sales_order_id: number;
    };
}

// ==============================
// AUTH HEADERS
// ==============================

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Token autentikasi tidak ditemukan.");
    }

    return {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
    };
};

// ==============================
// CREATE TICKETS
// ==============================

export const createTickets = async (
    salesOrderId: number,
    payload: TicketQuantityPayload,
): Promise<CreateTicketsResponse> => {
    const response = await axios.post<CreateTicketsResponse>(
        `${API_URLS.sro}sales-orders/${salesOrderId}/create-tickets`,
        payload,
        {
            headers: getAuthHeaders(),
        },
    );

    return response.data;
};

// ==============================
// GET PRINT CANDIDATES
// ==============================

export const getPrintCandidates = async (
    salesOrderId: number,
    payload: TicketQuantityPayload,
): Promise<PrintCandidatesResponse> => {
    const response = await axios.post<PrintCandidatesResponse>(
        `${API_URLS.sro}sales-orders/${salesOrderId}/tickets/print-candidates`,
        payload,
        {
            headers: getAuthHeaders(),
        },
    );

    return response.data;
};

// ==============================
// MARK TICKETS AS PRINTED
// ==============================

export const markTicketsPrinted = async (
    salesOrderId: number,
    payload: MarkTicketsPrintedPayload,
): Promise<MarkTicketsPrintedResponse> => {
    const response = await axios.post<MarkTicketsPrintedResponse>(
        `${API_URLS.sro}sales-orders/${salesOrderId}/tickets/printed`,
        payload,
        {
            headers: getAuthHeaders(),
        },
    );

    return response.data;
};
