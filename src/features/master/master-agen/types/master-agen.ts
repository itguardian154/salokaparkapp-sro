export type AgentProvince = {
  id: number;
  name: string;
};

export type AgentCity = {
  id: number;
  province_id: number;
  name: string;
};

export type AgentBranch = {
  id: number;
  partner_id: number;
  code: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  province: AgentProvince | null;
  city: AgentCity | null;
  province_name: string;
  city_name: string;
  created_at: string;
  updated_at: string;
};

export type AgentActivity = {
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

export type Agent = {
  id: number;
  code: string;
  name: string;
  association_name: string | null;
  type: string;
  contact_person: string | null;
  phone: string | null;
  address: string | null;
  province: string | AgentProvince | null;
  city: string | AgentCity | null;
  city_name: string;
  province_name: string;
  logo_url: string | null;
  website: string | null;
  is_active: boolean;
};

export type AgentDetail = {
  id: number;
  code?: string | null;
  name: string;
  association_name: string | null;
  type?: string | null;
  company_name?: string | null;
  contact_person: string | null;
  phone: string | null;
  address: string | null;
  province_id?: number | null;
  province_name?: string | null;
  province?: AgentProvince | null;
  city_id?: number | null;
  city_name?: string | null;
  city?: AgentCity | null;
  logo_url: string | null;
  website: string | null;
  is_active: boolean;
  branches?: AgentBranch[];
  activities?: AgentActivity[];
  approvals?: unknown[];
  created_at?: string | null;
  updated_at?: string | null;
};

export type GetAgentParams = {
  page: number;
  per_page: number;
  "filter[search]"?: string;
  "filter[city_name]"?: string;
  "filter[association_name]"?: string;
  "filter[is_active]"?: string;
  "filter[type]"?: string;
};

export type AgentResponse = {
  data: Agent[];
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
    per_page: number;
    to: number | null;
    total: number;
  };
};

export type AgentDetailResponse = {
  data: AgentDetail;
};

export type CreateMasterAgentBranchPayload = {
  name: string;
  province_name: string;
  city_name: string;
  code: string;
  contact_person: string;
  phone: string;
  address: string;
  is_active: boolean;
};

export type CreateMasterAgentPayload = {
  code: string;
  name: string;
  association_name: string;
  type: string;
  company_name: string;
  contact_person: string;
  phone: string;
  address: string;
  province_name: string;
  city_name: string;
  branches: CreateMasterAgentBranchPayload[];
  website: string;
  logo: string;
  is_active: boolean;
};