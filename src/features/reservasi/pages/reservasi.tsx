import { dataTableFeatures } from "@/components/data-table/table-features";
import FilterBar from "@/components/Filter/filter-bar";
import FilterSelect from "@/components/Filter/filter-select";
import { Button } from "@/components/ui/button";
import { useTable, type ColumnVisibilityState } from "@tanstack/react-table";
import { FaBox, FaFileInvoice, FaPlus } from "react-icons/fa6";
import { useMemo, useState } from "react";
import DataTable from "@/components/data-table/data-table";
import MobileDataCard from "@/components/data-table/mobile-data-card";
import ColumnVisibility from "@/components/data-table/column-visibility";
import TablePagination from "@/components/data-table/table-pagination";
import FilterSearchable from "@/components/Filter/filter-searchable";
import type { Departemen } from "@/features/departemen/types/departemen";
import MobileFloatingActionButton from "@/components/mobile-floating-action-button";
import { useNavigate } from "react-router-dom";
import { getReservasiColumns } from "../columns";
import useReservasi from "../hooks/use-reservasi";

const reservasiStatusOptions = [
  { value: "unpaid", label: "Belum Dibayar" },
  { value: "partially_paid", label: "Dibayar Sebagian" },
  { value: "paid", label: "Lunas" },
  { value: "cancelled", label: "Dibatalkan" },
];

export default function ReservasiPage() {
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const navigate = useNavigate();
  const columns = useMemo(() => getReservasiColumns(), []);
  const {
    dataReservasi,
    loadingData,
    error,
    searchData,
    setSearchData,
    statusFilter,
    setStatusFilter,
    itemPerPage,
    setItemPerPage,
    currentPage,
    lastPage,
    totalData,
    fromPage,
    toPage,
    handleNextPage,
    handlePrevPage,
  } = useReservasi();
  const availableStatusOptions = useMemo(() => {
    const statuses = new Map(
      reservasiStatusOptions.map((option) => [option.value, option.label]),
    );
    dataReservasi.forEach((reservasi) => {
      if (reservasi.status_value) {
        statuses.set(reservasi.status_value, reservasi.status);
      }
    });
    return Array.from(statuses, ([value, label]) => ({ value, label }));
  }, [dataReservasi]);

  const table = useTable({
    features: dataTableFeatures,
    data: dataReservasi,
    columns,
    state: {
      columnVisibility,
      // pagination: { pageIndex: 0, pageSize: itemPerPage },
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

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
                  Reservasi
                </h1>
              </div>
              <p className="ml-6 text-xs text-slate-500 dark:text-slate-400">
                Daftar Reservasi
              </p>
            </div>

            <div className="flex w-full items-center gap-3 lg:w-auto">
              <div className="w-full lg:w-96">
                <FilterBar
                  search={searchData}
                  onSearchChange={setSearchData}
                  active={Boolean(searchData || statusFilter)}
                  onReset={() => {
                    setSearchData("");
                    setStatusFilter("");
                  }}
                >
                  <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="w-full">
                      <FilterSearchable<Departemen>
                        label="Departemen"
                        open={false}
                        onOpenChange={() => {}}
                        search=""
                        onSearchChange={() => {}}
                        placeholder="Semua"
                        emptyText="Filter departemen belum tersedia."
                        items={[]}
                        getKey={(item) => item.id_dept}
                        renderItem={(item) => item.departemen}
                        onSelect={() => {}}
                        disabled
                      />
                    </div>
                    <div className="w-full">
                      <FilterSelect
                        label="Status"
                        value={statusFilter}
                        onChange={setStatusFilter}
                        placeholder="Semua"
                        options={availableStatusOptions}
                      />
                    </div>
                  </div>
                </FilterBar>
              </div>
              <div className="hidden gap-2 xl:flex">
                <Button
                  variant="primer"
                  onClick={() => navigate("/reservation/create")}
                >
                  <FaPlus className="text-[16px]" />
                  Tambah
                </Button>
              </div>
            </div>
          </div>

          <div className="border-b bg-slate-50/50 px-4 py-2 dark:border-slate-700 dark:bg-slate-900/30 sm:px-6">
            <TablePagination
              leftSlot={<ColumnVisibility table={table} />}
              itemPerPage={itemPerPage}
              setItemPerPage={setItemPerPage}
              currentPage={currentPage}
              lastPage={lastPage}
              fromPage={fromPage ?? 0}
              toPage={toPage ?? 0}
              totalData={totalData}
              onPrev={handlePrevPage}
              onNext={handleNextPage}
            />
          </div>

          <>
            <div className="hidden md:block">
              {error && (
                <p role="alert" className="px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              )}
              <DataTable
                table={table}
                loading={loadingData}
                cellClassName="px-3 py-2"
              />
            </div>
            <div className="p-3 md:hidden">
              {error ? (
                <p role="alert" className="px-2 py-4 text-center text-sm text-red-600">
                  {error}
                </p>
              ) : loadingData ? (
                <p className="px-2 py-8 text-center text-sm text-slate-500">
                  Memuat data invoice...
                </p>
              ) : (
                <MobileDataCard
                  table={table}
                  titleKey="sales_order_number"
                  titleLabel="Reservasi"
                  icon={<FaBox className="h-5 w-5" aria-hidden="true" />}
                  emptyTitle="Belum ada data invoice"
                  emptyDescription="Data invoice akan ditampilkan di sini."
                />
              )}
            </div>
          </>
        </div>
      </section>

      <MobileFloatingActionButton
        ariaLabel="Tambah Reservasi"
        onClick={() => navigate("/reservation/create")}
      />
    </>
  );
}
