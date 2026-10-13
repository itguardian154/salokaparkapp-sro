export type ProdukStatus = string;

export type CreateProdukPayload = {
  name: string;
  description: string;
  price: number;
  department_owners: { department_id: string; department_name: string }[];
  day_type: string;
  min_qty: number;
  is_ticket: boolean;
  is_active: boolean;
};

export type UpdateProdukPayload = {
  name: string;
  description: string;
  price: number;
  department_owners: { department_id: string; department_name: string }[];
  day_type: string;
  is_ticket: boolean;
  is_active: boolean;
};

export type ProdukRecord = {
  id: number;
  name: string;
  reference?: string | null;
  reference_file?: ProdukReferenceFile | string | null;
  department_owner?: ProdukDepartmentOwner[] | null;
  departemen?: string | null;
  description: string | null;
  day_type: string;
  min_qty?: number;
  segment_id?: number;
  max_qty?: number;
  bonus_buy_qty?: number;
  bonus_get_qty?: number;
  has_bonus?: boolean;
  price: string;
  is_ticket: boolean;
  status: ProdukStatus;
  status_label: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProdukReferenceFile = {
  name: string;
  mime_type: string;
  url: string;
};

export type ProdukDepartmentOwner = {
  id: number;
  department_id: string;
  department_name: string;
  created_at?: string;
  updated_at?: string;
};

export type ProdukActivity = {
  id: number;
  description: string;
  log_name: string;
  subject: { id: number; type: string } | null;
  user: { id: number; name: string; email: string } | null;
  changes: {
    before: unknown[] | Record<string, unknown>;
    after: Record<string, unknown>;
  };
  created_at: string;
  created_at_human: string;
};

export type ProdukDetail = ProdukRecord & {
  activities: ProdukActivity[];
  approvals: unknown[];
};

export type ProdukDetailResponse = {
  data: ProdukDetail;
};

export type ProdukPaginationLink = {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
};

export type ProdukListResponse = {
  data: ProdukRecord[];
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
    links: ProdukPaginationLink[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
};

export type ProdukFilter = {
  departemen: string;
  status: string;
  is_active: string;
};

export type ProdukFilters = {
  filter: ProdukFilter;
};

export type ProdukQueryParams = {
  page: number;
  search: string;
  per_page: number;
  "filter[departemen]"?: string;
  "filter[is_active]"?: string;
  "filter[status]"?: string;
};
