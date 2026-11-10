export type InvoiceStatus = string;

export type InvoiceRecord = {
  id: number;
  invoice_id: string;
  sales: string;
  segment_name: string;
  customer_name: string;
  kedatangan: string;
  ticket: number;
  revenue: number;
  status: InvoiceStatus;
  status_value: string;
};

// API shapes used by the invoice list endpoint.
export type InvoiceApiItem = {
  quantity: string | number;
};

export type InvoiceApiRecord = {
  id: number;
  invoice_number: string;
  customer_name: string | null;
  sales_person_name: string | null;
  segment_name: string | null;
  partner_name: string | null;
  arrival_date: string | null;
  total_amount: string | number;
  status: string;
  status_label: string;
  items?: InvoiceApiItem[];
};

export type InvoicePaginationMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type InvoiceListResponse = {
  data: InvoiceApiRecord[];
  meta: InvoicePaginationMeta;
};

export type InvoiceListParams = {
  page: number;
  per_page: number;
  "filter[search]"?: string;
  "filter[status]"?: string;
};

export type InvoiceDetailItem = {
  id: number;
  product_id: number | null;
  product_name: string;
  product_description: string | null;
  quantity: string | number;
  bonus_quantity: string | number;
  unit_price: string | number;
  discount_amount: string | number;
  subtotal: string | number;
};

export type InvoicePayment = {
  payment_date?: string | null;
  payment_type?: string | null;
  payment_method?: string | null;
  account_holder_name?: string | null;
  from_bank?: string | null;
  to_bank?: string | null;
  amount?: string | number | null;
  notes?: string | null;
  proof_of_payment: string | null;
};

export type InvoicePaymentForm = {
  paymentDate: Date | undefined;
  paymentType: string;
  paymentMethod: string;
  accountHolderName: string;
  depositNumber: string;
  fromBank: string;
  toBank: string;
  amount: string;
  notes: string;
  proofFiles: File[];
};

export type InvoiceDetail = {
  id: number;
  invoice_number: string | null;
  customer_id: number | null;
  customer_name: string | null;
  customer_address: string | null;
  sales_person_id: string | null;
  sales_person_name: string | null;
  partner_id: number | null;
  partner_name: string | null;
  segment_id: number | null;
  segment_detail_id: number | null;
  sub_segment_detail_id: number | null;
  invoice_date: string | null;
  arrival_date: string | null;
  due_date: string | null;
  status?: string | null;
  notes: string | null;
  total_amount: string | number;
  payments?: InvoicePayment[];
  items?: InvoiceDetailItem[];
};

export type InvoiceDetailResponse = { data: InvoiceDetail };
