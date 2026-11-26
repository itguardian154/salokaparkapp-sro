
export interface Ticket {
  id: number;
  sales_order_id: number;
  sales_order_detail_id: number;
  product_id: number;
  product_name: string;
  is_bonus: boolean;
  barcode: string;
  date: string | null;
  date_plan: string | null;
  status: string;
  is_printed: boolean;
  printed_at: string | null;
  date_used: string | null;
  created_at: string | null;
}

export interface CreateTicketsResponse {
  message: string;
  data: {
    sales_order_id: number;
  };
}

export interface PrintCandidatesResponse {
  data: {
    sales_order_id: number;
    requested_count: number;
    available_count: string;
    tickets: Ticket[];
  };
}

export interface MarkTicketsPrintedResponse {
  message: string;
  data: {
    sales_order_id: number;
  };
}

export interface TicketQuantityPayload {
  quantity: number;
}

export interface MarkTicketsPrintedPayload {
  ticket_ids: number[];
}
