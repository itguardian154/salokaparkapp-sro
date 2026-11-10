export type LokasiPenyajianRecord = {
  id: number;
  name: string;
  quota: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type LokasiPenyajianDetail = LokasiPenyajianRecord;
export type LokasiPenyajianDetailResponse = {
  data: LokasiPenyajianDetail;
};

export type LokasiPenyajianPaginationLink = {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
};

export type LokasiPenyajianListResponse = {
  data: LokasiPenyajianRecord[];
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
    links: LokasiPenyajianPaginationLink[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
};

export type LokasiPenyajianFilter = {
  name: string;
  is_active: string;
};

export type LokasiPenyajianFilters = {
  filter: LokasiPenyajianFilter;
};

export type LokasiPenyajianQueryParams = {
  page: number;
  per_page: number;
  "filter[search]"?: string;
  "filter[name]"?: string;
  "filter[is_active]"?: string;
};


export type CreateLokasiPenyajianPayload = {
  name: string;
  quota: string;
  is_active: boolean;
};

export type UpdateLokasiPenyajianPayload = {
  name: string;
  quota: string;
  is_active: boolean;
};

