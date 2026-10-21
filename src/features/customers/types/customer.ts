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
  address: string;
  phone: string;
  contact_person: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CustomerFilter = {
  segment_id: number;
  segment_detail_id: number;
  status: string;
  is_active: string;
  province_id: number;
  city_id: number;
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
