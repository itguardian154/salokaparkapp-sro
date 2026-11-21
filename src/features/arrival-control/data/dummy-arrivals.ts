import type { ArrivalGroup } from "../types/arrival-control";

const arrivalStatuses: ArrivalGroup["arrivalStatus"][] = [
  "belum_datang",
  "rombongan_datang",
  "masuk_in_park",
  "sudah_makan",
  "pulang",
];

const groupDetails = [
  ["SD Negeri 01 Semarang", "Semarang", "Andi Pratama"],
  ["SMP Harapan Bangsa", "Kendal", "Budi Santoso"],
  ["SMA Tunas Muda", "Salatiga", "Dewi Lestari"],
  ["SD Islam Al Azhar", "Ungaran", "Rina Puspita"],
  ["SMP Negeri 3 Demak", "Demak", "Agus Setiawan"],
] as const;

export const dummyArrivals: ArrivalGroup[] = groupDetails.map(
  ([schoolName, city, salesName], index) => ({
    id: index + 1,
    schoolName,
    city,
    salesName,
    totalTickets: [150, 125, 180, 96, 140, 80][index % 6],
    enteredTickets: [120, 120, 180, 62, 0, 45][index % 6],
    arrivalStatus: arrivalStatuses[index] ?? "belum_datang",
    cateringStatus:
      index >= 16 ? "selesai" : index >= 12 ? "siap" : "belum_siap",
  }),
);
