export type InvoiceSearchOption = {
  value: string;
  label: string;
};

export const STATIC_INVOICE_SEGMENT_IDS = {
  segmentId: 1,
  segmentDetailId: 1,
  subSegmentDetailId: 2,
} as const;

export const STATIC_INVOICE_PARTNER_ID = 1;

export const businessFieldOptions: InvoiceSearchOption[] = [
  { value: "manufaktur", label: "Manufaktur" },
  { value: "keuangan", label: "Keuangan" },
  { value: "kesehatan", label: "Kesehatan" },
  { value: "kedinasan", label: "Kedinasan" },
  { value: "horeka", label: "Horeka" },
  { value: "dagang", label: "Dagang" },
  { value: "komunitas", label: "Komunitas" },
  { value: "keluarga", label: "Keluarga" },
];

export const businessTypeOptions: InvoiceSearchOption[] = [
  { value: "manufaktur", label: "Manufaktur" },
  { value: "keuangan", label: "Keuangan" },
  { value: "kesehatan", label: "Kesehatan" },
  { value: "kedinasan", label: "Kedinasan" },
  { value: "horeka", label: "Horeka" },
  { value: "dagang", label: "Dagang" },
  { value: "komunitas", label: "Komunitas" },
  { value: "keluarga", label: "Keluarga" },
];

export const educationLevelOptions: InvoiceSearchOption[] = [
  { value: "sd", label: "SD" },
  { value: "smp", label: "SMP" },
  { value: "sma", label: "SMA" },
];

export const educationStatusOptions: InvoiceSearchOption[] = [
  { value: "negeri", label: "Negeri" },
  { value: "swasta", label: "Swasta" },
];

export const groupNumberOptions: InvoiceSearchOption[] = Array.from(
  { length: 999 },
  (_, index) => {
    const value = String(index + 1);
    return { value, label: value };
  },
);

export const filterInvoiceOptions = (
  options: InvoiceSearchOption[],
  search: string,
) =>
  options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase().trim()),
  );

export const buildEducationGroupName = (
  level: string,
  status: string,
  number: string,
) =>
  [
    educationLevelOptions.find((option) => option.value === level)?.label,
    educationStatusOptions.find((option) => option.value === status)?.label,
    groupNumberOptions.find((option) => option.value === number)?.label,
  ]
    .filter(Boolean)
    .join(" ");
