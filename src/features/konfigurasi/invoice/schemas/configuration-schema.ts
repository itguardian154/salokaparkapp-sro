import {
  INVOICE_CONFIGURATION_KEYS,
  type InvoiceConfigurationKey,
  type InvoiceConfigurationValues,
} from "../types/configuration";

export function validateInvoiceConfigurationValues(
  values: InvoiceConfigurationValues,
): Partial<Record<InvoiceConfigurationKey, string>> {
  const errors: Partial<Record<InvoiceConfigurationKey, string>> = {};

  // 1. Informasi Pembayaran Tagihan
  const billingInformation =
    values[INVOICE_CONFIGURATION_KEYS.billingInformation];

  if (!billingInformation?.trim()) {
    errors[INVOICE_CONFIGURATION_KEYS.billingInformation] =
      "Informasi Pembayaran Tagihan wajib diisi.";
  }

  // 2. Informasi Ketentuan Pembayaran
  const paymentTerms =
    values[INVOICE_CONFIGURATION_KEYS.paymentTerms];

  if (!paymentTerms?.trim()) {
    errors[INVOICE_CONFIGURATION_KEYS.paymentTerms] =
      "Informasi Ketentuan Pembayaran wajib diisi.";
  }

  // 3. Informasi Bukti Transfer Dikirimkan ke
  const paymentProofRecipient =
    values[INVOICE_CONFIGURATION_KEYS.paymentProofRecipient];

  if (!paymentProofRecipient?.trim()) {
    errors[INVOICE_CONFIGURATION_KEYS.paymentProofRecipient] =
      "Informasi Bukti Transfer Dikirimkan ke wajib diisi.";
  }

  return errors;
}
