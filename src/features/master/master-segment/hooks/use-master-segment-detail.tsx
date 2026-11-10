
import { useEffect, useState } from "react";
import { getSegmentById } from "../service/master-segment-service";
import type { SegmentDetail } from "../types/master-segment";

export const useSegmentDetails = (segmentId: number | null) => {
  const [segmentDetails, setSegmentDetails] = useState<SegmentDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (segmentId === null) {
      setSegmentDetails([]);
      setError(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getSegmentById(segmentId);

        if (mounted) {
          setSegmentDetails(
            (data.details ?? []).filter((item) => item.is_active),
          );
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Gagal mengambil data Segment Detail.",
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchDetails();

    return () => {
      mounted = false;
    };
  }, [segmentId]);

  return { segmentDetails, loading, error };
};
