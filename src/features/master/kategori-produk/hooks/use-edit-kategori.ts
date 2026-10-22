import axios from "axios";
import { useCallback, useState } from "react";
import type { UpdateKategoriProdukPayload } from "../types/kategori-produk";
import { updateMasterKategoriProduk } from "../service/master-kategori-service";

type UpdateKategoriProdukErrorResponse = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

const getUpdateKategoriProdukErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<UpdateKategoriProdukErrorResponse>(error)) {
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

const useEditKategoriProduk = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (
    id: number,
    payload: UpdateKategoriProdukPayload,
  ) => {
    setLoading(true);
    setError(null);

    try {
      await updateMasterKategoriProduk(id, payload);
    } catch (err: unknown) {
      const message = getUpdateKategoriProdukErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const clearError = useCallback(() => setError(null), []);

  return { submit, loading, error, clearError };
};

export default useEditKategoriProduk;