import axios from "axios";
import API_URLS from "@/config/env";
import type { TicketConfiguration, TicketConfigurationPayload } from "../types/configuration";

type ConfigurationResponse = {
  data?: TicketConfiguration[] | { data?: TicketConfiguration[] };
};

function getHeaders() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token tidak ditemukan. Silakan login kembali.");

  return { Authorization: `Bearer ${token}`, Accept: "application/json" };
}

export async function getTicketConfigurations(): Promise<Record<string, string>> {
  const response = await axios.get<ConfigurationResponse>(
    `${API_URLS.sro}configurations`,
    { headers: getHeaders() },
  );
  const data = response.data.data;
  const configurations = Array.isArray(data) ? data : data?.data ?? [];

  return Object.fromEntries(
    configurations
      .filter((configuration) => configuration.is_active)
      .map(({ key, value }) => [key, value]),
  );
}

export async function saveTicketConfigurations(
  configurations: TicketConfigurationPayload[],
): Promise<void> {
  for (const { key, value } of configurations) {
    try {
      await axios.post(
        `${API_URLS.sro}configurations`,
        { key, value, is_active: true },
        { headers: getHeaders() },
      );
    } catch (error: unknown) {
      if (error && typeof error === "object") {
        Object.assign(error, { configurationKey: key });
      }
      throw error;
    }
  }
}
