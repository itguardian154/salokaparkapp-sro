import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import {
  getTicketConfigurations,
  saveTicketConfigurations,
} from "../service/configuration-service";
import { validateTicketConfigurationValues } from "../schemas/configuration-schema";
import type {
  TicketConfigurationKey,
  TicketConfigurationValues,
} from "../types/configuration";

type ConfigurationErrorResponse = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

function addConfigurationToast(options: {
  title: string;
  description: string;
  type: "success" | "error";
  timeout: number;
}) {
  const toastId = toast.add(options);
  window.setTimeout(() => toast.close(toastId), options.timeout);
}

function getConfigurationErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ConfigurationErrorResponse>(error)) {
    const response = error.response?.data;
    const validationErrors = Object.values(response?.errors ?? {}).flatMap(
      (messages) => Array.isArray(messages) ? messages : [messages],
    );
    if (validationErrors.length > 0) {
      return `${response?.message ?? "Validasi gagal."} ${validationErrors.join(" ")}`;
    }
    if (response?.message) return response.message;
  }

  return error instanceof Error ? error.message : "Gagal menyimpan konfigurasi.";
}

export default function useTicketConfigurations(
  keys: TicketConfigurationKey[],
) {
  const [values, setValues] = useState<TicketConfigurationValues>({});
  const [savedValues, setSavedValues] = useState<TicketConfigurationValues>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<TicketConfigurationKey, string>>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const configurations = await getTicketConfigurations();
      const loadedValues = Object.fromEntries(
        keys.map((key) => [key, configurations[key] ?? ""]),
      );
      setValues(loadedValues);
      setSavedValues(loadedValues);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Gagal memuat konfigurasi.");
    } finally {
      setLoading(false);
    }
  }, [keys]);

  useEffect(() => { void load(); }, [load]);

  const update = (key: TicketConfigurationKey, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  };

  const cancel = () => {
    setValues(savedValues);
    setError("");
    setFieldErrors({});
  };

  const save = async () => {
    const validationErrors = validateTicketConfigurationValues(values);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return false;
    }

    setSaving(true);
    setError("");
    setFieldErrors({});
    try {
      await saveTicketConfigurations(keys.map((key) => ({
        key,
        value: values[key] ?? "",
      })));
      addConfigurationToast({
        title: "Konfigurasi tiket berhasil disimpan",
        description: "Pengaturan tiket sudah diperbarui.",
        type: "success",
        timeout: 4000,
      });
      setSavedValues(values);
      return true;
    } catch (requestError: unknown) {
      const message = getConfigurationErrorMessage(requestError);
      addConfigurationToast({
        title: "Konfigurasi tiket gagal disimpan",
        description: message,
        type: "error",
        timeout: 6000,
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { values, update, load, loading, saving, error, fieldErrors, save, cancel };
}
