import axios from "axios";
import API_URLS from "@/config/env";
import type {
  InvoiceDetailResponse,
  InvoiceListParams,
  InvoiceListResponse,
} from "../types/invoice";

const invoiceUrl = `${API_URLS.sro}invoices`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token tidak ditemukan. Silakan login kembali.");
  return { Authorization: `Bearer ${token}`, Accept: "application/json" };
};

export const getInvoices = async (
  params: InvoiceListParams,
  signal?: AbortSignal,
): Promise<InvoiceListResponse> => {
  const response = await axios.get<InvoiceListResponse>(
    invoiceUrl,
    {
      params,
      signal,
      headers: getAuthHeaders(),
    },
  );

  return response.data;
};

export const getInvoice = async (id: string, signal?: AbortSignal) => {
  const response = await axios.get<InvoiceDetailResponse>(`${invoiceUrl}/${id}`, {
    signal,
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const downloadInvoicePdf = async (
  id: string,
  signal?: AbortSignal,
): Promise<Blob> => {
  const response = await axios.get<Blob>(`${invoiceUrl}/${id}/pdf`, {
    responseType: "blob",
    signal,
    headers: {
      ...getAuthHeaders(),
      Accept: "application/pdf",
    },
  });

  return response.data;
};

export const createInvoice = async (payload: FormData) => {
  // FormData coerces `undefined` to the literal string "undefined". Normalize
  // nullable IDs at the request boundary as well, so they arrive as empty
  // values (Laravel converts empty strings to null) even if a caller regresses.
  for (const key of [
    "segment_detail_id",
    "sub_segment_detail_id",
    "segment_option_id",
    "customer[segment_detail_id]",
    "customer[sub_segment_detail_id]",
    "customer[segment_option_id]",
  ]) {
    const value = payload.get(key);
    if (value === "undefined" || value === "null") {
      payload.set(key, "");
    }
  }

  const response = await axios.post<InvoiceDetailResponse>(invoiceUrl, payload, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const updateInvoice = async (id: string, payload: FormData) => {
  const response = await axios.put<InvoiceDetailResponse>(`${invoiceUrl}/${id}`, payload, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};
