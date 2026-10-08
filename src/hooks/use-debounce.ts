import { useEffect, useState } from "react";

/**
 * Hook sederhana untuk debounce value (misal search input)
 * @param value Nilai yang mau di-debounce
 * @param {number} delay Waktu delay dalam ms (default: 500)
 * @returns Nilai yang sudah di-debounce
 */
export default function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
