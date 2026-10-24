export type KategoriProdukRecord = {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type KategoriProdukDetail = KategoriProdukRecord;
export type KategoriProdukDetailResponse = {
  data: KategoriProdukDetail;
};

export type KatgoriProdukPaginationLink = {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
};

export type KategoriProdukListResponse = {
  data: KategoriProdukRecord[];
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
    links: KatgoriProdukPaginationLink[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
};

export type KategoriProdukFilter = {
  name: string;
  is_active: string;
};

export type KategoriProdukFilters = {
  filter: KategoriProdukFilter;
};

export type KategoriProdukQueryParams = {
  page: number;
  per_page: number;
  "filter[search]"?: string;
  "filter[name]"?: string;
  "filter[is_active]"?: string;
};


export type CreateKategoriProdukPayload = {
  name: string;
  is_active: boolean;
};


export type UpdateKategoriProdukPayload = {
  name: string;
  is_active: boolean;
};