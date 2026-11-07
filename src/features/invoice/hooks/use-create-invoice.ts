import { useState } from "react";
import { createInvoice } from "../service/invoice-service";
import { getInvoiceErrorMessage } from "../utils/invoice-error";

const useCreateInvoice = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (payload: FormData) => {
    setLoading(true);
    setError(null);

    try {
      return await createInvoice(payload);
    } catch (err: unknown) {
      const message = getInvoiceErrorMessage(err, "Gagal menambahkan invoice.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { submit, loading, error, clearError };
};

export default useCreateInvoice;
