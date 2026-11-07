export const INVOICE_CONFIGURATION_KEYS = {
  billingInformation: "Bank Account",
  paymentTerms: "Payment Terms",
  paymentProofRecipient: "Payment Proof Recipient",
} as const;

export type InvoiceConfigurationKey =
  (typeof INVOICE_CONFIGURATION_KEYS)[keyof typeof INVOICE_CONFIGURATION_KEYS];

export type InvoiceConfiguration = {
  key: string;
  value: string;
  is_active: boolean;
};

export type InvoiceConfigurationValues = Partial<
  Record<InvoiceConfigurationKey, string>
>;

export type InvoiceConfigurationPayload = {
  key: InvoiceConfigurationKey;
  value: string;
};