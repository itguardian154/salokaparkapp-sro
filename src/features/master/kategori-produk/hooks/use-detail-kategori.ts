import { useCallback, useEffect, useState } from "react";
import type { KategoriProdukDetail } from "../types/kategori-produk";
import { getMasterKategoriProdukDetail } from "../service/master-kategori-service";


const useDetailKategoriProduk = (produkId: number | null, open: boolean) => {
  const [produk, setProduk] = useState<KategoriProdukDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

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
        const response = await getMasterKategoriProdukDetail(
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
  }, [produkId, open, refreshKey]);

  return { produk, loading, error, refetch };
};

export default useDetailKategoriProduk;
