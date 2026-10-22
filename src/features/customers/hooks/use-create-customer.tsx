import axios from "axios";
import { useState } from "react";

import { createCustomer } from "../services/customer-service";
import type { CreateCustomerPayload } from "../types/customer";

type CreateCustomerErrorResponse = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

const getCreateCustomerErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<CreateCustomerErrorResponse>(error)) {
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
    : "Gagal menyimpan data customer.";
};

const useCreateCustomer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (payload: CreateCustomerPayload) => {
    setLoading(true);
    setError(null);

    try {
      await createCustomer(payload);
    } catch (err: unknown) {
      const message = getCreateCustomerErrorMessage(err);
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

export default useCreateCustomer;
