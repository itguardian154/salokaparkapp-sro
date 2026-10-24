import { z } from "zod";

export const createKategoriProdukFormSchema = z.object({
  name: z.string().trim().min(1, "Kategori produk wajib diisi"),
});

export type CreateKategoriProdukFormValues = z.infer<typeof createKategoriProdukFormSchema>;
