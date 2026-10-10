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

export const getCities = async (): Promise<City[]> => {
  const headers = getAuthHeaders();

  const firstResponse = await axios.get<PaginatedResponse<City>>(
    API_URLS.cities,
    {
      params: { page: 1, per_page: 100 },
      headers,
    },
  );

  const result = [...firstResponse.data.data];
  const lastPage = firstResponse.data.meta.last_page;

  for (let page = 2; page <= lastPage; page += 1) {
    const response = await axios.get<PaginatedResponse<City>>(
      API_URLS.cities,
      {
        params: { page, per_page: 100 },
        headers,
      },
    );

    result.push(...response.data.data);
  }

  return result;
};