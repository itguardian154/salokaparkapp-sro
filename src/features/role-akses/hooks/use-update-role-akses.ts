
import axios from "axios";
import { useState } from "react";

import { updateRoleAkses } from "../service/role-akses-service";
import type { UpdateRoleAksesPayload } from "../types/role-akses";

type UpdateRoleAksesErrorResponse = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

const getUpdateRoleAksesErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<UpdateRoleAksesErrorResponse>(error)) {
    const response = error.response?.data;

    const validationErrors = Object.values(
      response?.errors ?? {},
    ).flatMap((messages) =>
      Array.isArray(messages) ? messages : [messages],
    );

    if (validationErrors.length > 0) {
      return `${response?.message ?? "Validasi gagal."} ${validationErrors.join(" ")}`;
    }

    if (response?.message) {
      return response.message;
    }
  }

  return error instanceof Error
    ? error.message
    : "Gagal memperbarui data role akses.";
};

const useUpdateRoleAkses = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (
    id: number,
    payload: UpdateRoleAksesPayload,
  ) => {
    setLoading(true);
    setError(null);

    try {
      await updateRoleAkses(id, payload);
    } catch (err: unknown) {
      const message = getUpdateRoleAksesErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    submit,
    loading,
    error,
    clearError,
  };
};

export default useUpdateRoleAkses;
