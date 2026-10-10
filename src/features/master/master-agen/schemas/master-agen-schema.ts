import { z } from "zod";

const branchSchema = z.object({
  name: z.string().trim().min(1, "Nama cabang wajib diisi"),
  province_id: z.number().int().positive("Provinsi wajib dipilih"),
  city_id: z.number().int().positive("Kota wajib dipilih"),
  code: z.string().trim().min(1, "Kode cabang wajib diisi"),
  contact_person: z.string().trim().min(1, "Contact person wajib diisi"),
  phone: z.string().trim().min(1, "Nomor telepon wajib diisi"),
  address: z.string().trim().min(1, "Alamat cabang wajib diisi"),
  is_active: z.boolean().default(true),
});

export const createMasterAgentSchema = z.object({
  code: z.string().trim().min(1, "Kode agen wajib diisi"),
  name: z.string().trim().min(1, "Nama agen wajib diisi"),
  association_name: z.string().trim().min(1, "Asosiasi wajib diisi"),
  type: z.string().min(1, "Tipe agen wajib dipilih"),
  company_name: z.string().trim().min(1, "Nama perusahaan wajib diisi"),
  contact_person: z.string().trim().min(1, "Contact person wajib diisi"),
  phone: z.string().trim().min(1, "Nomor telepon wajib diisi"),
  address: z.string().trim().min(1, "Alamat wajib diisi"),
  province_id: z.number().int().positive("Provinsi wajib dipilih"),
  city_id: z.number().int().positive("Kota wajib dipilih"),
  branches: z.array(branchSchema).min(1, "Minimal satu cabang"),
  website: z.string().url("Format website tidak valid").or(z.literal("")),
  logo: z.string().url("Format URL logo tidak valid").or(z.literal("")),
  is_active: z.boolean().default(true),
});

export type CreateMasterAgentFormValues = z.infer<
  typeof createMasterAgentSchema
>;