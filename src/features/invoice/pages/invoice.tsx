import { dataTableFeatures } from "@/components/data-table/table-features";
import FilterBar from "@/components/Filter/filter-bar";
import FilterSelect from "@/components/Filter/filter-select";
import { Button } from "@/components/ui/button";
import { useTable, type ColumnVisibilityState } from "@tanstack/react-table";
import { FaBox, FaFileInvoice, FaPlus } from "react-icons/fa6";
import { useMemo, useState } from "react";
import DataTable from "@/components/data-table/data-table";
import MobileDataCard from "@/components/data-table/mobile-data-card";
import { getInvoiceColumns } from "../columns";
import type { InvoiceRecord } from "../types/invoice";
import { useDepartemen } from "@/features/departemen/hooks/use-departemen";
import FilterSearchable from "@/components/Filter/filter-searchable";
import type { Departemen } from "@/features/departemen/types/departemen";

export default function InvoicePage() {
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [, setIsCreateMasterOpen] = useState(false);
  const [departemenPickerOpen, setDepartemenPickerOpen] = useState(false);
  const [selectedDepartemen, setSelectedDepartemen] =
    useState<Departemen | null>(null);
  const columns = useMemo(() => getInvoiceColumns(), []);

  const dataMasterProduct = useMemo<InvoiceRecord[]>(
    () => [
      {
        id: 1,
        invoice_id: "INV/PIP/26/2/0001/2151",
        sales: "Widi",
        group_name: "Panorama Indah Tour",
        kedatangan: "1-1-2026",
        ticket: 1,
        revenue: 100000,
        status: "Draft",
      },
      {
        id: 2,
        invoice_id: "INV/PIP/26/2/0001/2152",
        sales: "Mateo",
        group_name: "Jaya Tour",
        kedatangan: "3-2-2026",
        ticket: 10,
        revenue: 100000,
        status: "Draft",
      },
    ],
    [],
  );
  const table = useTable({
    features: dataTableFeatures,
    data: dataMasterProduct,
    columns,
    state: {
      columnVisibility,
      // pagination: { pageIndex: 0, pageSize: itemPerPage },
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const {
    departemen,
    searchDepartemen,
    setSearchDepartemen,
    loading: loadingDepartemen,
    error: departemenError,
  } = useDepartemen();

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
                  Invoice
                </h1>
              </div>
              <p className="ml-6 text-xs text-slate-500 dark:text-slate-400">
                Daftar Invoice
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
                  <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="w-full">
                      <FilterSearchable<Departemen>
                        label="Departemen"
                        open={departemenPickerOpen}
                        onOpenChange={setDepartemenPickerOpen}
                        search={searchDepartemen}
                        onSearchChange={setSearchDepartemen}
                        placeholder="Semua"
                        selectedLabel={selectedDepartemen?.departemen}
                        selectedKey={selectedDepartemen?.id_dept}
                        emptyText={
                          loadingDepartemen
                            ? "Memuat departemen..."
                            : (departemenError ?? "Departemen tidak ditemukan")
                        }
                        items={departemen}
                        getKey={(item) => item.id_dept}
                        renderItem={(item) => item.departemen}
                        onSelect={(item) => {
                          setSelectedDepartemen(item);
                          setSearchDepartemen("");
                          setDepartemenPickerOpen(false);
                        }}
                      />
                    </div>
                    <div className="w-full">
                      <FilterSelect
                        label="Status"
                        value={""}
                        onChange={() => {}}
                        placeholder="Semua"
                        options={[{ value: "draft", label: "Draft" }]}
                      />
                    </div>
                  </div>
                </FilterBar>
              </div>
              <div className="hidden gap-2 xl:flex">
                <Button
                  variant="primer"
                  onClick={() => setIsCreateMasterOpen(true)}
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
                titleKey="invoice_id"
                titleLabel="Invoice"
                icon={<FaBox className="h-5 w-5" aria-hidden="true" />}
                emptyTitle="Belum ada data invoice"
                emptyDescription="Data invoice akan ditampilkan di sini."
              />
            </div>
          </>
          {/* )} */}
        </div>
      </section>
    </>
  );
}
