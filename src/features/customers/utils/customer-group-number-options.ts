export type CustomerGroupNumberOption = {
  value: string;
  label: string;
};

export const customerGroupNumberOptions: CustomerGroupNumberOption[] = Array.from(
  { length: 999 },
  (_, index) => {
    const value = String(index + 1);
    return { value, label: value };
  },
);
