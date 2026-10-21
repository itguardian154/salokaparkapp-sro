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

export type CustomerRecord ={


}
