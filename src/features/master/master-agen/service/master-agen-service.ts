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
  };
}

export const getMasterAgent = async (
  params: GetAgentParams = {},
): Promise<AgentResponse> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await axios.get<AgentResponse>(
    `${API_URLS.sro}partners`,
    {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  );

  return response.data;
};

export const createMasterAgent = async (
  payload: CreateMasterAgentPayload,
) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  try {
    const url = `${API_URLS.sro}partners`;

    console.log("POST URL:", url);
    console.log("POST Payload:", payload);

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("POST Response:", response.status, response.data);

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("POST Status:", error.response?.status);
      console.error("POST Response Error:", error.response?.data);

      const responseData = error.response?.data as
        | {
            message?: string;
            errors?: Record<string, string[]>;
          }
        | undefined;

      const validationMessages = responseData?.errors
        ? Object.values(responseData.errors).flat().join("\n")
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
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  try {
    const url = `${API_URLS.sro}partners/${id}`;

    console.log("PUT URL:", url);
    console.log("PUT Payload:", payload);

    const response = await axios.put(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("PUT Response:", response.status, response.data);

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("PUT Status:", error.response?.status);
      console.error("PUT Response Error:", error.response?.data);

      const responseData = error.response?.data as
        | {
            message?: string;
            errors?: Record<string, string[] | string>;
          }
        | undefined;

      const validationMessages = responseData?.errors
        ? Object.values(responseData.errors)
            .flatMap((messages) =>
              Array.isArray(messages) ? messages : [messages],
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

export const getMasterAgentDetail = async (
  id: number,
): Promise<AgentDetailResponse> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await axios.get<AgentDetailResponse>(
    `${API_URLS.sro}partners/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  );

  return response.data;
};
