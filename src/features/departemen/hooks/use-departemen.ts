import { useEffect, useState } from "react";
import { getDepartemen } from "../service/departemen-service";
import type { Departemen } from "../types/departemen";

export const useDepartemen = () => {
  const [departemen, setDepartemen] = useState<Departemen[]>([]);
  const [searchDepartemen, setSearchDepartemen] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchDepartemen = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getDepartemen(
          searchDepartemen.trim(),
          controller.signal,
        );
        setDepartemen(data);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil data departemen.",
        );
        setDepartemen([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void fetchDepartemen();

    return () => controller.abort();
  }, [searchDepartemen]);

  return { departemen, searchDepartemen, setSearchDepartemen, loading, error };
};
