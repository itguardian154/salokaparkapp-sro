
import { useEffect, useMemo, useState } from "react";
import { getCities } from "../service/wilayah-service";
import type { City } from "../types/wilayah";

export const useCities = (provinceId: number | null) => {
  const [allCities, setAllCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCities = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getCities();

        if (!cancelled) {
          setAllCities(data);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Gagal mengambil data kota.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchCities();

    return () => {
      cancelled = true;
    };
  }, []);

  const cities = useMemo(() => {
    if (provinceId === null) {
      return [];
    }

    return allCities.filter(
      (city) => city.province_id === provinceId,
    );
  }, [allCities, provinceId]);

  return {
    cities,
    loading,
    error,
  };
};
