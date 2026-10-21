import { useState } from "react";
import { createMasterAgent } from "../service/master-agen-service";
import type { CreateMasterAgentPayload } from "../types/master-agen";

export const useCreateMasterAgent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (payload: CreateMasterAgentPayload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createMasterAgent(payload);
      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal menambahkan master agen";

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    submit,
    loading,
    error,
    clearError,
  };
};
