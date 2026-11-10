import API_URLS from "@/config/env";
import axios from "axios";
import type { CreateLokasiPenyajianPayload, LokasiPenyajianDetailResponse, LokasiPenyajianListResponse, LokasiPenyajianQueryParams, UpdateLokasiPenyajianPayload } from "../types/lokasi-penyajian";

export const getMasterLokasiPenyajian = async (
  params: LokasiPenyajianQueryParams,
  signal?: AbortSignal,
): Promise<LokasiPenyajianListResponse> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await axios.get<LokasiPenyajianListResponse>(
    `${API_URLS.sro}locations`,
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

export const createMasterLokasiPenyajian = async (
  payload: CreateLokasiPenyajianPayload,
): Promise<void> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const url = `${API_URLS.sro}locations`;
  const headers = { Authorization: `Bearer ${token}` };

  await axios.post(url, payload, { headers });
};

export const getMasterLokasiPenyajianDetail = async (
  id: number,
  signal?: AbortSignal,
): Promise<LokasiPenyajianDetailResponse> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await axios.get<LokasiPenyajianDetailResponse>(
    `${API_URLS.sro}locations/${id}`,
    {
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};


export const updateMasterLokasiPenyajian = async (
  id: number,
  payload: UpdateLokasiPenyajianPayload,
): Promise<void> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

   const url = `${API_URLS.sro}locations/${id}`;
  const headers = { Authorization: `Bearer ${token}` };

  await axios.put(url, payload, { headers });
};

