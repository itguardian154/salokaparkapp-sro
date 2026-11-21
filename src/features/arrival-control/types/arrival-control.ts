export type ArrivalStatus =
  | "belum_datang"
  | "rombongan_datang"
  | "masuk_in_park"
  | "sudah_makan"
  | "pulang";

export type CateringStatus = "belum_siap" | "siap" | "selesai";

export type ArrivalGroup = {
  id: number;
  schoolName: string;
  city: string;
  salesName: string;
  totalTickets: number;
  enteredTickets: number;
  arrivalStatus: ArrivalStatus;
  cateringStatus: CateringStatus;
};
