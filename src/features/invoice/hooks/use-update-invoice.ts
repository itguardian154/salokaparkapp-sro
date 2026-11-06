import { useState } from "react";
import { updateInvoice } from "../service/invoice-service";
import { getInvoiceErrorMessage } from "../utils/invoice-error";

const useUpdateInvoice = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (id: string, payload: FormData) => {
    setLoading(true);
    setError(null);

    try {
      return await updateInvoice(id, payload);
    } catch (err: unknown) {
      const message = getInvoiceErrorMessage(err, "Gagal memperbarui invoice.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { submit, loading, error, clearError };
};

export default useUpdateInvoice;
