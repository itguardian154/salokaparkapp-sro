import axios from "axios";
import { useCallback, useState } from "react";
import { updateMasterProduk } from "../service/master-produk-service";
import type { UpdateProdukPayload } from "../types/master-produk";

type UpdateProdukErrorResponse = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

const getUpdateProdukErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<UpdateProdukErrorResponse>(error)) {
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
    : "Gagal memperbarui data produk.";
};

const useEditProduk = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (
    id: number,
    payload: UpdateProdukPayload,
    referenceFile?: File | null,
  ) => {
    setLoading(true);
    setError(null);

    try {
      await updateMasterProduk(id, payload, referenceFile);
    } catch (err: unknown) {
      const message = getUpdateProdukErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const clearError = useCallback(() => setError(null), []);

  return { submit, loading, error, clearError };
};

export default useEditProduk;