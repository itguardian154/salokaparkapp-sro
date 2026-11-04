import axios from "axios";
import API_URLS from "@/config/env";
import type {
  CustomerQueryParams,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  CustomerListResponse,
  CustomerDetailResponse,
} from "../types/customer";

export const createCustomer = async (
  payload: CreateCustomerPayload,
): Promise<void> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  await axios.post(`${API_URLS.sro}customers`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateCustomer = async (
  id: number,
  payload: UpdateCustomerPayload,
): Promise<void> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  await axios.put(`${API_URLS.sro}customers/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
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
    `${API_URLS.sro}customers/${id}`,
    {
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
