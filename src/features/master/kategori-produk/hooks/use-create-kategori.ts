import axios from "axios";
import { useState } from "react";
import type { CreateKategoriProdukPayload } from "../types/kategori-produk";
import { createMasterKategoriProduk } from "../service/master-kategori-service";


type CreateKategoriProdukErrorResponse = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

const getCreateKategoriProdukErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<CreateKategoriProdukErrorResponse>(error)) {
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
    : "Gagal menyimpan kategori produk.";
};

const useCreateKategoriProduk = () => {
  const [loading, setLoading] = useState(false);

  const submit = async (payload: CreateKategoriProdukPayload) => {
    setLoading(true);

    try {
      await createMasterKategoriProduk(payload);
    } catch (err: unknown) {
      const message = getCreateKategoriProdukErrorMessage(err);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading };
};

export default useCreateKategoriProduk;
