import axios from "axios";
import { useState } from "react";
import type { CreateLokasiPenyajianPayload } from "../types/lokasi-penyajian";
import { createMasterLokasiPenyajian } from "../service/lokasi-penyajian-service";

type CreateLokasiPenyajianErrorResponse = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

const getCreateLokasiPenyajianErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<CreateLokasiPenyajianErrorResponse>(error)) {
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
    : "Gagal menyimpan Lokasi Penyajian.";
};

const useCreateLokasiPenyajian = () => {
  const [loading, setLoading] = useState(false);

  const submit = async (payload: CreateLokasiPenyajianPayload) => {
    setLoading(true);

    try {
      await createMasterLokasiPenyajian(payload);
    } catch (err: unknown) {
      const message = getCreateLokasiPenyajianErrorMessage(err);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading };
};

export default useCreateLokasiPenyajian;
