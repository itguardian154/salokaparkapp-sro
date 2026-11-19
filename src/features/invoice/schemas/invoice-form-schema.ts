import { z } from "zod";

export const invoiceFormSchema = z
  .object({
    salesPersonId: z.string(),
    tipeOrder: z.string(),
    invoiceSegment: z.string(),
    isTravelOrder: z.boolean(),
    isTravelSegment: z.boolean(),
    isCorporateSegment: z.boolean(),
    isEducationSegment: z.boolean(),
    isEducationNonFormal: z.boolean(),
    travelAgent: z.string(),
    provinceId: z.number().nullable(),
    cityId: z.number().nullable(),
    provinceName: z.string().optional(),
    cityName: z.string().optional(),
    arrivalDate: z.date().optional(),
    customerId: z.number().nullable(),
    customerGroupName: z.string(),
    customerProvinceId: z.number().nullable(),
    customerCityId: z.number().nullable(),
    customerName: z.string(),
    customerContact: z.string(),
    customerBusinessFieldId: z.string(),
    customerBusinessTypeId: z.string(),
    customerGroupTypeId: z.string(),
    customerEducationLevelId: z.string(),
    customerGroupStatusId: z.string(),
    customerGroupNumber: z.string(),
    orderItemsCount: z.number(),
  })
  .superRefine((data, context) => {
    const required = (field: keyof typeof data, message: string) => {
      context.addIssue({ code: "custom", path: [field], message });
    };

    if (!data.salesPersonId.trim())
      required("salesPersonId", "Sales wajib dipilih");
    if (!data.tipeOrder) required("tipeOrder", "Tipe order wajib dipilih");
    if (!data.isTravelOrder && !data.invoiceSegment) {
      required("invoiceSegment", "Segmen wajib dipilih");
    }
    if (!data.arrivalDate)
      required("arrivalDate", "Tanggal kedatangan wajib diisi");
    if (!data.customerName.trim())
      required("customerName", "Nama pelanggan wajib diisi");
    if (!data.customerContact.trim())
      required("customerContact", "Kontak pelanggan wajib diisi");

    if (data.isTravelOrder) {
      if (!data.travelAgent.trim())
        required("travelAgent", "Nama travel/agent wajib dipilih");
      if (data.provinceId === null && !data.provinceName?.trim())
        required("provinceId", "Provinsi travel wajib dipilih");
      if (data.cityId === null && !data.cityName?.trim())
        required("cityId", "Kota travel wajib dipilih");
    }

    if (data.isTravelSegment) {
      if (data.customerId === null)
        required("customerGroupName", "Pelanggan travel wajib dipilih");
    } else {
      if (!data.customerGroupName.trim())
        required("customerGroupName", "Nama customer/group wajib diisi");
      if (data.customerId === null) {
        if (data.customerProvinceId === null)
          required("customerProvinceId", "Provinsi customer wajib dipilih");
        if (data.customerCityId === null)
          required("customerCityId", "Kota customer wajib dipilih");
      }
    }

    if (data.isCorporateSegment) {
      if (!data.customerBusinessFieldId)
        required("customerBusinessFieldId", "Bidang usaha wajib dipilih");
      if (!data.customerBusinessTypeId)
        required("customerBusinessTypeId", "Jenis usaha wajib dipilih");
    }

    if (data.isEducationSegment) {
      if (!data.customerGroupTypeId)
        required("customerGroupTypeId", "Jenis wajib dipilih");
      if (!data.customerEducationLevelId)
        required("customerEducationLevelId", "Jenjang wajib dipilih");
      if (!data.isEducationNonFormal) {
        if (!data.customerGroupStatusId)
          required("customerGroupStatusId", "Status wajib dipilih");
      }
    }

    if (data.orderItemsCount < 1)
      required(
        "orderItemsCount",
        "Minimal satu detail pesanan wajib ditambahkan",
      );
  });

export type InvoiceFormValidationField = keyof z.infer<
  typeof invoiceFormSchema
>;

export const invoicePaymentFormSchema = z.object({
  paymentDate: z.date({ required_error: "Tanggal bayar wajib diisi" }),
  paymentMethod: z.string().trim().min(1, "Metode bayar wajib dipilih"),
  amount: z
    .string()
    .refine(
      (amount) => Number(amount) > 0,
      "Jumlah pembayaran wajib lebih dari 0",
    ),
});
