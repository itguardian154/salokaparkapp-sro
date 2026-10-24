import API_URLS from "@/config/env";
import type { CreateKategoriProdukPayload, KategoriProdukDetailResponse, KategoriProdukListResponse, KategoriProdukQueryParams, UpdateKategoriProdukPayload } from "../types/kategori-produk";
import axios from "axios";

export const getMasterKategoriProduk = async (
  params: KategoriProdukQueryParams,
  signal?: AbortSignal,
): Promise<KategoriProdukListResponse> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await axios.get<KategoriProdukListResponse>(
    `${API_URLS.sro}product-categories`,
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

export const createMasterKategoriProduk = async (
  payload: CreateKategoriProdukPayload,
): Promise<void> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const url = `${API_URLS.sro}product-categories`;
  const headers = { Authorization: `Bearer ${token}` };

  await axios.post(url, payload, { headers });
};

export const getMasterKategoriProdukDetail = async (
  id: number,
  signal?: AbortSignal,
): Promise<KategoriProdukDetailResponse> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await axios.get<KategoriProdukDetailResponse>(
    `${API_URLS.sro}product-categories/${id}`,
    {
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};


export const updateMasterKategoriProduk = async (
  id: number,
  payload: UpdateKategoriProdukPayload,
): Promise<void> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

   const url = `${API_URLS.sro}product-categories/${id}`;
  const headers = { Authorization: `Bearer ${token}` };

  await axios.put(url, payload, { headers });
};

