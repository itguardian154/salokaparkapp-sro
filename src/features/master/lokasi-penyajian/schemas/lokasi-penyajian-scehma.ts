import { z } from "zod";

export const createLokasiPenyajianFormSchema = z.object({
  name: z
    .string()
    .min(1, "Nama lokasi wajib diisi.")
    .trim(),

  quota: z
    .string()
    .refine(
      (value) => value === "" || /^\d+$/.test(value),
      "Kuota harus berupa angka.",
    )
    .optional()
    .default("0"),
});

export type CreateLokasiPenyajianFormValues = z.infer<
  typeof createLokasiPenyajianFormSchema
>;