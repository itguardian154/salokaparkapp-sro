
import { useEffect, useState } from "react";
import { getProvinces } from "../service/wilayah-service";
import type { Province } from "../types/wilayah";

export const useProvinces = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchProvinces = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getProvinces();

        if (!cancelled) {
          setProvinces(data);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Gagal mengambil data provinsi.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchProvinces();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    provinces,
    loading,
    error,
  };
};
