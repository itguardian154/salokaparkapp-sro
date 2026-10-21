import axios from "axios";
import API_URLS from "@/config/env";
import type {
  CustomerQueryParams,
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from "../types/customer";

export const createCustomer = async (
  payload: CreateCustomerPayload,
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
  formData.append("is_active", payload.is_active ? "1" : "0");
  await axios.post(url, formData, { headers });
};

export const updateCustomer = async (
  id: number,
  payload: UpdateCustomerPayload,
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
  formData.append("is_active", payload.is_active ? "1" : "0");
  await axios.put(`${API_URLS.sro}customers/${id}`, formData, { headers });
};

export const getCustomer = async (
  params: CustomerQueryParams,
  signal?: AbortSignal,
): Promise<CustomerListResponse> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await axios.get<CustomerListResponse>(
    `${API_URLS.sro}customers`,
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

export const getCustomerDetail = async (
  id: number,
  signal?: AbortSignal,
): Promise<CustomerDetailResponse> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await axios.get<CustomerDetailResponse>(
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
