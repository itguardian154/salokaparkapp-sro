// import ColumnVisibility from "@/components/data-table/column-visibility";
import { dataTableFeatures } from "@/components/data-table/table-features";
// import TablePagination from "@/components/data-table/table-pagination";
import FilterBar from "@/components/Filter/filter-bar";
import FilterSelect from "@/components/Filter/filter-select";
import { Button } from "@/components/ui/button";
import { useTable, type ColumnVisibilityState } from "@tanstack/react-table";
import { FaBox, FaDatabase, FaPlus } from "react-icons/fa6";
import { getMasterKategoriProdukColumns } from "../columns";
import { useMemo, useState } from "react";
import DataTable from "@/components/data-table/data-table";
import MobileDataCard from "@/components/data-table/mobile-data-card";
import CreateMasterKategoriProduk from "../components/create-kategori";
import EditMasterKategoriProduk from "../components/edit-kategori";

export default function MasterKategoriProdukPage() {
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [isCreateMasterOpen, setIsCreateMasterOpen] = useState(false);
  const [isEditMasterOpen, setIsEditMasterOpen] = useState(false);

  const columns = useMemo(
    () => getMasterKategoriProdukColumns(() => setIsEditMasterOpen(true)),
    [],
  );

  const dataMasterKategori = [
    {
      id: 1,
      kategori: "Agent",
      is_active: "Aktif",
    }
  ]
  const table = useTable({
    features: dataTableFeatures,
    data: dataMasterKategori,
    columns,
    state: {
      columnVisibility,
      // pagination: { pageIndex: 0, pageSize: itemPerPage },
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handleCloseCreateProduk = () => {
    setIsCreateMasterOpen(false);
  };
  return (
    <>
      <section className="min-w-0 space-y-5">
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FaDatabase className="text-emerald-500" aria-hidden="true" />
                <h1 className="text-lg font-bold text-slate-800 dark:text-white">
                  Master Kategori Produk
                </h1>
              </div>
              <p className="ml-6 text-xs text-slate-500 dark:text-slate-400">
                Daftar kategori produk
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
                      <FilterSelect
                        label="Status Produk"
                        value={""}
                        onChange={() => {}}
                        placeholder="Semua"
                        options={[
                          { value: "true", label: "Aktif" },
                          {
                            value: "false",
                            label: "Non Aktif",
                          },
                        ]}
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
                titleKey="kategori"
                titleLabel="Produk"
                icon={<FaBox className="h-5 w-5" aria-hidden="true" />}
                emptyTitle="Belum ada data kategori produk"
                emptyDescription="Data kategori produk akan ditampilkan di sini."
              />
            </div>
          </>
          {/* )} */}
        </div>
      </section>

      <CreateMasterKategoriProduk
        open={isCreateMasterOpen}
        onClose={handleCloseCreateProduk}
      />
      <EditMasterKategoriProduk
        open={isEditMasterOpen}
        onClose={() => setIsEditMasterOpen(false)}
      />
    </>
  );
}
