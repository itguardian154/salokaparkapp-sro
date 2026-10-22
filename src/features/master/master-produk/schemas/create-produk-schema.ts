import { z } from "zod";

export const createProdukFormSchema = z.object({
  name: z.string().trim().min(1, "Nama produk wajib diisi"),
  product_category_id: z.number().positive("Kategori produk wajib dipilih"),
  price: z.string().trim().min(1, "Harga wajib diisi"),
  typeDay: z.string().min(1, "Tipe hari wajib dipilih"),
  is_ticket: z.boolean({
    required_error: "Status tiket wajib dipilih",
    invalid_type_error: "Status tiket wajib dipilih",
  }),
  department_owners: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
      }),
    )
    .min(1, "Departemen terkait wajib dipilih"),
});

export type CreateProdukFormValues = z.infer<typeof createProdukFormSchema>;
