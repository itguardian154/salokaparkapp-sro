
export type ReservasiStatus = string;

// ==============================
// RESERVASI LIST
// ==============================

export type ReservasiRecord = {
    id: number;
    invoice_id: number;
    invoice_number: string;
    sales_order_number: string;
    booking_type: string;

    customer_id: number;
    customer_name: string | null;
    customer_address: string | null;
    customer_city: string | null;
    customer_province: string | null;
    customer_phone: string | null;
    customer_contact_person: string | null;

    sales_person_id: string | number;
    sales_person_name: string | null;

    partner_id: number | null;
    partner_name: string | null;
    partner_association_name: string | null;
    partner_city: string | null;
    partner_province: string | null;
    partner_phone: string | null;
    partner_contact_person: string | null;

    partner_branch_id: number | null;
    partner_branch_name: string | null;
    partner_branch_city: string | null;
    partner_branch_province: string | null;
    partner_branch_phone: string | null;
    partner_branch_contact_person: string | null;

    segment_id: number;
    segment_name: string | null;
    segment_detail_id: number | null;
    segment_detail_name: string | null;
    sub_segment_detail_id: number | null;
    sub_segment_detail_name: string | null;
    segment_option_id: number | null;
    segment_option_name: string | null;

    sales_order_date: string | null;
    arrival_date: string | null;
    access_tour_leader: number | null;
    arrival_type: string | null;
    arrival_time: string | null;

    subtotal: number;
    discount_amount: number;
    total_amount: number;
    paid_amount: number;

    payment_status: string;

    ticket_created_count: number;
    total_ticket_count: number;
    ticket_printed_count: number;
    ticket_used_count: number;

    status: ReservasiStatus;
    status_label: string;
    notes: string | null;

    created_by: number;
    created_by_name: string | null;
};

// ==============================
// RESERVASI DETAIL
// ==============================

export type ReservasiDetail = ReservasiRecord & {
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

    product_id?: number | null;
    quantity?: string | number | null;
    unit_price?: string | number | null;
    total_price?: string | number | null;

    status: string;
    status_label: string;
};

// ==============================
// SHOPPING VOUCHER
// ==============================

export type ShoppingVoucher = {
    name: string;
    quantity: string;
    pecahan: string;
};

// ==============================
// CREATE EVENT ORDER
// ==============================

export type CreateReservasiEventOrder = {
    department_id: string;
    department_name: string;
    sub_department_id: string | null;
    sub_department_name: string | null;

    description: string | null;

    location_id: number | null;
    location_detail: string | null;

    product_id: number | null;
    product_code: string | null;
    product_description: string | null;

    quantity: number | string | null;
    unit_price: number | string | null;
    total_price: number | string | null;

    shopping_voucher: ShoppingVoucher[];
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
};

// ==============================
// EDIT EVENT ORDER
// ==============================

export type EditReservasiEventOrder = {
    department_id: string;
    department_name: string;
    sub_department_id: string | null;
    sub_department_name: string | null;

    description: string | null;

    location_id: number | null;
    location_detail: string | null;

    product_id: number | null;
    product_code: string | null;
    product_description: string | null;

    quantity: number | string | null;
    unit_price: number | string | null;
    total_price: number | string | null;

    shopping_voucher: ShoppingVoucher[];
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
};

// ==============================
// RESERVASI ITEM
// ==============================

export type ReservasiItem = {
    id: number;
    invoice_item_id: number;
    product_id: number;
    product_code: string | null;
    product_name: string;
    product_description: string | null;
    product_type?: string | null;

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
    is_ticket?: boolean | null;
};

// ==============================
// RESERVASI DETAIL EVENT ORDER
// ==============================

export type ReservasiDetailEO = {
    id: number;
    sales_order_id: number;

    department_id: string;
    department_name: string;

    sub_department_id: number | string | null;
    sub_department_name: string | null;

    description: string | null;

    location_id: number | null;
    location_detail: string | null;

    product_id: number | null;
    product_code: string | null;
    product_description: string | null;

    quantity: number | null;
    unit_price: number | null;
    total_price: number | null;

    shopping_voucher: ShoppingVoucher[];

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

    properties?: unknown[];

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

// ==============================
// RESERVASI LIST PARAMS
// ==============================

export type ReservasiListParams = {
    page: number;
    per_page: number;
    "filter[search]"?: string;
    "filter[status]"?: string;
};

// ==============================
// RESERVASI DETAIL RESPONSE
// ==============================

export type ReservasiDetailResponse = {
    data: ReservasiDetail;
};

// ==============================
// API SHAPES - RESERVASI
// ==============================

export type ReservasiApiRecord = {
    id: number;
    invoice_id: number;
    invoice_number: string;
    sales_order_number: string;
    booking_type: string;

    customer_id: number;
    customer_name: string | null;
    customer_address: string | null;

    sales_person_id: string | number;
    sales_person_name: string | null;

    partner_id: number | null;
    partner_name: string | null;
    partner_branch_id: number | null;
    partner_branch_name: string | null;

    segment_id: number;
    segment_name: string | null;
    segment_detail_id: number | null;
    segment_detail_name: string | null;
    sub_segment_detail_id: number | null;
    sub_segment_detail_name: string | null;
    segment_option_id: number | null;
    segment_option_name: string | null;

    sales_order_date: string | null;
    arrival_date: string | null;
    access_tour_leader: number | null;
    arrival_type: string | null;
    arrival_time: string | null;

    subtotal: string | number;
    discount_amount: string | number;
    total_amount: string | number;
    paid_amount: string | number;

    payment_status: string;

    ticket_created_count: number;
    total_ticket_count: number;
    ticket_printed_count: number;
    ticket_used_count: number;

    status: string;
    status_label: string;

    notes: string | null;

    created_by: number;
    created_by_name: string | null;
};

// ==============================
// RESERVASI PAGINATION META
// ==============================

export type ReservasiPaginationMeta = {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
};

export type ReservasiListResponse = {
    data: ReservasiApiRecord[];
    meta: ReservasiPaginationMeta;
};

// ==============================
// RESERVASI TABLE
// ==============================

export type ReservasiTableRecord = {
    id: number;
    sales_order_number: string;
    sales: string;
    segment_name: string;
    customer_name: string;
    partner_name: string;
    kedatangan: string;
    ticket: number;
    revenue: number;
    status: string;
    status_value: string;
};
