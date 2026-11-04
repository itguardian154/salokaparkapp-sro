
import axios from "axios";
import { useState } from "react";

import { createRoleAkses } from "../service/role-akses-service";
import type { CreateRoleAksesPayload } from "../types/role-akses";

type CreateRoleAksesErrorResponse = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

const getCreateRoleAksesErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<CreateRoleAksesErrorResponse>(error)) {
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
    : "Gagal menyimpan data role akses.";
};

const useCreateRoleAkses = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (payload: CreateRoleAksesPayload) => {
    setLoading(true);
    setError(null);

    try {
      await createRoleAkses(payload);
    } catch (err: unknown) {
      const message = getCreateRoleAksesErrorMessage(err);
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

export default useCreateRoleAkses;
