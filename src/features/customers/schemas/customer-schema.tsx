import { z } from "zod";

export const createCustomerFormSchema = z.object({
    name: z.string().trim().min(1, "Nama customer wajib diisi"),
    email: z.string().trim().email("Format email customer tidak valid"),
    npwp: z.string().trim().min(1, "NPWP wajib diisi"),
    contact_email: z.string().trim().email("Format email PIC tidak valid"),
    contact_phone: z.string().trim().min(1, "Nomor telepon PIC wajib diisi"),

    contact_person: z
        .string()
        .trim()
        .min(1, "Nama PIC wajib diisi"),

    phone: z
        .string()
        .trim()
        .min(1, "Nomor WhatsApp wajib diisi"),

    segment_id: z.string().min(1, "Segment wajib dipilih"),

    segment_detail_id: z
        .string()
        .min(1, "Segment detail wajib dipilih"),

    province_id: z.string().min(1, "Provinsi wajib dipilih"),
    city_id: z.string().min(1, "Kota wajib dipilih"),

});

export type CreateCustomerFormValues = z.infer<
    typeof createCustomerFormSchema
>;