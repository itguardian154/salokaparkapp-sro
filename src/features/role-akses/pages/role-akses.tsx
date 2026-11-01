
import { useCallback, useMemo, useState } from "react";
import { useTable } from "@tanstack/react-table";
import type { ColumnVisibilityState } from "@tanstack/react-table";
import { FaUserLock, FaShieldHalved, FaPlus } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

import FilterBar from "@/components/Filter/filter-bar";
import ColumnVisibility from "@/components/data-table/column-visibility";
import DataTable from "@/components/data-table/data-table";
import TablePagination from "@/components/data-table/table-pagination";
import MobileDataCard from "@/components/data-table/mobile-data-card";
import { dataTableFeatures } from "@/components/data-table/table-features";

import type {
  RoleAksesRecord,
  RoleAksesDetail,
  CreateRoleAksesPayload,
  UpdateRoleAksesPayload,
} from "../types/role-akses";

import useRoleAkses from "../hooks/use-role-akses";
import useCreateRoleAkses from "../hooks/use-create-role-akses";
import useUpdateRoleAkses from "../hooks/use-update-role-akses";
import useRoleAksesDetail from "../hooks/use-detail-role-akses";

import { getRoleAksesColumns } from "../columns";
import CreateRoleAkses from "../components/create-role-akses";
import UpdateRoleAkses from "../components/update-role-akses";
import DetailRoleAkses from "../components/detail-role-akses";
import MobileFloatingActionButton from "@/components/mobile-floating-action-button";

export default function RoleAksesPage() {
  const {
    dataRoleAkses,
    loadingData,
    error,
    searchData,
    setSearchData,
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
  } = useRoleAkses();

  const {
    submit: submitRoleAkses,
    loading: submittingCreate,
    error: createError,
    clearError: clearCreateError,
  } = useCreateRoleAkses();

  const {
    submit: submitUpdateRoleAkses,
    loading: submittingUpdate,
    error: updateError,
    clearError: clearUpdateError,
  } = useUpdateRoleAkses();

  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});

  const [createOpen, setCreateOpen] = useState(false);

  const [selectedRole, setSelectedRole] =
    useState<RoleAksesRecord | null>(null);

  const [updateOpen, setUpdateOpen] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);

  const [selectedDetailRoleId, setSelectedDetailRoleId] =
    useState<number | null>(null);

  const {
    dataRoleAkses: detailRoleAkses,
    loadingDetail,
    errorDetail,
  } = useRoleAksesDetail(selectedDetailRoleId);

  const roles = useMemo<RoleAksesRecord[]>(
    () => dataRoleAkses ?? [],
    [dataRoleAkses],
  );

  // Buka modal tambah
  const handleOpenCreate = useCallback(() => {
    clearCreateError();
    setCreateOpen(true);
  }, [clearCreateError]);

  // Buka modal edit
  const handleOpenEdit = useCallback(
    (role: RoleAksesRecord) => {
      clearUpdateError();
      setSelectedRole(role);
      setUpdateOpen(true);
    },
    [clearUpdateError],
  );

  // Buka detail
  const handleDetail = useCallback((role: RoleAksesRecord) => {
    setSelectedDetailRoleId(role.id);
    setDetailOpen(true);
  }, []);

  // Tutup detail
  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
    setSelectedDetailRoleId(null);
  }, []);

  // Kolom tabel
  const columns = useMemo(
    () => getRoleAksesColumns(handleDetail, handleOpenEdit, true),
    [handleDetail, handleOpenEdit],
  );

  const table = useTable({
    features: dataTableFeatures,
    data: roles,
    columns,
    state: {
      columnVisibility,
      pagination: {
        pageIndex: 0,
        pageSize: itemPerPage,
      },
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  // Tambah Role Akses
  const handleCreateRoleAkses = async (
    payload: CreateRoleAksesPayload,
  ) => {
    try {
      await submitRoleAkses(payload);

      setCreateOpen(false);
      clearCreateError();
      refetch();

      toast.add({
        title: "Role akses berhasil dibuat",
        description: "Role akses baru berhasil ditambahkan.",
        type: "success",
        timeout: 4000,
      });
    } catch (err: unknown) {
      toast.add({
        title: "Role akses gagal dibuat",
        description:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat menyimpan role akses.",
        type: "error",
        timeout: 6000,
      });
    }
  };

  // Update Role Akses
  const handleUpdateRoleAkses = async (
    id: number,
    payload: UpdateRoleAksesPayload,
  ) => {
    try {
      await submitUpdateRoleAkses(id, payload);

      setUpdateOpen(false);
      setSelectedRole(null);
      clearUpdateError();
      refetch();

      toast.add({
        title: "Role akses berhasil diperbarui",
        description: "Perubahan role akses berhasil disimpan.",
        type: "success",
        timeout: 4000,
      });
    } catch (err: unknown) {
      toast.add({
        title: "Role akses gagal diperbarui",
        description:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memperbarui role akses.",
        type: "error",
        timeout: 6000,
      });
    }
  };

  // Tutup modal tambah
  const handleCloseCreate = useCallback(() => {
    if (submittingCreate) return;

    clearCreateError();
    setCreateOpen(false);
  }, [submittingCreate, clearCreateError]);

  // Tutup modal edit
  const handleCloseEdit = useCallback(() => {
    if (submittingUpdate) return;

    clearUpdateError();
    setUpdateOpen(false);
    setSelectedRole(null);
  }, [submittingUpdate, clearUpdateError]);

  // Reset pencarian
  const resetFilters = useCallback(() => {
    setSearchData("");
  }, [setSearchData]);

  return (
    <section className="min-w-0 space-y-5">
      {createOpen ? (
        <CreateRoleAkses
          open={createOpen}
          onClose={handleCloseCreate}
          onSubmit={handleCreateRoleAkses}
          submitting={submittingCreate}
          submitError={createError}
        />
      ) : updateOpen && selectedRole ? (
        <UpdateRoleAkses
          record={selectedRole}
          onClose={handleCloseEdit}
          onSubmit={handleUpdateRoleAkses}
          submitting={submittingUpdate}
          submitError={updateError}
        />
      ) : detailOpen ? (
        <DetailRoleAkses
          open={detailOpen}
          roleAkses={detailRoleAkses as RoleAksesDetail | null}
          loading={loadingDetail}
          error={errorDetail}
          onClose={handleCloseDetail}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {/* HEADER */}
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FaUserLock
                  className="text-emerald-500"
                  aria-hidden="true"
                />

                <h1 className="text-lg font-bold text-slate-800 dark:text-white">
                  Role Akses
                </h1>
              </div>

              <p className="ml-6 text-xs text-slate-500 dark:text-slate-400">
                Daftar role dan permission pengguna
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
              <div className="w-full sm:min-w-0 sm:flex-1 lg:w-96 lg:flex-none">
                <FilterBar
                  search={searchData}
                  onSearchChange={setSearchData}
                  active={Boolean(searchData)}
                  onReset={resetFilters}
                />
              </div>

              <Button
                type="button"
                variant="primer"
                onClick={handleOpenCreate}
                className="hidden gap-2 xl:flex"
              >
                <FaPlus size={14} />
                Tambah
              </Button>
            </div>
          </div>

          {/* PAGINATION */}
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

          {/* TABLE CONTENT */}
          {error ? (
            <p
              role="alert"
              className="px-4 py-3 text-sm text-red-600"
            >
              {error}
            </p>
          ) : loadingData ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              Memuat data role akses...
            </p>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden md:block">
                <DataTable
                  table={table}
                  cellClassName="px-3 py-2"
                />
              </div>

              {/* MOBILE CARD */}
              <div className="p-3 md:hidden">
                <MobileDataCard
                  table={table}
                  titleKey="name"
                  titleLabel="Nama Role"
                  icon={
                    <FaShieldHalved
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  }
                  emptyTitle="Belum ada data role akses"
                  emptyDescription="Data role akses akan ditampilkan di sini."
                />
              </div> {/* FLOATING BUTTON TAMBAH ROLE AKSES - MOBILE */}
              <MobileFloatingActionButton
                ariaLabel="Tambah Role Akses"
                onClick={handleOpenCreate}
              />
            </>
          )}
        </div>
      )}
    </section>
  );
}
