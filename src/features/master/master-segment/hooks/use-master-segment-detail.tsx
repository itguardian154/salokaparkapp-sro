import { useEffect, useState } from "react";
import { getSegmentDetails } from "../service/master-segment-service";
import type { SegmentDetail } from "../types/master-segment";

export const useSegmentDetails = (segmentId: number | null) => {
  const [allDetails, setAllDetails] = useState<SegmentDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (segmentId === null) {
      setAllDetails([]);
      setError(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getSegmentDetails();

        if (mounted) {
          setAllDetails(data.filter((item) => item.is_active));
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

  const segmentDetails = allDetails.filter(
    (item) => Number(item.segment_id) === segmentId,
  );

  return { segmentDetails, loading, error };
};