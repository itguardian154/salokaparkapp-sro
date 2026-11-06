export type InvoiceOrder = {
  id: number;
  productId: number;
  product: string;
  description: string;
  quantity: number;
  compliment: number | null;
  unitPrice: number;
  discountPrice: number;
  subtotal: number;
};
