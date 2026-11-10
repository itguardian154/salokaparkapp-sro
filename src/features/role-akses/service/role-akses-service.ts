
import axios from "axios";
import API_URLS from "@/config/env";
import type {
  RoleAksesQueryParams,
  CreateRoleAksesPayload,
  UpdateRoleAksesPayload,
  RoleAksesListResponse,
  RoleAksesDetailResponse,
  RoleAksesPermissionListResponse,
} from "../types/role-akses";

export const createRoleAkses = async (
  payload: CreateRoleAksesPayload,
): Promise<void> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  await axios.post(`${API_URLS.sro}roles`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateRoleAkses = async (
  id: number,
  payload: UpdateRoleAksesPayload,
): Promise<void> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  await axios.put(`${API_URLS.sro}roles/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getRoleAkses = async (
  params: RoleAksesQueryParams,
  signal?: AbortSignal,
): Promise<RoleAksesListResponse> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await axios.get<RoleAksesListResponse>(
    `${API_URLS.sro}roles`,
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

export const getRoleAksesDetail = async (
  id: number,
  signal?: AbortSignal,
): Promise<RoleAksesDetailResponse> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await axios.get<RoleAksesDetailResponse>(
    `${API_URLS.sro}roles/${id}`,
    {
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const getPermission = async (
  signal?: AbortSignal,
): Promise<RoleAksesPermissionListResponse> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  const response = await axios.get<RoleAksesPermissionListResponse>(
    `${API_URLS.sro}permissions`,
    {
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
