export type CreateCustomerPayload = {
  name: string;
  province_id: number;
  city_id: number;
  code: string;
  email: string;
  phone: string;
  npwp: string;
  contact_person: string;
  contact_phone: string | null;
  contact_email: string | null;
  address: string | null;
  is_active: boolean;
};

export type UpdateCustomerPayload = {
  name: string;
  province_id: number;
  city_id: number;
  code: string;
  email: string;
  phone: string;
  npwp: string;
  contact_person: string;
  contact_phone: string | null;
  contact_email: string | null;
  address: string | null;
  is_active: boolean;
};
export type CustomerRecord = {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  address: string | null;
  province_name: string | null;
  city_name: string | null;
  segment: string | null;
  segment_detail: string | null;
  is_active: boolean;
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
  "filter[province_id]"?: string;
  "filter[city_id]"?: string;
  "filter[status]"?: string;
};
