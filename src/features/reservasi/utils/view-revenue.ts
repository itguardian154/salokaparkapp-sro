export const isEligibleReservasi = (
  departmentId: string | null,
  subDepartmentId: string | null,
) =>
  departmentId === "DP008" ||
  departmentId === "DP013" ||
  departmentId === "DP011" ||
  (departmentId === "DP009" && subDepartmentId === "DS019");
