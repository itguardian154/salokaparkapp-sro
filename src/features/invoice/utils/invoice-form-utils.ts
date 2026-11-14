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
  customerBusinessFieldId: string;
  customerBusinessTypeId: string;
  customerGroupTypeId: string;
  customerEducationLevelId: string;
  customerGroupStatusId: string;
  customerGroupNumber: string;
  customCustomerGroupTag: string;
  customerGroupTagOrder: string[];
  customerGroupName: string;
  customerId: number | null;
  customerProvinceId: number | null;
  customerCityId: number | null;
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
  customerBusinessFieldId: "",
  customerBusinessTypeId: "",
  customerGroupTypeId: "",
  customerEducationLevelId: "",
  customerGroupStatusId: "",
  customerGroupNumber: "",
  customCustomerGroupTag: "",
  customerGroupTagOrder: [],
  customerGroupName: "",
  customerId: null,
  customerProvinceId: null,
  customerCityId: null,
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
