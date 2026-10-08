import { useEffect, useMemo, useState } from "react";
import { useTable } from "@tanstack/react-table";
import type {
  ColumnVisibilityState,
  PaginationState,
} from "@tanstack/react-table";
import { FaDownload, FaFileInvoice, FaPlus } from "react-icons/fa6";
import FilterBar from "@/components/Filter/filter-bar";
import FilterSelect from "@/components/Filter/filter-select";
import FilterDate from "@/components/Filter/filter-date";
import FilterSearchable from "@/components/Filter/filter-searchable";
import type { DateValueType } from "react-tailwindcss-datepicker";
import ColumnVisibility from "@/components/data-table/column-visibility";
import DataTable from "@/components/data-table/data-table";
import TablePagination from "@/components/data-table/table-pagination";
import { dataTableFeatures } from "@/components/data-table/table-features";
import { getDatatableColumns } from "../columns";
import { datatableRecords } from "../service/datatable-service";
import type { DataTableRecord } from "../types/datatable";
import { Button } from "@/components/ui/button";
import CreateMaster from "../components/create-master";
import DetailMasterProduk from "../components/detail-master";

const statusOptions = [
  { value: "Draft", label: "Draft" },
  { value: "Menunggu", label: "Menunggu" },
  { value: "Disetujui", label: "Disetujui" },
];

export default function DatatablePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<DateValueType>({
    startDate: null,
    endDate: null,
  });
  const [tableFilter, setTableFilter] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState("");
  const [tablePickerOpen, setTablePickerOpen] = useState(false);
  const [isCreateMasterOpen, setIsCreateMasterOpen] = useState(false);
  const [isDetailMasterOpen, setIsDetailMasterOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });

  const tableOptions = useMemo(
    () => [...new Set(datatableRecords.map((record) => record.nama_table))],
    [],
  );
  const columns = useMemo(
    () => getDatatableColumns(() => setIsDetailMasterOpen(true)),
    [],
  );

  const filteredData = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    return datatableRecords.filter((datatable) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          datatable.datatable_id,
          datatable.nama_table,
          datatable.tanggal,
          datatable.status,
        ].some((value) => value.toLocaleLowerCase().includes(normalizedSearch));

      const matchesDate =
        !dateFilter?.startDate ||
        (() => {
          const [month, day, year] = datatable.tanggal.split("/").map(Number);
          const recordDate = new Date(year, month - 1, day);
          const selectedDate = dateFilter.startDate;
          return recordDate.toDateString() === selectedDate.toDateString();
        })();

      return (
        matchesSearch &&
        (!statusFilter || datatable.status === statusFilter) &&
        (!tableFilter || datatable.nama_table === tableFilter) &&
        matchesDate
      );
    });
  }, [search, statusFilter, dateFilter, tableFilter]);

  useEffect(() => {
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [search, statusFilter, dateFilter, tableFilter]);

  const resetFilters = () => {
    setStatusFilter("");
    setDateFilter({ startDate: null, endDate: null });
    setTableFilter(null);
    setTableSearch("");
  };

  const hasActiveFilters = Boolean(
    statusFilter || dateFilter?.startDate || tableFilter,
  );

  const table = useTable<typeof dataTableFeatures, DataTableRecord>({
    features: dataTableFeatures,
    data: filteredData,
    columns,
    state: { columnVisibility, pagination },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
  });

  const rows = table.getRowModel().rows;
  const currentPage = pagination.pageIndex + 1;
  const totalPages = Math.max(table.getPageCount(), 1);
  const from =
    rows.length === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const to = pagination.pageIndex * pagination.pageSize + rows.length;

  return (
    <>
      <section className="min-w-0 space-y-5">
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FaFileInvoice
                  className="text-emerald-500"
                  aria-hidden="true"
                />
                <h1 className="text-lg font-bold text-slate-800 dark:text-white">
                  Judul
                </h1>
              </div>
              <p className="ml-6 text-xs text-slate-500 dark:text-slate-400">
                Sub Judul
              </p>
            </div>

            <div className="flex w-full items-center gap-3 lg:w-auto">
              <div className="w-full lg:w-96">
                <FilterBar
                  search={search}
                  onSearchChange={(event) => setSearch(event.target.value)}
                  active={hasActiveFilters}
                  onReset={resetFilters}
                >
                  <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-2">
                    <FilterSelect
                      label="Status"
                      value={statusFilter}
                      onChange={setStatusFilter}
                      placeholder="Semua"
                      options={statusOptions}
                    />
                    <FilterDate
                      label="Tanggal"
                      value={dateFilter}
                      onChange={setDateFilter}
                    />
                    <FilterSearchable<string>
                      label="Datatable"
                      open={tablePickerOpen}
                      onOpenChange={setTablePickerOpen}
                      search={tableSearch}
                      onSearchChange={setTableSearch}
                      placeholder="Semua datatable"
                      selectedLabel={tableFilter}
                      selectedKey={tableFilter}
                      items={tableOptions.filter((name) =>
                        name
                          .toLocaleLowerCase()
                          .includes(tableSearch.trim().toLocaleLowerCase()),
                      )}
                      getKey={(name) => name}
                      renderItem={(name) => name}
                      onSelect={(name) => {
                        setTableFilter(name);
                        setTablePickerOpen(false);
                        setTableSearch("");
                      }}
                    />
                  </div>
                </FilterBar>
              </div>
              <div className="hidden xl:flex gap-2">
                <Button
                  variant="primer"
                  onClick={() => setIsCreateMasterOpen(true)}
                >
                  <FaPlus className="text-[16px]" />
                  Tambah
                </Button>

                <Button variant="blue" onClick={() => ""}>
                  <FaDownload size={14} />
                  Export
                </Button>
              </div>
            </div>
          </div>

          <div className="border-b bg-slate-50/50 px-4 py-2 dark:border-slate-700 dark:bg-slate-900/30 sm:px-6">
            <TablePagination
              leftSlot={<ColumnVisibility table={table} />}
              itemPerPage={pagination.pageSize}
              setItemPerPage={table.setPageSize}
              currentPage={currentPage}
              lastPage={totalPages}
              fromPage={from}
              toPage={to}
              totalData={filteredData.length}
              onPrev={() => table.previousPage()}
              onNext={() => table.nextPage()}
            />
          </div>

          <DataTable table={table} cellClassName="px-3 py-2" />
        </div>
      </section>

      <CreateMaster
        open={isCreateMasterOpen}
        onClose={() => setIsCreateMasterOpen(false)}
        onSubmit={() => {
          setIsCreateMasterOpen(false);
        }}
      />

      <DetailMasterProduk
        open={isDetailMasterOpen}
        onClose={() => setIsDetailMasterOpen(false)}
      />
    </>
  );
}
