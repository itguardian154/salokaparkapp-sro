import axios from "axios";

type InvoiceErrorResponse = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

export const getInvoiceErrorMessage = (
  error: unknown,
  fallback: string,
) => {
  if (axios.isAxiosError<InvoiceErrorResponse>(error)) {
    const response = error.response?.data;
    const validationErrors = Object.values(response?.errors ?? {}).flatMap(
      (messages) => (Array.isArray(messages) ? messages : [messages]),
    );

    if (validationErrors.length > 0) {
      return `${response?.message ?? "Validasi gagal."} ${validationErrors.join(" ")}`;
    }

    if (response?.message) return response.message;
  }

  return error instanceof Error ? error.message : fallback;
};
