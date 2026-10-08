export type DatatableStatus = "Draft" | "Menunggu" | "Disetujui";

export type DataTableRecord = {
  id: number;
  datatable_id: string;
  nama_table: string;
  tanggal: string;
  ticket: number;
  harga: number;
  status: DatatableStatus;
};
