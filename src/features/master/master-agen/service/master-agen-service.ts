
import axios from "axios";
import API_URLS from "@/config/env";

import type {
  Agent,
  GetAgentParams,
  CreateMasterAgentPayload,
  AgentDetailResponse,
} from "../types/master-agen";

interface AgentResponse {
  data: Agent[];
  meta: {
    total: number;
    last_page: number;
    current_page?: number;
    per_page?: number;
    from?: number | null;
    to?: number | null;
  };
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Token tidak ditemukan. Silakan login kembali.",
    );
  }

  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
};

// GET MASTER AGEN
export const getMasterAgent = async (
  params: GetAgentParams,
  signal?: AbortSignal,
): Promise<AgentResponse> => {
  const response = await axios.get<AgentResponse>(
    `${API_URLS.sro}partners`,
    {
      params,
      headers: getAuthHeaders(),
      signal,
    },
  );

  return response.data;
};

// CREATE MASTER AGEN
export const createMasterAgent = async (
  payload: CreateMasterAgentPayload,
) => {
  try {
    const response = await axios.post(
      `${API_URLS.sro}partners`,
      payload,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as
        | {
            message?: string;
            errors?: Record<string, string[] | string>;
          }
        | undefined;

      const validationMessages = responseData?.errors
        ? Object.values(responseData.errors)
            .flatMap((messages) =>
              Array.isArray(messages)
                ? messages
                : [messages],
            )
            .join("\n")
        : "";

      throw new Error(
        validationMessages ||
          responseData?.message ||
          error.message ||
          "Gagal menyimpan data agen.",
      );
    }

    throw error;
  }
};

// UPDATE MASTER AGEN
export const updateMasterAgent = async (
  id: number,
  payload: CreateMasterAgentPayload,
) => {
  try {
    const response = await axios.put(
      `${API_URLS.sro}partners/${id}`,
      payload,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as
        | {
            message?: string;
            errors?: Record<string, string[] | string>;
          }
        | undefined;

      const validationMessages = responseData?.errors
        ? Object.values(responseData.errors)
            .flatMap((messages) =>
              Array.isArray(messages)
                ? messages
                : [messages],
            )
            .join("\n")
        : "";

      throw new Error(
        validationMessages ||
          responseData?.message ||
          error.message ||
          "Gagal memperbarui data agen.",
      );
    }

    throw error;
  }
};

// GET DETAIL MASTER AGEN
export const getMasterAgentDetail = async (
  id: number,
): Promise<AgentDetailResponse> => {
  const response = await axios.get<AgentDetailResponse>(
    `${API_URLS.sro}partners/${id}`,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data;
};
