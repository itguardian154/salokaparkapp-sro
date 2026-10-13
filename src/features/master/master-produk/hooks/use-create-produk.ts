import axios from "axios";
import { useState } from "react";
import { createMasterProduk } from "../service/master-produk-service";
import type { CreateProdukPayload } from "../types/master-produk";

type CreateProdukErrorResponse = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

const getCreateProdukErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<CreateProdukErrorResponse>(error)) {
    const response = error.response?.data;
    const validationErrors = Object.values(response?.errors ?? {}).flatMap(
      (messages) => (Array.isArray(messages) ? messages : [messages]),
    );

    if (validationErrors.length > 0) {
      return `${response?.message ?? "Validasi gagal."} ${validationErrors.join(" ")}`;
    }

    if (response?.message) return response.message;
  }

  return error instanceof Error
    ? error.message
    : "Gagal menyimpan data produk.";
};

const useCreateProduk = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (payload: CreateProdukPayload, attachments: File[] = []) => {
    setLoading(true);
    setError(null);

    try {
      await createMasterProduk(payload, attachments);
    } catch (err: unknown) {
      const message = getCreateProdukErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { submit, loading, error, clearError };
};

export default useCreateProduk;
