import axios from "axios";
import { useCallback, useState } from "react";
import { updateCustomer } from "../services/customer-service";
import type { UpdateCustomerPayload } from "../types/customer";

type UpdateCustomerErrorResponse = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

const getUpdateCustomerErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<UpdateCustomerErrorResponse>(error)) {
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
    : "Gagal memperbarui data customer.";
};

const useEditCustomer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (
    id: number,
    payload: UpdateCustomerPayload,
  ) => {
    setLoading(true);
    setError(null);

    try {
      await updateCustomer(id, payload);
    } catch (err: unknown) {
      const message = getUpdateCustomerErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const clearError = useCallback(() => setError(null), []);

  return {
    submit,
    loading,
    error,
    clearError,
  };
};

export default useEditCustomer;
