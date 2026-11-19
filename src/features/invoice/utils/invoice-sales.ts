import type { Karyawan } from "@/features/karyawan/types/karyawan";

export const isEligibleInvoiceSales = (employee: Karyawan) =>
  employee.id_departemen === "DP008" ||
  (employee.id_departemen === "DP009" && employee.id_departemen_sub === "DS019");
