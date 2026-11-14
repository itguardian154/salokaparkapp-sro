import { useEffect, useState } from "react";
import { getSegments } from "../service/master-segment-service";
import type { Segment } from "../types/master-segment";

type UseSegmentsOptions = {
  is_active?: boolean;
};

export const useSegments = ({ is_active = true }: UseSegmentsOptions = {}) => {
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
          setSegments(
            is_active ? data.filter((item) => item.is_active === true) : data,
          );
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
  }, [is_active]);

  return { segments, loading, error };
};
