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

export const createInvoice = async (payload: FormData) => {
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
