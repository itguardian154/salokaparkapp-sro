import { useEffect, useState } from "react";
import { getMasterProdukDetail } from "../service/master-produk-service";
import type { ProdukDetail } from "../types/master-produk";

const useDetailProduk = (produkId: number | null, open: boolean) => {
  const [produk, setProduk] = useState<ProdukDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || produkId === null) {
      setProduk(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchProdukDetail = async () => {
      setLoading(true);
      setError(null);
      setProduk(null);

      try {
        const response = await getMasterProdukDetail(
          produkId,
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setProduk(response.data);
        }
      } catch (err: unknown) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil detail produk.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void fetchProdukDetail();

    return () => controller.abort();
  }, [produkId, open]);

  return { produk, loading, error };
};

export default useDetailProduk;
