import { useCallback, useEffect, useState } from "react";
import { getInvoice } from "../service/invoice-service";
import type { InvoiceDetail } from "../types/invoice";
import { getInvoiceErrorMessage } from "../utils/invoice-error";

const useInvoiceDetail = (id?: string) => {
  const [data, setData] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getInvoice(id, controller.signal)
      .then(setData)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            getInvoiceErrorMessage(requestError, "Gagal memuat invoice."),
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [id, refreshKey]);

  const invoice = data?.id === Number(id) ? data : null;

  return { invoice, loading, error, refetch };
};

export default useInvoiceDetail;
