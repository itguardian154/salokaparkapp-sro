import { useCallback, useEffect, useState } from "react";
import { getCustomerDetail } from "../services/customer-service";
import type { CustomerDetail } from "../types/customer";

const useDetailCustomer = (
  customerId: number | null,
  open: boolean,
) => {
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!open || customerId === null) {
      setCustomer(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchCustomerDetail = async () => {
      setLoading(true);
      setError(null);
      setCustomer(null);

      try {
        const response = await getCustomerDetail(
          customerId,
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setCustomer(response.data);
        }
      } catch (err: unknown) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil detail customer.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchCustomerDetail();

    return () => controller.abort();
  }, [customerId, open, refreshKey]);

  return {
    customer,
    loading,
    error,
    refetch,
  };
};

export default useDetailCustomer;