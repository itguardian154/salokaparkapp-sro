import type { DataTableRecord } from "../types/datatable";

// Temporary local data source until this feature is connected to an API.
export const datatableRecords: DataTableRecord[] = [
  {
    id: 1,
    datatable_id: "DT/PIP/26/2/0001/2151",
    nama_table: "Table Karyawan",
    tanggal: "1/1/2026",
    ticket: 1,
    harga: 100000,
    status: "Draft",
  },
  {
    id: 2,
    datatable_id: "DT/PIP/26/2/0001/2152",
    nama_table: "Table Master",
    tanggal: "3/2/2026",
    ticket: 10,
    harga: 500000,
    status: "Menunggu",
  },
];
