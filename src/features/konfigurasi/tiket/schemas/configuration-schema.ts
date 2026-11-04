import {
  TICKET_CONFIGURATION_KEYS,
  type TicketConfigurationKey,
  type TicketConfigurationValues,
} from "../types/configuration";

const isPositiveInteger = (value: string) =>
  /^\d+$/.test(value.trim()) && Number(value) > 0;

export function validateTicketConfigurationValues(
  values: TicketConfigurationValues,
): Partial<Record<TicketConfigurationKey, string>> {
  const errors: Record<string, string> = {};
  if (values[TICKET_CONFIGURATION_KEYS.billingInformation] !== undefined &&
      !values[TICKET_CONFIGURATION_KEYS.billingInformation]?.trim()) {
    errors[TICKET_CONFIGURATION_KEYS.billingInformation] = "Informasi pembayaran wajib diisi.";
  }

  const minimumQty = values[TICKET_CONFIGURATION_KEYS.minimumAddendumQty];
  if (minimumQty !== undefined && !isPositiveInteger(minimumQty)) {
    errors[TICKET_CONFIGURATION_KEYS.minimumAddendumQty] = "Penambahan qty minimum harus lebih dari 0.";
  }

  const bonusInterval = values[TICKET_CONFIGURATION_KEYS.bonusTicketInterval];
  if (bonusInterval !== undefined && !isPositiveInteger(bonusInterval)) {
    errors[TICKET_CONFIGURATION_KEYS.bonusTicketInterval] = "Interval bonus harus lebih dari 0.";
  }

  return errors;
}
