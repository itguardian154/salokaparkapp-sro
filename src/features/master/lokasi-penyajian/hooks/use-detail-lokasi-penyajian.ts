import { useCallback, useEffect, useState } from "react";
import type { LokasiPenyajianDetail } from "../types/lokasi-penyajian";
import { getMasterLokasiPenyajianDetail } from "../service/lokasi-penyajian-service";




const useDetailLokasiPenyajian = (lokasiPenyajianId: number | null, open: boolean) => {
  const [lokasiPenyajian, setLokasiPenyajian] = useState<LokasiPenyajianDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!open || lokasiPenyajianId === null) {
      setLokasiPenyajian(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchLokasiPenyajianDetail = async () => {
      setLoading(true);
      setError(null);
      setLokasiPenyajian(null);

      try {
        const response = await getMasterLokasiPenyajianDetail(
          lokasiPenyajianId,
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setLokasiPenyajian(response.data);
        }
      } catch (err: unknown) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil detail lokasi penyajian.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void fetchLokasiPenyajianDetail();

    return () => controller.abort();
  }, [lokasiPenyajianId, open, refreshKey]);

  return { lokasiPenyajian, loading, error, refetch };
};

export default useDetailLokasiPenyajian;
