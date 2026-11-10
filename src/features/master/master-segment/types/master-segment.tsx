
export type SegmentSubDetail = {
  id: number;
  detail_id?: number;
  name: string | null;
  is_active: boolean | null;
  created_at?: string;
  updated_at?: string;
};

export type SegmentDetail = {
  id: number;
  segment_id: number;
  name: string | null;
  is_active: boolean;
  sub_details: SegmentSubDetail[];
  created_at?: string;
  updated_at?: string;
};

export type Segment = {
  id: number;
  name: string;
  is_active: boolean;
  details: SegmentDetail[];
  created_at: string;
  updated_at: string;
};

export type CreateSegmentPayload = {
  name: string;
  is_active: boolean;
  details: {
    name: string | null;
    is_active: boolean;
    sub_details: {
      name: string | null;
      is_active: boolean | null;
    }[];
  }[];
};

export type UpdateSegmentPayload = CreateSegmentPayload;

export type PaginatedResponse<T> = {
  data: T[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
};

export type SegmentActivity = {
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

export type SegmentDetailRecord = Segment & {
  activities: SegmentActivity[];
};

export type SegmentDetailResponse = {
  data: SegmentDetailRecord;
};

export type SegmentPaginationLink = {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
};

export type SegmentListResponse = {
  data: Segment[];
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
    links: SegmentPaginationLink[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
};

export type SegmentFilter = {
  is_active: string;
};

export type SegmentFilters = {
  filter: SegmentFilter;
};

export type SegmentQueryParams = {
  page: number;
  per_page: number;
  "filter[search]"?: string;
  "filter[is_active]"?: string;
};
