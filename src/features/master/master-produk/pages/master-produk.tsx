import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useTable } from "@tanstack/react-table";
import type { ColumnVisibilityState } from "@tanstack/react-table";
import { FaBox, FaDatabase, FaPlus } from "react-icons/fa6";
import FilterBar from "@/components/Filter/filter-bar";
import ColumnVisibility from "@/components/data-table/column-visibility";
import DataTable from "@/components/data-table/data-table";
import TablePagination from "@/components/data-table/table-pagination";
import { dataTableFeatures } from "@/components/data-table/table-features";
import { getMasterProdukColumns } from "../columns";
import useMasterProduk from "../hooks/use-master-produk";
import useMasterKategoriProduk from "@/features/master/kategori-produk/hooks/use-master-kategori";
import useDetailProduk from "../hooks/use-detail-produk";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useDepartemen } from "@/features/departemen/hooks/use-departemen";
import type { Departemen } from "@/features/departemen/types/departemen";
import type { KategoriProdukRecord } from "@/features/master/kategori-produk/types/kategori-produk";
import FilterSearchable from "@/components/Filter/filter-searchable";
import FilterSelect from "@/components/Filter/filter-select";
import MobileDataCard from "@/components/data-table/mobile-data-card";
import MobileFloatingActionButton from "@/components/mobile-floating-action-button";
import DetailMasterProduk from "../components/detail-produk";
import CreateMasterProduk from "../components/create-produk";
import EditMasterProduk from "../components/edit-produk";
import useCreateProduk from "../hooks/use-create-produk";
import useEditProduk from "../hooks/use-edit-produk";
import useProdukApproval from "../hooks/use-produk-approval";
import type { ProdukApprovalAction } from "../hooks/use-produk-approval";
import type {
  CreateProdukPayload,
  UpdateProdukPayload,
} from "../types/master-produk";
import { getAuthSession } from "@/features/auth/utils/auth-storage";

export default function MasterProdukPage() {
  const permissions = getAuthSession()?.permissions ?? [];
  const canCreateProduk = permissions.includes("product.create");
  const canUpdateProduk = permissions.includes("product.update");
  const [isDetailMasterOpen, setIsDetailMasterOpen] = useState(false);
  const [isCreateMasterOpen, setIsCreateMasterOpen] = useState(false);
  const [selectedProdukId, setSelectedProdukId] = useState<number | null>(null);
  const [isEditMasterOpen, setIsEditMasterOpen] = useState(false);
  const [selectedEditProdukId, setSelectedEditProdukId] = useState<
    number | null
  >(null);
  const {
    dataMasterProduk,
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
  } = useMasterProduk();
  const {
    dataMasterKategoriProduk: kategoriProduk,
    loadingData: loadingKategoriProduk,
    error: kategoriProdukError,
    searchData: kategoriSearch,
    setSearchData: setKategoriSearch,
  } = useMasterKategoriProduk();
  const {
    submit: createProduk,
    loading: submittingProduk,
    error: createProdukError,
    clearError: clearCreateProdukError,
  } = useCreateProduk();
  const {
    submit: editProduk,
    loading: submittingEditProduk,
    error: editProdukError,
    clearError: clearEditProdukError,
  } = useEditProduk();

  const {
    departemen,
    searchDepartemen,
    setSearchDepartemen,
    loading: loadingDepartemen,
    error: departemenError,
  } = useDepartemen();

  const {
    produk: detailProduk,
    loading: loadingDetail,
    error: detailError,
    refetch: refetchDetailProduk,
  } = useDetailProduk(selectedProdukId, isDetailMasterOpen);
  const {
    canApprove,
    checkingPermission: checkingApprovalPermission,
    permissionError: approvalPermissionError,
    loadingAction: loadingApprovalAction,
    runAction: runProdukApprovalAction,
  } = useProdukApproval(selectedProdukId, isDetailMasterOpen);
  const {
    produk: editProdukDetail,
    loading: loadingEditProduk,
    error: loadEditProdukError,
  } = useDetailProduk(selectedEditProdukId, isEditMasterOpen);

  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [departemenPickerOpen, setDepartemenPickerOpen] = useState(false);
  const [selectedDepartemen, setSelectedDepartemen] =
    useState<Departemen | null>(null);
  const [kategoriFilterOpen, setKategoriFilterOpen] = useState(false);
  const [selectedKategoriFilter, setSelectedKategoriFilter] =
    useState<KategoriProdukRecord | null>(null);

  const columns = useMemo(
    () =>
      getMasterProdukColumns(
        (produk) => {
          setSelectedProdukId(produk.id);
          setIsDetailMasterOpen(true);
        },
        (produk) => {
          setSearchDepartemen("");
          setKategoriSearch("");
          clearEditProdukError();
          setSelectedEditProdukId(produk.id);
          setIsEditMasterOpen(true);
        },
        canUpdateProduk,
      ),
    [clearEditProdukError, canUpdateProduk],
  );
  const table = useTable({
    features: dataTableFeatures,
    data: dataMasterProduk,
    columns,
    state: {
      columnVisibility,
      pagination: { pageIndex: 0, pageSize: itemPerPage },
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const resetFilters = () => {
    setSearchData("");
    setFilterData((current) => ({
      ...current,
      filter: {
        ...current.filter,
        department_id: "",
        product_category_id: "",
        status: "",
        is_active: "",
      },
    }));
    setSelectedDepartemen(null);
    setSearchDepartemen("");
    setDepartemenPickerOpen(false);
    setSelectedKategoriFilter(null);
    setKategoriSearch("");
    setKategoriFilterOpen(false);
  };

  const handleCreateProduk = async (
    payload: CreateProdukPayload,
    attachments: File[],
  ) => {
    try {
      await createProduk(payload, attachments);
      setIsCreateMasterOpen(false);
      setSearchData(searchData);
      refetch();
      toast.add({
        title: "Produk berhasil dibuat",
        description: "Master produk baru sudah ditambahkan ke daftar.",
        type: "success",
        timeout: 4000,
      });
    } catch (err: unknown) {
      toast.add({
        title: "Produk gagal dibuat",
        description:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat menyimpan master produk.",
        type: "error",
        timeout: 6000,
      });
      throw err;
    }
  };

  const handleCloseCreateProduk = () => {
    setIsCreateMasterOpen(false);
    clearCreateProdukError();
  };

  const handleOpenCreateProduk = () => {
    setSearchDepartemen("");
    setKategoriSearch("");
    setIsCreateMasterOpen(true);
  };

  const handleUpdateProduk = async (
    payload: UpdateProdukPayload,
    referenceFile: File | null,
  ) => {
    if (selectedEditProdukId === null) return;

    try {
      await editProduk(selectedEditProdukId, payload, referenceFile);
      setIsEditMasterOpen(false);
      setSelectedEditProdukId(null);
      setSearchData(searchData);
      refetch();
      toast.add({
        title: "Produk berhasil diperbarui",
        description: "Perubahan master produk sudah disimpan.",
        type: "success",
        timeout: 4000,
      });
    } catch (err: unknown) {
      toast.add({
        title: "Produk gagal diperbarui",
        description:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memperbarui master produk.",
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

  const handleProdukApprovalAction = async (
    action: ProdukApprovalAction,
  ) => {
    const confirmation = {
      submit: {
        title: "Konfirmasi Submit",
        text: `Yakin ingin submit produk ${detailProduk?.name ?? "ini"}?`,
        confirmButtonText: "Ya, Submit",
        confirmButtonColor: "#107254",
      },
      approve: {
        title: "Konfirmasi Approval",
        text: `Yakin ingin menyetujui produk ${detailProduk?.name ?? "ini"}?`,
        confirmButtonText: "Ya, Approve",
        confirmButtonColor: "#107254",
      },
      reject: {
        title: "Konfirmasi Reject",
        text: `Yakin ingin menolak produk ${detailProduk?.name ?? "ini"}?`,
        confirmButtonText: "Ya, Reject",
        confirmButtonColor: "#107254",
      },
    }[action];

    const result = await Swal.fire({
      ...confirmation,
      icon: "question",
      showCancelButton: true,
      cancelButtonText: "Batal",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const responseMessage = await runProdukApprovalAction(action);
      refetchDetailProduk();
      refetch();
      toast.add({
        title:
          action === "submit"
            ? "Produk berhasil disubmit"
            : action === "approve"
              ? "Produk berhasil disetujui"
              : "Produk berhasil ditolak",
        description:
          responseMessage ??
          (action === "submit"
            ? "Produk telah dikirim untuk proses approval."
            : action === "approve"
              ? "Produk telah disetujui."
              : "Produk telah ditolak."),
        type: "success",
        timeout: 5000,
      });
    } catch (approvalError: unknown) {
      toast.add({
        title:
          action === "submit"
            ? "Produk gagal disubmit"
            : action === "approve"
              ? "Produk gagal disetujui"
              : "Produk gagal ditolak",
        description:
          approvalError instanceof Error
            ? approvalError.message
            : "Terjadi kesalahan saat memproses approval produk.",
        type: "error",
        timeout: 6000,
      });
    }
  };

  const kategoriOptions = {
    items: kategoriProduk,
    search: kategoriSearch,
    onSearchChange: setKategoriSearch,
    loading: loadingKategoriProduk,
    error: kategoriProdukError,
  };
  const departemenOptions = {
    items: departemen,
    search: searchDepartemen,
    onSearchChange: setSearchDepartemen,
    loading: loadingDepartemen,
    error: departemenError,
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
                  Master Produk
                </h1>
              </div>
              <p className="ml-6 text-xs text-slate-500 dark:text-slate-400">
                Daftar produk
              </p>
            </div>

            <div className="flex w-full items-center gap-3 lg:w-auto">
              <div className="w-full lg:w-96">
                <FilterBar
                  search={searchData}
                  onSearchChange={setSearchData}
                  active={Boolean(
                    filterData.filter.department_id ||
                    filterData.filter.product_category_id ||
                    filterData.filter.status ||
                    filterData.filter.is_active,
                  )}
                  onReset={resetFilters}
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
                          setFilterData((current) => ({
                            ...current,
                            filter: {
                              ...current.filter,
                              department_id: item?.id_dept ?? "",
                            },
                          }));
                          setSearchDepartemen("");
                          setDepartemenPickerOpen(false);
                        }}
                      />
                    </div>

                    <div className="w-full">
                      <FilterSearchable<KategoriProdukRecord>
                        label="Kategori Produk"
                        open={kategoriFilterOpen}
                        onOpenChange={setKategoriFilterOpen}
                        search={kategoriSearch}
                        onSearchChange={setKategoriSearch}
                        placeholder="Semua"
                        selectedLabel={selectedKategoriFilter?.name}
                        selectedKey={
                          selectedKategoriFilter
                            ? String(selectedKategoriFilter.id)
                            : null
                        }
                        emptyText={
                          loadingKategoriProduk
                            ? "Memuat kategori produk..."
                            : (kategoriProdukError ?? "Kategori produk tidak ditemukan")
                        }
                        items={kategoriProduk}
                        getKey={(kategori) => String(kategori.id)}
                        renderItem={(kategori) => kategori.name}
                        onSelect={(kategori) => {
                          setSelectedKategoriFilter(kategori);
                          setFilterData((current) => ({
                            ...current,
                            filter: {
                              ...current.filter,
                              product_category_id: kategori
                                ? String(kategori.id)
                                : "",
                            },
                          }));
                          setKategoriSearch("");
                          setKategoriFilterOpen(false);
                        }}
                      />
                    </div>

                    <div className="w-full">
                      <FilterSelect
                        label="Status Approval"
                        value={filterData.filter.status}
                        onChange={(status) =>
                          setFilterData((current) => ({
                            ...current,
                            filter: { ...current.filter, status },
                          }))
                        }
                        placeholder="Semua"
                        options={[
                          { value: "Draft", label: "Draft" },
                          {
                            value: "waiting_sales_spv_or_manager",
                            label: "Menunggu Persetujuan SPV\/Manager Sales",
                          },
                          {
                            value: "waiting_finance",
                            label: "Waiting Finance",
                          },
                          {
                            value: "done",
                            label: "Done",
                          },
                        ]}
                      />
                    </div>

                    <div className="w-full">
                      <FilterSelect
                        label="Status Produk"
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
                {canCreateProduk && (
                  <Button
                    variant="primer"
                    onClick={handleOpenCreateProduk}
                  >
                    <FaPlus className="text-[16px]" />
                    Tambah
                  </Button>
                )}
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
              Memuat data produk...
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
                  titleLabel="Produk"
                  icon={<FaBox className="h-5 w-5" aria-hidden="true" />}
                  emptyTitle="Belum ada data produk"
                  emptyDescription="Data produk akan ditampilkan di sini."
                />
              </div>
            </>
          )}
        </div>
      </section>

      <DetailMasterProduk
        open={isDetailMasterOpen}
        produk={detailProduk}
        loading={loadingDetail}
        error={detailError}
        canApprove={canApprove}
        checkingApprovalPermission={checkingApprovalPermission}
        approvalPermissionError={approvalPermissionError}
        loadingApprovalAction={loadingApprovalAction}
        onApprovalAction={handleProdukApprovalAction}
        onClose={() => {
          setIsDetailMasterOpen(false);
          setSelectedProdukId(null);
        }}
      />
      <CreateMasterProduk
        open={isCreateMasterOpen}
        onClose={handleCloseCreateProduk}
        onSubmit={handleCreateProduk}
        submitting={submittingProduk}
        submitError={createProdukError}
        kategoriOptions={kategoriOptions}
        departemenOptions={departemenOptions}
      />
      <EditMasterProduk
        open={isEditMasterOpen}
        produk={editProdukDetail}
        loadingProduk={loadingEditProduk}
        produkError={loadEditProdukError}
        submitting={submittingEditProduk}
        submitError={editProdukError}
        kategoriOptions={kategoriOptions}
        departemenOptions={departemenOptions}
        onClose={handleCloseEditProduk}
        onSubmit={handleUpdateProduk}
      />
      {canCreateProduk && (
        <MobileFloatingActionButton
          ariaLabel="Tambah Produk"
          onClick={handleOpenCreateProduk}
        />
      )}
    </>
  );
}
