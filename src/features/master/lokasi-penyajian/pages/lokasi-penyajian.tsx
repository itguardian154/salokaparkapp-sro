import { dataTableFeatures } from "@/components/data-table/table-features";
import FilterBar from "@/components/Filter/filter-bar";
import FilterSelect from "@/components/Filter/filter-select";
import { Button } from "@/components/ui/button";
import { useTable, type ColumnVisibilityState } from "@tanstack/react-table";
import { FaBox, FaDatabase, FaPlus } from "react-icons/fa6";
import { useMemo, useState } from "react";
import DataTable from "@/components/data-table/data-table";
import MobileDataCard from "@/components/data-table/mobile-data-card";
import TablePagination from "@/components/data-table/table-pagination";
import ColumnVisibility from "@/components/data-table/column-visibility";
import { toast } from "@/components/ui/toast";

import useMasterLokasiPenyajian from "../hooks/use-lokasi-penyajian";
import useEditLokasiPenyajian from "../hooks/use-edit-lokasi-penyajian";
import useCreateLokasiPenyajian from "../hooks/use-create-lokasi-penyajian";
import useDetailLokasiPenyajian from "../hooks/use-detail-lokasi-penyajian";

import { getMasterLokasiPenyajianColumns } from "../columns";
import CreateMasterLokasiPenyajian from "../components/create-lokasi-penyajian";
import EditMasterLokasiPenyajian from "../components/edit-lokasi-penyajian";

import type {
  CreateLokasiPenyajianPayload,
  UpdateLokasiPenyajianPayload,
} from "../types/lokasi-penyajian";

export default function MasterLokasiPenyajianPage() {
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [isCreateMasterOpen, setIsCreateMasterOpen] = useState(false);
  const [isEditMasterOpen, setIsEditMasterOpen] = useState(false);

  const [selectedEditLokasiPenyajianId, setSelectedEditLokasiPenyajianId] =
    useState<number | null>(null);

  const {
    dataMasterLokasiPenyajian,
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
  } = useMasterLokasiPenyajian();

  const {
    submit: createLokasiPenyajian,
    loading: submittingLokasiPenyajian,
  } = useCreateLokasiPenyajian();

  const {
    submit: editLokasiPenyajian,
    loading: submittingEditLokasiPenyajian,
    error: editLokasiPenyajianError,
    clearError: clearEditLokasiPenyajianError,
  } = useEditLokasiPenyajian();

  const {
    lokasiPenyajian: editLokasiPenyajianDetail,
    loading: loadingEditLokasiPenyajian,
    error: loadEditLokasiPenyajianError,
  } = useDetailLokasiPenyajian(
    selectedEditLokasiPenyajianId,
    isEditMasterOpen,
  );

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
      getMasterLokasiPenyajianColumns((lokasiPenyajian) => {
        setSelectedEditLokasiPenyajianId(lokasiPenyajian.id);
        clearEditLokasiPenyajianError();
        setIsEditMasterOpen(true);
      }, true),
    [],
  );

  const table = useTable({
    features: dataTableFeatures,
    data: dataMasterLokasiPenyajian,
    columns,
    state: {
      columnVisibility,
      pagination: { pageIndex: 0, pageSize: itemPerPage },
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handleCreateLokasiPenyajian = async (
    payload: CreateLokasiPenyajianPayload,
  ) => {
    try {
      await createLokasiPenyajian(payload);
      setIsCreateMasterOpen(false);
      refetch();

      toast.add({
        title: "Lokasi penyajian berhasil dibuat",
        description: "Master lokasi penyajian baru sudah ditambahkan ke daftar.",
        type: "success",
        timeout: 4000,
      });
    } catch (err: unknown) {
      toast.add({
        title: "Lokasi penyajian gagal dibuat",
        description:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat menyimpan lokasi penyajian.",
        type: "error",
        timeout: 6000,
      });
      throw err;
    }
  };

  const handleCloseCreateLokasiPenyajian = () => {
    setIsCreateMasterOpen(false);
  };

  const handleUpdateLokasiPenyajian = async (
    payload: UpdateLokasiPenyajianPayload,
  ) => {
    if (selectedEditLokasiPenyajianId === null) return;

    try {
      await editLokasiPenyajian(selectedEditLokasiPenyajianId, payload);
      setIsEditMasterOpen(false);
      setSelectedEditLokasiPenyajianId(null);
      refetch();

      toast.add({
        title: "Lokasi penyajian berhasil diperbarui",
        description: "Perubahan master lokasi penyajian sudah disimpan.",
        type: "success",
        timeout: 4000,
      });
    } catch (err: unknown) {
      toast.add({
        title: "Lokasi penyajian gagal diperbarui",
        description:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memperbarui lokasi penyajian.",
        type: "error",
        timeout: 6000,
      });
      throw err;
    }
  };

  const handleCloseEditLokasiPenyajian = () => {
    setIsEditMasterOpen(false);
    setSelectedEditLokasiPenyajianId(null);
    clearEditLokasiPenyajianError();
  };

  return (
    <>
      <section className="min-w-0 space-y-5">
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FaDatabase
                  className="text-emerald-500"
                  aria-hidden="true"
                />
                <h1 className="text-lg font-bold text-slate-800 dark:text-white">
                  Master Lokasi Penyajian
                </h1>
              </div>
              <p className="ml-6 text-xs text-slate-500 dark:text-slate-400">
                Daftar lokasi penyajian
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
                  <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="w-full">
                      <FilterSelect
                        label="Status"
                        value={filterData.filter.is_active}
                        onChange={(is_active) =>
                          setFilterData((current) => ({
                            ...current,
                            filter: {
                              ...current.filter,
                              is_active,
                            },
                          }))
                        }
                        placeholder="Semua"
                        options={[
                          { value: "true", label: "Aktif" },
                          { value: "false", label: "Non Aktif" },
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
              Memuat data lokasi penyajian...
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
                  titleLabel="Lokasi Penyajian"
                  icon={
                    <FaBox className="h-5 w-5" aria-hidden="true" />
                  }
                  emptyTitle="Belum ada data lokasi penyajian"
                  emptyDescription="Data lokasi penyajian akan ditampilkan di sini."
                />
              </div>
            </>
          )}
        </div>
      </section>

      <CreateMasterLokasiPenyajian
        open={isCreateMasterOpen}
        onClose={handleCloseCreateLokasiPenyajian}
        onSubmit={handleCreateLokasiPenyajian}
        submitting={submittingLokasiPenyajian}
      />

      <EditMasterLokasiPenyajian
        open={isEditMasterOpen}
        lokasiPenyajian={editLokasiPenyajianDetail}
        loadingLokasiPenyajian={loadingEditLokasiPenyajian}
        lokasiPenyajianError={loadEditLokasiPenyajianError}
        submitting={submittingEditLokasiPenyajian}
        submitError={editLokasiPenyajianError}
        onClose={handleCloseEditLokasiPenyajian}
        onSubmit={handleUpdateLokasiPenyajian}
      />
    </>
  );
}