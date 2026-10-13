export type Departemen = {
  id_dept: string;
  departemen: string;
};

export type GetDepartemenResponse = {
  status: string;
  message: string;
  periode: Departemen[];
};
