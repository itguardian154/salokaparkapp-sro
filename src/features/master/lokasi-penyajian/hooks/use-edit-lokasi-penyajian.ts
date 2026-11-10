import axios from "axios";
import { useCallback, useState } from "react";
import { updateMasterLokasiPenyajian } from "../service/lokasi-penyajian-service";
import type { UpdateLokasiPenyajianPayload } from "../types/lokasi-penyajian";

type UpdateLokasiPenyajianErrorResponse = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

const getUpdateLokasiPenyajianErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<UpdateLokasiPenyajianErrorResponse>(error)) {
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
    : "Gagal memperbarui data lokasi penyajian.";
};

const useEditLokasiPenyajian = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (
    id: number,
    payload: UpdateLokasiPenyajianPayload,
  ) => {
    setLoading(true);
    setError(null);

    try {
      await updateMasterLokasiPenyajian(id, payload);
    } catch (err: unknown) {
      const message = getUpdateLokasiPenyajianErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const clearError = useCallback(() => setError(null), []);

  return { submit, loading, error, clearError };
};

export default useEditLokasiPenyajian;