import axios from "axios";
import API_URLS from "@/config/env";
import { getAuthEmployeeId } from "@/features/auth/utils/auth-storage";

type ProdukApprovalPayload = {
  model: "Product";
  form: "Product";
  id: number;
  uid: string;
};

type ApprovalPermissionResponse = {
  success: boolean;
  can_approve: boolean;
  message?: string;
};

export type ProdukApprovalActionResponse = {
  success: boolean;
  message?: string;
};

const createApprovalPayload = (produkId: number): ProdukApprovalPayload => ({
  model: "Product",
  form: "Product",
  id: produkId,
  uid: getAuthEmployeeId(),
});

const postApprovalRequest = async <TResponse>(
  endpoint: string,
  produkId: number,
): Promise<TResponse> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await axios.post<TResponse>(
    `${API_URLS.sro}approval/${endpoint}`,
    createApprovalPayload(produkId),
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return response.data;
};

export const checkProdukApprovalPermission = async (
  produkId: number,
): Promise<boolean> => {
  const response = await postApprovalRequest<ApprovalPermissionResponse>(
    "can-approve",
    produkId,
  );

  if (!response.success) {
    throw new Error(response.message ?? "Gagal memeriksa izin approval.");
  }

  return response.can_approve;
};

const performApprovalAction = async (
  endpoint: "submit" | "approve" | "reject",
  produkId: number,
) => {
  const response = await postApprovalRequest<ProdukApprovalActionResponse>(
    endpoint,
    produkId,
  );

  if (!response.success) {
    throw new Error(response.message ?? "Proses approval produk gagal.");
  }

  return response;
};

export const submitProdukForApproval = (produkId: number) =>
  performApprovalAction("submit", produkId);

export const rejectProduk = (produkId: number) =>
  performApprovalAction("reject", produkId);

export const approveProduk = (produkId: number) =>
  performApprovalAction("approve", produkId);

export const getProdukApprovalErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<ProdukApprovalActionResponse>(error)) {
    return (
      error.response?.data?.message ??
      error.message ??
      "Terjadi kesalahan pada proses approval produk."
    );
  }

  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan pada proses approval produk.";
};
