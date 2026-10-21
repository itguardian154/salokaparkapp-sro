import axios from "axios";
import API_URLS from "@/config/env";
import type {
  Province,
  City,
  PaginatedResponse,
} from "../types/wilayah";

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

// GET PROVINCES
export const getProvinces = async (): Promise<Province[]> => {
  const response = await axios.get<PaginatedResponse<Province>>(
    API_URLS.provinces,
    {
      params: { per_page: 100 },
      headers: getAuthHeaders(),
    },
  );

  return response.data.data;
};

// GET CITIES / REGENCIES BASED ON PROVINCE
export const getCities = async (
  provinceId: number,
): Promise<City[]> => {
  if (!provinceId) {
    return [];
  }

  const response = await axios.get<PaginatedResponse<City>>(
    API_URLS.cities,
    {
      params: {
        province_id: provinceId,
      },
      headers: getAuthHeaders(),
    },
  );

  return response.data.data;
};