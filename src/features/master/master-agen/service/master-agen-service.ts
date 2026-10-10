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

  const response = await axios.get<AgentResponse>(API_URLS.partner, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return response.data;
};

export const createMasterAgent = async (payload: CreateMasterAgentPayload) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  try {
    console.log("POST URL:", API_URLS.partner);
    console.log("POST Payload:", payload);

    const response = await axios.post(API_URLS.partner, payload, {
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
        | { message?: string; errors?: Record<string, string[]> }
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

export const getMasterAgentDetail = async (
  id: number,
): Promise<AgentDetailResponse> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await axios.get<AgentDetailResponse>(
    `${API_URLS.partner}/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  );

  return response.data;
};
