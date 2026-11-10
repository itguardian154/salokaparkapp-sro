import axios from "axios";
import API_URLS from "@/config/env";
import type {
  ReservasiDetailResponse,
  ReservasiListResponse,
  ReservasiListParams,
} from "../types/reservasi";

const reservasiUrl = `${API_URLS.sro}sales-order`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
};

// GET LIST RESERVASI
export const getReservasi = async (
  params: ReservasiListParams,
  signal?: AbortSignal,
): Promise<ReservasiListResponse> => {
  const response = await axios.get<ReservasiListResponse>(reservasiUrl, {
    params,
    signal,
    headers: getAuthHeaders(),
  });

  return response.data;
};

// GET DETAIL RESERVASI
export const getReservasiDetail = async (id: string, signal?: AbortSignal) => {
  const response = await axios.get<ReservasiDetailResponse>(
    `${reservasiUrl}/${id}`,
    {
      signal,
      headers: getAuthHeaders(),
    },
  );

  return response.data.data;
};

// CREATE RESERVASI
export const createReservasi = async (payload: FormData) => {
  const response = await axios.post<ReservasiDetailResponse>(
    reservasiUrl,
    payload,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data.data;
};

// UPDATE RESERVASI
export const updateReservasi = async (id: string, payload: FormData) => {
  const response = await axios.put<ReservasiDetailResponse>(
    `${reservasiUrl}/${id}`,
    payload,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data.data;
};
