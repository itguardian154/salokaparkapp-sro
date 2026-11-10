export type CreateCustomerPayload = {
  name: string;
  province_name: string;
  city_name: string;
  email: string;
  phone: string;
  segment_id: number;
  segment_detail_id: number;
  contact_person: string;
};

export type UpdateCustomerPayload = {
  name: string;
  province_name: string;
  city_name: string;
  email: string;
  phone: string;
  segment_id: number;
  segment_detail_id: number;
  contact_person: string;
  is_active: boolean;
};

export type CustomerSegment = {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CustomerRecord = {
  id: number;
  name: string;
  phone: string;
  email: string;
  province_name: string | null;
  city_name: string | null;
  segment: CustomerSegment | null;
  segment_detail: CustomerSegment | null;
  sub_segment_detail?: {
    id: number;
    segment_detail_id?: number;
    name: string;
  } | null;
  segment_option_id?: number | null;
  segment_option?: {
    id: number;
    sub_segment_detail_id?: number;
    name: string;
  } | null;
  is_active: boolean;
  segment_id: number;
  segment_detail_id: number;
  contact_person: string;
  created_at: string;
  updated_at: string;
};

export type CustomerPaginationLink = {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
};

export type CustomerListResponse = {
  data: CustomerRecord[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    links: CustomerPaginationLink[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
};

export type CustomerActivity = {
  id: number;
  description: string;
  log_name: string;
  event?: string | null;
  action_label?: string | null;
  subject: {
    id: number;
    type: string;
  } | null;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  changes: {
    before: unknown[] | Record<string, unknown>;
    after: Record<string, unknown>;
    items?: {
      key: string;
      label: string;
      before: unknown;
      after: unknown;
    }[];
  };
  created_at: string;
  created_at_human: string;
};

export type CustomerDetail = CustomerRecord & {
  activities: CustomerActivity[];
};

export type CustomerDetailResponse = {
  data: CustomerDetail;
};

export type CustomerFilter = {
  segment_id: string;
  segment_detail_id: string;
  status: string;
  is_active: string;
  province_name: string;
  city_name: string;
};

export type CustomerFilters = {
  filter: CustomerFilter;
};

export type CustomerQueryParams = {
  page: number;
  per_page: number;
  "filter[search]"?: string;
  "filter[segment_id]"?: string;
  "filter[segment_detail_id]"?: string;
  "filter[is_active]"?: string;
  "filter[province_name]"?: string;
  "filter[city_name]"?: string;
};
