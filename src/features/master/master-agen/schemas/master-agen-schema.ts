
import { z } from "zod";

const branchSchema = z.object({
  name: z.string().trim().min(1, "Nama cabang wajib diisi"),

  province_name: z
    .string()
    .trim()
    .min(1, "Provinsi wajib dipilih"),

  city_name: z
    .string()
    .trim()
    .min(1, "Kota wajib dipilih"),

  contact_person: z
    .string()
    .trim()
    .min(1, "Contact person wajib diisi"),

  phone: z.string().trim().min(1, "Nomor telepon wajib diisi"),

  address: z.string().trim().optional().default(""),

  code: z.string().optional().default(""),

  is_active: z.boolean().default(true),
});

export const createMasterAgentSchema = z.object({
  code: z.string().trim().optional().default(""),

  name: z.string().trim().min(1, "Nama agen wajib diisi"),

  association_name: z
    .string()
    .trim()
    .min(1, "Asosiasi wajib diisi"),

  type: z.string().optional().default(""),

  company_name: z.string().trim().optional().default(""),

  contact_person: z
    .string()
    .trim()
    .min(1, "Contact person wajib diisi"),

  phone: z.string().trim().min(1, "Nomor telepon wajib diisi"),

  address: z.string().trim().optional().default(""),

  province_name: z
    .string()
    .trim()
    .min(1, "Provinsi wajib dipilih"),

  city_name: z
    .string()
    .trim()
    .min(1, "Kota wajib dipilih"),

  branches: z.array(branchSchema).optional().default([]),

  website: z
    .string()
    .url("Format website tidak valid")
    .or(z.literal(""))
    .optional()
    .default(""),

  logo: z
    .string()
    .url("Format URL logo tidak valid")
    .or(z.literal(""))
    .optional()
    .default(""),

  is_active: z.boolean().default(true),
});

export type CreateMasterAgentFormValues = z.infer<
  typeof createMasterAgentSchema
>;
