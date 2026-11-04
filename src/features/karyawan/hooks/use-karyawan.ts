import { useEffect, useState } from "react";
import { getKaryawanByName } from "../service/karyawan-service";
import type { Karyawan } from "../types/karyawan";

export const useKaryawan = () => {
  const [karyawan, setKaryawan] = useState<Karyawan[]>([]);
  const [searchKaryawan, setSearchKaryawan] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const name = searchKaryawan.trim();
    const controller = new AbortController();
    const fetchKaryawan = async () => {
      setLoading(true);
      setError(null);

      try {
        setKaryawan(await getKaryawanByName(name, controller.signal));
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        setKaryawan([]);
        setError(
          err instanceof Error ? err.message : "Gagal mengambil data karyawan.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void fetchKaryawan();
    return () => controller.abort();
  }, [searchKaryawan]);

  return { karyawan, searchKaryawan, setSearchKaryawan, loading, error };
};
