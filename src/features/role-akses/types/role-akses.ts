
export type RoleAksesStatus = string;

export type SearchableOptions<T> = {
  items: T[];
  search: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
  error: string | null;
};

export type RoleAksesPermission = {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
};

export type CreateRoleAksesPayload = {
  name: string;
  guard_name: string;
  permissions: number[];
};

export type UpdateRoleAksesPayload = {
  name: string;
  guard_name: string;
  permissions: number[];
};

export type RoleAksesRecord = {
  id: number;
  name: string;
  guard_name: string;
  permissions: RoleAksesPermission[];
  created_at: string;
  updated_at: string;
};

export type RoleAksesActivity = {
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

export type RoleAksesPermissionListResponse = {
  data: RoleAksesPermission[];
};

export type RoleAksesDetail = RoleAksesRecord & {
  activities: RoleAksesActivity[];
};

export type RoleAksesDetailResponse = {
  data: RoleAksesDetail;
};

export type RoleAksesPaginationLink = {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
};

export type RoleAksesListResponse = {
  data: RoleAksesRecord[];
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
    links: RoleAksesPaginationLink[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
};

export type RoleAksesFilter = {
  status: string;
  is_active: string;
};

export type RoleAksesFilters = {
  filter: RoleAksesFilter;
};

export type RoleAksesQueryParams = {
  page: number;
  per_page: number;
  "filter[search]"?: string;
};
