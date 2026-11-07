import axios from "axios";
import API_URLS from "@/config/env";
import type { GetKaryawanByNameResponse, Karyawan } from "../types/karyawan";

export const getKaryawanByName = async (
  name: string,
  signal?: AbortSignal,
): Promise<Karyawan[]> => {
  const response = await axios.get<GetKaryawanByNameResponse>(
    `${API_URLS.lokahr}get_karyawan_byID`,
    {
      params: { name },
      signal,
      headers: { Accept: "application/json" },
    },
  );

  return response.data.data;
};
