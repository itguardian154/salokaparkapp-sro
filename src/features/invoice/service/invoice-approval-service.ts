import axios from "axios";
import API_URLS from "@/config/env";
import { getAuthEmployeeId } from "@/features/auth/utils/auth-storage";

type InvoiceApprovalPayload = {
  model: "Invoice";
  form: "Invoice";
  id: number;
  uid: string;
};

type ApprovalPermissionResponse = {
  success: boolean;
  can_approve: boolean;
  message?: string;
};

export type InvoiceApprovalActionResponse = {
  success: boolean;
  message?: string;
};

const createApprovalPayload = (invoiceId: number): InvoiceApprovalPayload => ({
  model: "Invoice",
  form: "Invoice",
  id: invoiceId,
  uid: getAuthEmployeeId(),
});

const postApprovalRequest = async <TResponse>(
  endpoint: string,
  invoiceId: number,
): Promise<TResponse> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await axios.post<TResponse>(
    `${API_URLS.sro}approval/${endpoint}`,
    createApprovalPayload(invoiceId),
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return response.data;
};

export const checkInvoiceApprovalPermission = async (
  invoiceId: number,
): Promise<boolean> => {
  const response = await postApprovalRequest<ApprovalPermissionResponse>(
    "can-approve",
    invoiceId,
  );

  if (!response.success) {
    throw new Error(response.message ?? "Gagal memeriksa izin approval invoice.");
  }

  return response.can_approve;
};

const performApprovalAction = async (
  endpoint: "submit" | "approve" | "reject",
  invoiceId: number,
) => {
  const response = await postApprovalRequest<InvoiceApprovalActionResponse>(
    endpoint,
    invoiceId,
  );

  if (!response.success) {
    throw new Error(response.message ?? "Proses approval invoice gagal.");
  }

  return response;
};

export const submitInvoiceForApproval = (invoiceId: number) =>
  performApprovalAction("submit", invoiceId);

export const rejectInvoice = (invoiceId: number) =>
  performApprovalAction("reject", invoiceId);

export const approveInvoice = (invoiceId: number) =>
  performApprovalAction("approve", invoiceId);

export const getInvoiceApprovalErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<InvoiceApprovalActionResponse>(error)) {
    return (
      error.response?.data?.message ??
      error.message ??
      "Terjadi kesalahan pada proses approval invoice."
    );
  }

  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan pada proses approval invoice.";
};
