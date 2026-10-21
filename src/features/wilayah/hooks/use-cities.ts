import { useEffect, useState } from "react";
import { getCities } from "../service/wilayah-service";
import type { City } from "../types/wilayah";

export const useCities = (provinceId: number | null) => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (provinceId === null) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      try {
        setLoading(true);
        const data = await getCities(provinceId);
        setCities(data);
      } catch (error) {
        console.error("Gagal mengambil data kota:", error);
        setCities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [provinceId]);

  return { cities, loading };
};