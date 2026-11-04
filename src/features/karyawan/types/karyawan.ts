export type Karyawan = {
  id_departemen: string;
  departemen: string;
  id_departemen_sub: string;
  sub_departemen: string;
  id_grade: string;
  grade: string;
  pos: string;
  username: string;
  id_absen: string;
  name: string;
  no_hp: string;
  doj: string;
  dob: string;
  status: number;
  image_profile: string;
};

export type GetKaryawanByNameResponse = {
  status: string;
  message: string;
  data: Karyawan[];
};
