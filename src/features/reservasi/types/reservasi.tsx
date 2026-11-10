export type ReservasiStatus = string;

// ==============================
// RESERVASI LIST
// ==============================

export type ReservasiRecord = {
    id: number;
    invoice_id: number;
    invoice_number: string;
    sales_order_number: string;
    customer_id: number;
    customer_name: string;
    customer_address: string;
    sales_person_id: number;
    sales_person_name: string;
    partner_id: number;
    partner_name: string;
    partner_branch_id: number | null;
    partner_branch_name: string | null;
    segment_id: number;
    segment_name: string;
    segment_detail_id: number;
    segment_detail_name: string;
    sub_segment_detail_id: number;
    sub_segment_detail_name: string;
    sales_order_date: string;
    arrival_date: string;
    access_tour_leader: number;
    arrival_type: string;
    arrival_time: string;
    subtotal: number;
    discount_amount: number;
    total_amount: number;
    ticket_created_count: number;
    ticket_printed_count: number;
    status: ReservasiStatus;
    status_label: string;
    notes: string | null;
    created_by: number;
    created_by_name: string;
};

// ==============================
// RESERVASI DETAIL
// ==============================

export type ReservasiDetail = ReservasiRecord & {
    paid_amount: number;
    ticket_used_count: number;

    items: ReservasiItem[];
    event_orders: ReservasiDetailEO[];
    activities: ReservasiActivity[];
    approvals: ReservasiApproval[];

    sales_person: ReservasiSalesPerson;

    created_at: string;
    updated_at: string;
};

// ==============================
// CREATE RESERVASI
// ==============================

export type CreateReservasi = {
    invoice_id: number;
    event_orders: CreateReservasiEventOrder[];
    access_tour_leader: number;
    arrival_type: string;
    arrival_time: string;
};

// ==============================
// GENERATE EVENT ORDER
// ==============================

export type GenerateReservasiEventOrderResponse = {
    invoice_id: number;
    invoice_number: string;
    event_orders: GenerateReservasiEventOrder[];
};

export type GenerateReservasiEventOrder = {
    department_id: string;
    department_name: string;
    description: string;

    meal_voucher?: number | null;
    voucher_tour_leader?: number | null;
    shopping_voucher?: number | null;

    product_id?: number;
    quantity?: string;
    unit_price?: string;
    total_price?: string;

    status: string;
    status_label: string;
};

// ==============================
// CREATE EVENT ORDER
// ==============================

export type CreateReservasiEventOrder = {
    department_id: string;
    department_name: string;
    description: string;

    meal_voucher?: number | null;
    voucher_tour_leader?: number | null;
    shopping_voucher?: number | null;

    product_id?: number;
    quantity?: string;
    unit_price?: string;
    total_price?: string;

    status: string;
    status_label: string;
};

// ==============================
// RESERVASI ITEM
// ==============================

export type ReservasiItem = {
    id: number;
    invoice_item_id: number;
    product_id: number;
    product_name: string;
    product_description: string;
    product_type: string | null;
    quantity: number;
    bonus_quantity: number;
    unit_price: number;
    is_price_override: boolean;
    discount_amount: number;
    subtotal: number;
    total_amount: number;
    notes: string | null;
    status: string;
    status_label: string;
};

// ==============================
// RESERVASI DETAIL EVENT ORDER
// ==============================

export type ReservasiDetailEO = {
    id: number;
    sales_order_id: number;
    department_id: string;
    department_name: string;
    sub_department_id: string | null;
    sub_department_name: string | null;
    description: string;
    location_id: number | null;
    product_id: number | null;
    quantity: number | null;
    unit_price: number | null;
    total_price: number | null;
    shopping_voucher: number | null;
    voucher_tour_leader: number | null;
    meal_voucher: number | null;
    ticket_print_date: string | null;
    serving_time: string | null;
    serving_location: string | null;
    serving_type: string | null;
    start_at: string | null;
    end_at: string | null;
    status: string;
    status_label: string;
    received_by: number | null;
    received_at: string | null;
    created_by: number;
    created_at: string;
    updated_at: string;
};

// ==============================
// RESERVASI ACTIVITY
// ==============================

export type ReservasiActivity = {
    id: number;
    description: string;
    log_name: string;
    event: string;
    action_label: string;
    subject: {
        id: number;
        type: string;
    };
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
    changes: {
        before: Record<string, unknown>;
        after: Record<string, unknown>;
        items: ReservasiActivityChange[];
    };
    created_at: string;
    created_at_human: string;
};

export type ReservasiActivityChange = {
    key: string;
    label: string;
    before: unknown;
    after: unknown;
};

// ==============================
// RESERVASI APPROVAL
// ==============================

export type ReservasiApproval = {
    [key: string]: unknown;
};

// ==============================
// RESERVASI SALES PERSON
// ==============================

export type ReservasiSalesPerson = {
    id: number;
    employee_id: string;
    name: string;
    email: string;
    whatsapp_number: string | null;
    position: string | null;
};