import { dataTableFeatures } from "@/components/data-table/table-features";
import FilterBar from "@/components/Filter/filter-bar";
import { Button } from "@/components/ui/button";
import { useTable, type ColumnVisibilityState } from "@tanstack/react-table";
import { FaBox, FaCalendarDay, FaPlus } from "react-icons/fa6";
import { useMemo, useState } from "react";
import DataTable from "@/components/data-table/data-table";
import MobileDataCard from "@/components/data-table/mobile-data-card";
import MobileFloatingActionButton from "@/components/mobile-floating-action-button";
import type { PaymentMethodRecord } from "../types/holiday";
import CreateMethod from "../components/create-holiday";
import EditMethod from "../components/edit-holiday";
import { getMethodColumns } from "../columns";

export default function PaymentMetodePage() {
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});

  const [isCreateMethodOpen, setIsCreateMethodOpen] = useState(false);
  const [isEditMethodOpen, setIsEditMethodOpen] = useState(false);

  const dataMethod = useMemo<PaymentMethodRecord[]>(
    () => [
      {
        id: 1,
        name: "Debit BRI",
        tipe: "Debit",
        pos: true,
        sale_order: true,
        status: "Aktif",
      },
    ],
    [],
  );

  const columns = useMemo(
    () => getMethodColumns(setIsEditMethodOpen),
    [setIsEditMethodOpen],
  );

  const table = useTable({
    features: dataTableFeatures,
    data: dataMethod,
    columns,
    state: {
      columnVisibility,
      // pagination: { pageIndex: 0, pageSize: itemPerPage },
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handleCloseCreateMethod = () => {
    setIsCreateMethodOpen(false);
  };

  const handleCloseEditMethod = () => {
    setIsEditMethodOpen(false);
  };

  return (
    <>
      <section className="min-w-0 space-y-5">
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FaCalendarDay
                  className="text-emerald-500"
                  aria-hidden="true"
                />
                <h1 className="text-lg font-bold text-slate-800 dark:text-white">
                  Metode Pembayaran
                </h1>
              </div>
              <p className="ml-6 text-xs text-slate-500 dark:text-slate-400">
                Daftar metode pembayaran
              </p>
            </div>

            <div className="flex w-full items-center gap-3 lg:w-auto">
              <div className="w-full lg:w-96">
                <FilterBar
                  search={""}
                  onSearchChange={() => {}}
                  // active={Boolean(
                  //   filterData.filter.department_id ||
                  //   filterData.filter.status ||
                  //   filterData.filter.is_active,
                  // )}
                  // onReset={resetFilters}
                >
                </FilterBar>
              </div>
              <div className="hidden gap-2 xl:flex">
                <Button
                  variant="primer"
                  onClick={() => setIsCreateMethodOpen(true)}
                >
                  <FaPlus className="text-[16px]" />
                  Tambah
                </Button>
              </div>
            </div>
          </div>

          <div className="border-b bg-slate-50/50 px-4 py-2 dark:border-slate-700 dark:bg-slate-900/30 sm:px-6">
            {/* <TablePagination
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
            /> */}
          </div>

          {/* {error ? (
            <p role="alert" className="px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          ) : loadingData ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              Memuat data produk...
            </p>
          ) : ( */}
          <>
            <div className="hidden md:block">
              <DataTable table={table} cellClassName="px-3 py-2" />
            </div>
            <div className="p-3 md:hidden">
              <MobileDataCard
                table={table}
                titleKey="id"
                titleLabel="Metode Pembayaran"
                icon={<FaBox className="h-5 w-5" aria-hidden="true" />}
                emptyTitle="Belum ada data metode pembayaran."
                emptyDescription="Data metode pembayaran. akan ditampilkan di sini."
              />
            </div>
          </>
        </div>
      </section>

      <MobileFloatingActionButton
        ariaLabel="Tambah Hari Libur"
        onClick={() => setIsCreateMethodOpen(true)}
      />

      <CreateMethod
        open={isCreateMethodOpen}
        onClose={handleCloseCreateMethod}
      />

      <EditMethod open={isEditMethodOpen} onClose={handleCloseEditMethod} />
    </>
  );
}
