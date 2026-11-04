export const TICKET_CONFIGURATION_KEYS = {
  billingInformation: "Bank Account",
  minimumAddendumQty: "Minimum Addendum Qty",
  bonusTicketInterval: "Bonus Ticket Intervall",
} as const;

export type TicketConfigurationKey =
  (typeof TICKET_CONFIGURATION_KEYS)[keyof typeof TICKET_CONFIGURATION_KEYS];

export type TicketConfiguration = {
  key: string;
  value: string;
  is_active: boolean;
};

export type TicketConfigurationValues = Partial<
  Record<TicketConfigurationKey, string>
>;

export type TicketConfigurationPayload = {
  key: TicketConfigurationKey;
  value: string;
};
