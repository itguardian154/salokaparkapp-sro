import dayjs from "dayjs";

export { cn } from "cn";

export type DateInput = string | number | Date | null | undefined;
export type CurrencyInput = string | number | null | undefined;

export const formatTanggal = (
  date: DateInput,
  format = "DD-MM-YYYY",
): string => {
  if (date === null || date === undefined || date === "") return "-";

  const parsedDate = dayjs(date);
  return parsedDate.isValid() ? parsedDate.format(format) : "-";
};

export const formatDateTime = (
  date: DateInput,
  format = "DD-MM-YYYY HH:mm:ss",
): string => {
  if (date === null || date === undefined || date === "") return "-";

  const parsedDate = dayjs(date);
  return parsedDate.isValid() ? parsedDate.format(format) : "-";
};

export const formatRupiah = (
  value: CurrencyInput,
  withPrefix = true,
): string => {
  if (value === null || value === undefined || value === "") return "-";

  const number = Number(value);
  if (!Number.isFinite(number)) return "-";

  const formatted = number.toLocaleString("id-ID");
  return withPrefix ? `Rp ${formatted}` : formatted;
};
