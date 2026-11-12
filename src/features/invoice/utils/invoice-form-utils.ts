import type { InvoiceOrder } from "../types/invoice-order";
import type { Karyawan } from "@/features/karyawan/types/karyawan";

export type InvoiceFormData = {
  orderItems: InvoiceOrder[];
  provinceId: number | null;
  cityId: number | null;
  selectedKaryawan: Karyawan | null;
  partnerId: number | null;
  partnerBranchId: string | null;
  customerSegment: string;
  tipeOrder: string;
  invoiceSegment: string;
  invoiceSegmentName: string;
  travelAgent: string;
  businessField: string;
  businessType: string;
  jenisGroup: string;
  jenjang: string;
  statusGroup: string;
  nomorGroup: string;
  customGroupTag: string;
  groupTagOrder: string[];
  groupName: string;
  customerId: number | null;
  groupProvinceId: number | null;
  groupCityId: number | null;
  arrivalDate: Date | undefined;
  customerName: string;
  customerContact: string;
  customerEmail: string;
  customerContactPerson: string;
  customerProvinceName: string;
  customerCityName: string;
  bookingType: string;
};

export const createInitialInvoiceFormData = (): InvoiceFormData => ({
  orderItems: [],
  provinceId: null,
  cityId: null,
  selectedKaryawan: null,
  partnerId: null,
  partnerBranchId: null,
  tipeOrder: "",
  customerSegment: "",
  invoiceSegment: "",
  invoiceSegmentName: "",
  travelAgent: "",
  businessField: "",
  businessType: "",
  jenisGroup: "",
  jenjang: "",
  statusGroup: "",
  nomorGroup: "",
  customGroupTag: "",
  groupTagOrder: [],
  groupName: "",
  customerId: null,
  groupProvinceId: null,
  groupCityId: null,
  arrivalDate: undefined,
  customerName: "",
  customerContact: "",
  customerEmail: "",
  customerContactPerson: "",
  customerProvinceName: "",
  customerCityName: "",
  bookingType: "",
});

export const toDate = (value: string | null | undefined) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};
