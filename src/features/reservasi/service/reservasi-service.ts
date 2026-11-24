
import axios from "axios";
import API_URLS from "@/config/env";
import type {
  ReservasiDetailResponse,
  ReservasiListResponse,
  ReservasiListParams,
  GenerateReservasiEventOrderResponse,
  CreateReservasi,
} from "../types/reservasi";

const reservasiUrl = `${API_URLS.sro}sales-orders`;

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

const buildFormData = (payload: Record<string, unknown>): FormData => {
  const formData = new FormData();

  const appendValue = (
    key: string,
    value: unknown,
  ): void => {
    if (value === undefined) return;

    // File harus dikirim sebagai binary.
    if (value instanceof File) {
      formData.append(key, value, value.name);
      return;
    }

    if (value instanceof Blob) {
      formData.append(key, value);
      return;
    }

    // Array dikirim menggunakan index.
    if (Array.isArray(value)) {
      // Attachment hanya boleh berisi File.
      if (key.endsWith("[attachments]")) {
        value.forEach((file, index) => {
          if (file instanceof File) {
            formData.append(
              `${key}[${index}]`,
              file,
              file.name,
            );
          }
        });

        return;
      }

      value.forEach((item, index) => {
        appendValue(`${key}[${index}]`, item);
      });

      return;
    }

    // Object dikirim menggunakan nested key.
    if (
      typeof value === "object" &&
      value !== null &&
      !(value instanceof Date)
    ) {
      Object.entries(value).forEach(([childKey, childValue]) => {
        appendValue(`${key}[${childKey}]`, childValue);
      });

      return;
    }

    // Date dikonversi ke format string.
    if (value instanceof Date) {
      formData.append(key, value.toISOString());
      return;
    }

    // Null dikirim sebagai string kosong.
    if (value === null) {
      formData.append(key, "");
      return;
    }

    formData.append(key, String(value));
  };

  Object.entries(payload).forEach(([key, value]) => {
    appendValue(key, value);
  });

  return formData;
};

// GET LIST RESERVASI
export const getReservasi = async (
  params: ReservasiListParams,
  signal?: AbortSignal,
): Promise<ReservasiListResponse> => {
  const response = await axios.get<ReservasiListResponse>(
    reservasiUrl,
    {
      params,
      signal,
      headers: getAuthHeaders(),
    },
  );

  return response.data;
};

// GET DETAIL RESERVASI
export const getReservasiDetail = async (
  id: string,
  signal?: AbortSignal,
) => {
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
export const createReservasi = async (
  payload: CreateReservasi,
) => {
  const formData = buildFormData(
    payload as unknown as Record<string, unknown>,
  );

  const response = await axios.post<ReservasiDetailResponse>(
    reservasiUrl,
    formData,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data.data;
};

// GENERATE EVENT ORDER
export const generateEventOrders = async (
  invoiceId: number,
): Promise<GenerateReservasiEventOrderResponse> => {
  const response = await axios.get<GenerateReservasiEventOrderResponse>(
    `${reservasiUrl}/event-orders/generate`,
    {
      params: {
        invoice_id: invoiceId,
      },
      headers: getAuthHeaders(),
    },
  );

  return response.data;
};

// UPDATE RESERVASI
export const updateReservasi = async (
  id: string,
  payload: FormData,
) => {
  const response = await axios.put<ReservasiDetailResponse>(
    `${reservasiUrl}/${id}`,
    payload,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data.data;
};
