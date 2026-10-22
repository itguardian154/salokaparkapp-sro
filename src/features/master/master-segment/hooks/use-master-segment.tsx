import { useEffect, useState } from "react";
import { getSegments } from "../service/master-segment-service";
import type { Segment } from "../types/master-segment";

export const useSegments = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchSegments = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getSegments();

        if (mounted) {
          setSegments(data.filter((item) => item.is_active));
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Gagal mengambil data Segment.",
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchSegments();

    return () => {
      mounted = false;
    };
  }, []);

  return { segments, loading, error };
};