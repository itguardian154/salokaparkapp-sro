export type AuthProfile = {
  department: {
    id: string;
    name: string;
  };
  grade: {
    id: string;
    name: string;
  };
  sub_department: {
    id: string;
    name: string;
  };
  user: {
    name: string;
  };
  position: string;
  /** Employee ID is encrypted before it is written to localStorage. */
  employee_id: string;
  token: string;
  token_type: string;
  permissions: string[];
};

export type StoredAuthProfile = Omit<AuthProfile, "token_type">;

export type LoginResponse = {
  success: boolean;
  message: string;
  data?: {
    user: {
      employee_id: string;
      name: string;
      department: { id: string; name: string };
      sub_department: { id: string; name: string };
      position: string;
      grade: { id: string; name: string };
      permissions: string[];
    };
    token: string;
    token_type: string;
  };
};
