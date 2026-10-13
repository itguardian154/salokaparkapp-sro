import axios from "axios";
import API_URLS from "@/config/env";
import type { Departemen, GetDepartemenResponse } from "../types/departemen";

export const getDepartemen = async (
  search: string,
  signal?: AbortSignal,
): Promise<Departemen[]> => {
  const response = await axios.get<GetDepartemenResponse>(
    `${API_URLS.lokahr}get_departemen`,
    {
      params: { departemen: search },
      signal,
      headers: {
        Accept: "application/json",
      },
    },
  );

  return response.data.periode;
};
