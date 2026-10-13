import axios from "axios";
import API_URLS from "@/config/env";
import type {
  ProdukDetailResponse,
  ProdukListResponse,
  ProdukQueryParams,
  CreateProdukPayload,
  UpdateProdukPayload,
} from "../types/master-produk";

export const createMasterProduk = async (
  payload: CreateProdukPayload,
  attachments: File[] = [],
): Promise<void> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const url = `${API_URLS.sro}products`;
  const headers = { Authorization: `Bearer ${token}` };

  if (attachments.length === 0) {
    await axios.post(url, payload, { headers });
    return;
  }

  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("description", payload.description);
  formData.append("price", String(payload.price));
  formData.append("day_type", payload.day_type);
  formData.append("min_qty", String(payload.min_qty));
  // Laravel menerima boolean multipart sebagai 1/0; teks "true"/"false" ditolak.
  formData.append("is_ticket", payload.is_ticket ? "1" : "0");
  formData.append("is_active", payload.is_active ? "1" : "0");
  payload.department_owners.forEach((owner, index) => {
    formData.append(
      `department_owners[${index}][department_id]`,
      owner.department_id,
    );
    formData.append(
      `department_owners[${index}][department_name]`,
      owner.department_name,
    );
  });
  formData.append("reference_file", attachments[0]);

  await axios.post(url, formData, { headers });
};

export const updateMasterProduk = async (
  id: number,
  payload: UpdateProdukPayload,
  referenceFile?: File | null,
): Promise<void> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (!referenceFile) {
    await axios.put(`${API_URLS.sro}products/${id}`, payload, { headers });
    return;
  }

  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("description", payload.description);
  formData.append("price", String(payload.price));
  formData.append("day_type", payload.day_type);
  // Laravel menerima boolean multipart sebagai 1/0; teks "true"/"false" ditolak.
  formData.append("is_ticket", payload.is_ticket ? "1" : "0");
  formData.append("is_active", payload.is_active ? "1" : "0");
  payload.department_owners.forEach((owner, index) => {
    formData.append(
      `department_owners[${index}][department_id]`,
      owner.department_id,
    );
    formData.append(
      `department_owners[${index}][department_name]`,
      owner.department_name,
    );
  });
  formData.append("reference_file", referenceFile);

  await axios.put(`${API_URLS.sro}products/${id}`, formData, { headers });
};

export const getMasterProduk = async (
  params: ProdukQueryParams,
  signal?: AbortSignal,
): Promise<ProdukListResponse> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await axios.get<ProdukListResponse>(
    `${API_URLS.sro}products`,
    {
      params,
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const getMasterProdukDetail = async (
  id: number,
  signal?: AbortSignal,
): Promise<ProdukDetailResponse> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await axios.get<ProdukDetailResponse>(
    `${API_URLS.sro}products/${id}`,
    {
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
