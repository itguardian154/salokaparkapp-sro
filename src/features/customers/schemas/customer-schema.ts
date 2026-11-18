import { z } from "zod";

export const createCustomerFormSchema = z
  .object({
    name: z.string().trim().min(1, "Nama customer wajib diisi"),
    email: z.string().trim().email("Format email customer tidak valid"),

    contact_person: z.string().trim().min(1, "Nama PIC wajib diisi"),

    phone: z.string().trim().min(1, "Nomor WhatsApp wajib diisi"),

    segment_id: z.string().min(1, "Segment wajib dipilih"),

    segment_detail_id: z.string().optional(),

    sub_segment_detail_id: z.string().optional(),
    segment_option_id: z.string().optional(),
    group_number: z.string().optional(),
    segment_type: z.enum(["education", "corporate", "individual", "other"]),
    is_non_formal: z.boolean(),

    province_id: z.string().min(1, "Provinsi wajib dipilih"),
    city_id: z.string().min(1, "Kota wajib dipilih"),
  })
  .superRefine((data, context) => {
    if (
      (data.segment_type === "education" ||
        data.segment_type === "corporate") &&
      !data.sub_segment_detail_id
    ) {
      context.addIssue({
        code: "custom",
        path: ["sub_segment_detail_id"],
        message:
          data.segment_type === "education"
            ? "Jenjang wajib dipilih"
            : "Jenis usaha wajib dipilih",
      });
    }
    if (
      (data.segment_type === "education" ||
        data.segment_type === "corporate") &&
      !data.segment_detail_id
    ) {
      context.addIssue({
        code: "custom",
        path: ["segment_detail_id"],
        message:
          data.segment_type === "education"
            ? "Jenis wajib dipilih"
            : "Bidang usaha wajib dipilih",
      });
    }

    if (
      data.segment_type === "education" &&
      !data.is_non_formal &&
      !data.segment_option_id
    ) {
      context.addIssue({
        code: "custom",
        path: ["segment_option_id"],
        message: "Status wajib dipilih",
      });
    }

    if (
      data.segment_type === "education" &&
      !data.is_non_formal &&
      !data.group_number
    ) {
      context.addIssue({
        code: "custom",
        path: ["group_number"],
        message: "Nomor wajib dipilih",
      });
    }
  });

export type CreateCustomerFormValues = z.infer<typeof createCustomerFormSchema>;

export const UpdateCustomerFormSchema = z
  .object({
    name: z.string().trim().min(1, "Nama customer wajib diisi"),
    email: z.string().trim().email("Format email customer tidak valid"),
    contact_person: z.string().trim().min(1, "Nama PIC wajib diisi"),
    phone: z.string().trim().min(1, "Nomor WhatsApp wajib diisi"),
    segment_id: z.string().min(1, "Segment wajib dipilih"),
    segment_detail_id: z.string().optional(),
    sub_segment_detail_id: z.string().optional(),
    segment_option_id: z.string().optional(),
    group_number: z.string().optional(),
    segment_type: z.enum(["education", "corporate", "individual", "other"]),
    is_non_formal: z.boolean(),
    province_id: z.string().min(1, "Provinsi wajib dipilih"),
    city_id: z.string().min(1, "Kota wajib dipilih"),
  })
  .superRefine((data, context) => {
    if (
      (data.segment_type === "education" ||
        data.segment_type === "corporate") &&
      !data.segment_detail_id
    ) {
      context.addIssue({
        code: "custom",
        path: ["segment_detail_id"],
        message:
          data.segment_type === "education"
            ? "Jenis wajib dipilih"
            : "Bidang usaha wajib dipilih",
      });
    }

    if (
      (data.segment_type === "education" ||
        data.segment_type === "corporate") &&
      !data.sub_segment_detail_id
    ) {
      context.addIssue({
        code: "custom",
        path: ["sub_segment_detail_id"],
        message:
          data.segment_type === "education"
            ? "Jenjang wajib dipilih"
            : "Jenis usaha wajib dipilih",
      });
    }

    if (
      data.segment_type === "education" &&
      !data.is_non_formal &&
      !data.segment_option_id
    ) {
      context.addIssue({
        code: "custom",
        path: ["segment_option_id"],
        message: "Status wajib dipilih",
      });
    }

    if (
      data.segment_type === "education" &&
      !data.is_non_formal &&
      !data.group_number
    ) {
      context.addIssue({
        code: "custom",
        path: ["group_number"],
        message: "Nomor wajib dipilih",
      });
    }
  });

export type UpdateCustomerFormValues = z.infer<typeof UpdateCustomerFormSchema>;
