import { dataTableFeatures } from "@/components/data-table/table-features";
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
import useMasterKategoriProduk from "../hooks/use-master-kategori";
import useCreateKategoriProduk from "../hooks/use-create-kategori";
import TablePagination from "@/components/data-table/table-pagination";
import ColumnVisibility from "@/components/data-table/column-visibility";
import type { CreateKategoriProdukPayload, UpdateKategoriProdukPayload } from "../types/kategori-produk";
import { toast } from "@/components/ui/toast";
import useEditKategoriProduk from "../hooks/use-edit-kategori";
import useDetailKategoriProduk from "../hooks/use-detail-kategori";

export default function MasterKategoriProdukPage() {
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [isCreateMasterOpen, setIsCreateMasterOpen] = useState(false);
  const [isEditMasterOpen, setIsEditMasterOpen] = useState(false);
  const [selectedEditProdukId, setSelectedEditProdukId] = useState<
    number | null
  >(null);

  const {
    dataMasterKategoriProduk,
    loadingData,
    error,
    searchData,
    setSearchData,
    filterData,
    setFilterData,
    itemPerPage,
    setItemPerPage,
    currentPage,
    lastPage,
    totalData,
    fromPage,
    toPage,
    handleNextPage,
    handlePrevPage,
    refetch,
  } = useMasterKategoriProduk();

  const { submit: createKategoriProduk, loading: submittingProduk } =
    useCreateKategoriProduk();

  const {
    submit: editProduk,
    loading: submittingEditProduk,
    error: editProdukError,
    clearError: clearEditProdukError,
  } = useEditKategoriProduk();

  const {
    produk: editProdukDetail,
    loading: loadingEditProduk,
    error: loadEditProdukError,
  } = useDetailKategoriProduk(selectedEditProdukId, isEditMasterOpen);

  const resetFilters = () => {
    setSearchData("");
    setFilterData((current) => ({
      ...current,
      filter: {
        ...current.filter,
        name: "",
        is_active: "",
      },
    }));
  };

  const columns = useMemo(
    () =>
      getMasterKategoriProdukColumns((kategori) => {
        setSelectedEditProdukId(kategori.id);
        clearEditProdukError();
        setIsEditMasterOpen(true);
      }, true),
    [],
  );

  const table = useTable({
    features: dataTableFeatures,
    data: dataMasterKategoriProduk,
    columns,
    state: {
      columnVisibility,
      pagination: { pageIndex: 0, pageSize: itemPerPage },
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handleCreateKategoriProduk = async (
    payload: CreateKategoriProdukPayload,
  ) => {
    try {
      await createKategoriProduk(payload);
      setIsCreateMasterOpen(false);
      refetch();
      toast.add({
        title: "Kategori Produk berhasil dibuat",
        description: "Master kategori produk baru sudah ditambahkan ke daftar.",
        type: "success",
        timeout: 4000,
      });
    } catch (err: unknown) {
      toast.add({
        title: "Kategori Produk gagal dibuat",
        description:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat menyimpan kategori produk.",
        type: "error",
        timeout: 6000,
      });
      throw err;
    }
  };

  const handleCloseCreateProduk = () => {
    setIsCreateMasterOpen(false);
  };

  const handleUpdateKategoriProduk = async (
    payload: UpdateKategoriProdukPayload,
  ) => {
    if (selectedEditProdukId === null) return;

    try {
      await editProduk(selectedEditProdukId, payload);
      setIsEditMasterOpen(false);
      setSelectedEditProdukId(null);
      refetch();
      toast.add({
        title: "Kategori produk berhasil diperbarui",
        description: "Perubahan master kategori produk sudah disimpan.",
        type: "success",
        timeout: 4000,
      });
    } catch (err: unknown) {
      toast.add({
        title: "Kategori produk gagal diperbarui",
        description:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memperbarui kategori produk.",
        type: "error",
        timeout: 6000,
      });
      throw err;
    }
  };

  const handleCloseEditProduk = () => {
    setIsEditMasterOpen(false);
    setSelectedEditProdukId(null);
    clearEditProdukError();
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
                  search={searchData}
                  onSearchChange={setSearchData}
                  active={Boolean(
                    filterData.filter.name || filterData.filter.is_active,
                  )}
                  onReset={resetFilters}
                >
                  <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="w-full">
                      <FilterSelect
                        label="Status"
                        value={filterData.filter.is_active}
                        onChange={(is_active) =>
                          setFilterData((current) => ({
                            ...current,
                            filter: { ...current.filter, is_active },
                          }))
                        }
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

          {error ? (
            <p role="alert" className="px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          ) : loadingData ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              Memuat data kategori produk...
            </p>
          ) : (
            <>
              <div className="hidden md:block">
                <DataTable table={table} cellClassName="px-3 py-2" />
              </div>
              <div className="p-3 md:hidden">
                <MobileDataCard
                  table={table}
                  titleKey="name"
                  titleLabel="Kategori Produk"
                  icon={<FaBox className="h-5 w-5" aria-hidden="true" />}
                  emptyTitle="Belum ada data kategori produk"
                  emptyDescription="Data kategori produk akan ditampilkan di sini."
                />
              </div>
            </>
          )}
        </div>
      </section>

      <CreateMasterKategoriProduk
        open={isCreateMasterOpen}
        onClose={handleCloseCreateProduk}
        onSubmit={handleCreateKategoriProduk}
        submitting={submittingProduk}
      />

      <EditMasterKategoriProduk
        open={isEditMasterOpen}
        produk={editProdukDetail}
        loadingProduk={loadingEditProduk}
        produkError={loadEditProdukError}
        submitting={submittingEditProduk}
        submitError={editProdukError}
        onClose={handleCloseEditProduk}
        onSubmit={handleUpdateKategoriProduk}
      />
    </>
  );
}
