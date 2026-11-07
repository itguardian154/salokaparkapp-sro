
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTable } from "@tanstack/react-table";
import type {
  ColumnVisibilityState,
  PaginationState,
} from "@tanstack/react-table";
import { FaPlus, FaDatabase } from "react-icons/fa6";

import FilterBar from "@/components/Filter/filter-bar";
import FilterSelect from "@/components/Filter/filter-select";
import ColumnVisibility from "@/components/data-table/column-visibility";
import DataTable from "@/components/data-table/data-table";
import TablePagination from "@/components/data-table/table-pagination";
import { dataTableFeatures } from "@/components/data-table/table-features";
import MobileDataCard from "@/components/data-table/mobile-data-card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import MobileFloatingActionButton from "@/components/mobile-floating-action-button";

import { getMasterSegmentColumns } from "../columns";
import CreateMasterSegment from "../components/create-segment";
import UpdateMasterSegment from "../components/update-segment";
import DetailMasterSegment from "../components/detail-segment";
import {
  getSegments,
  getSegmentById,
  createSegment,
 updateMasterSegment,
} from "../service/master-segment-service";

import type {
  Segment,
  SegmentDetailRecord,
  CreateSegmentPayload,
  UpdateSegmentPayload,
} from "../types/master-segment";



type MasterSegmentPageProps = {
  canEdit?: boolean;
};

export default function MasterSegmentPage({
  canEdit = true,
}: MasterSegmentPageProps) {
  // DATA SEGMENT
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // SEARCH DAN FILTER
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // PAGINATION
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // COLUMN VISIBILITY
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});

  // MODAL
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // DATA DETAIL DAN EDIT
  const [selectedSegment, setSelectedSegment] =
    useState<SegmentDetailRecord | null>(null);

  const [selectedEditSegment, setSelectedEditSegment] =
    useState<SegmentDetailRecord | null>(null);

  // LOADING
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);

  // GET LIST SEGMENT
  const fetchSegments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getSegments();
      setSegments(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data Master Segment.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSegments();
  }, [fetchSegments]);

  // FILTER DATA
  const filteredSegments = useMemo(() => {
    return segments.filter((segment) => {
      const matchesSearch = segment.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesStatus =
        statusFilter === null ||
        String(segment.is_active) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [segments, search, statusFilter]);

  // PAGINATION DATA
  const totalData = filteredSegments.length;
  const totalPages = Math.ceil(totalData / perPage);

  const paginatedSegments = useMemo(() => {
    const start = (page - 1) * perPage;

    return filteredSegments.slice(start, start + perPage);
  }, [filteredSegments, page, perPage]);

  // AMBIL DETAIL SEGMENT
  const handleOpenDetail = useCallback(async (segment: Segment) => {
    setSelectedSegment(null);
    setIsDetailOpen(true);
    setLoadingDetail(true);

    try {
      const response = await getSegmentById(segment.id);
      setSelectedSegment(response);
    } catch (err: unknown) {
      console.error("Gagal mengambil detail segment:", err);

      setIsDetailOpen(false);

      toast.add({
        title: "Gagal memuat detail segment",
        description:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil detail segment.",
        type: "error",
        timeout: 6000,
      });
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // AMBIL DATA TERBARU UNTUK EDIT
  const handleOpenEdit = useCallback(async (segment: Segment) => {
    setSelectedEditSegment(null);
    setIsEditOpen(true);
    setLoadingEdit(true);

    try {
      const response = await getSegmentById(segment.id);
      setSelectedEditSegment(response);
    } catch (err: unknown) {
      console.error("Gagal mengambil data edit segment:", err);

      setIsEditOpen(false);

      toast.add({
        title: "Gagal memuat data segment",
        description:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil data segment.",
        type: "error",
        timeout: 6000,
      });
    } finally {
      setLoadingEdit(false);
    }
  }, []);

  // COLUMNS
  const columns = useMemo(
    () =>
      getMasterSegmentColumns(
        handleOpenDetail,
        handleOpenEdit,
        canEdit,
      ),
    [handleOpenDetail, handleOpenEdit, canEdit],
  );

  // CREATE SEGMENT
  const handleCreateSegment = async (
    payload: CreateSegmentPayload,
  ): Promise<void> => {
    try {
      setSubmitting(true);

      await createSegment(payload);

      setIsCreateOpen(false);
      setPage(1);

      await fetchSegments();

      toast.add({
        title: "Segment berhasil dibuat",
        description: "Master segment baru berhasil ditambahkan.",
        type: "success",
        timeout: 4000,
      });
    } catch (err: unknown) {
      console.error("Gagal membuat segment:", err);

      toast.add({
        title: "Segment gagal dibuat",
        description:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat menyimpan master segment.",
        type: "error",
        timeout: 6000,
      });

      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // UPDATE SEGMENT
  const handleUpdateSegment = async (
    id: number,
    payload: UpdateSegmentPayload,
  ): Promise<void> => {
    try {
      setUpdating(true);

      await updateMasterSegment(id, payload);

      setIsEditOpen(false);
      setSelectedEditSegment(null);

      await fetchSegments();

      toast.add({
        title: "Segment berhasil diperbarui",
        description: "Perubahan data segment berhasil disimpan.",
        type: "success",
        timeout: 4000,
      });
    } catch (err: unknown) {
      console.error("Gagal memperbarui segment:", err);

      toast.add({
        title: "Segment gagal diperbarui",
        description:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memperbarui data segment.",
        type: "error",
        timeout: 6000,
      });

      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // BUKA MODAL TAMBAH
  const handleOpenCreate = () => {
    setIsCreateOpen(true);
  };

  // TUTUP MODAL TAMBAH
  const handleCloseCreate = () => {
    if (submitting) return;

    setIsCreateOpen(false);
  };

  // TUTUP MODAL EDIT
  const handleCloseEdit = () => {
    if (updating || loadingEdit) return;

    setIsEditOpen(false);
    setSelectedEditSegment(null);
  };

  // RESET FILTER
  const resetFilters = () => {
    setSearch("");
    setStatusFilter(null);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const hasActiveFilters = statusFilter !== null;

  // PAGINATION TABLE
  const pagination: PaginationState = {
    pageIndex: page - 1,
    pageSize: perPage,
  };

  const table = useTable({
    features: dataTableFeatures,
    data: paginatedSegments,
    columns,
    state: {
      columnVisibility,
      pagination,
    },
    manualPagination: true,
    pageCount: Math.max(totalPages, 1),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const nextPagination =
        typeof updater === "function"
          ? updater(pagination)
          : updater;

      if (nextPagination.pageSize !== pagination.pageSize) {
        setPerPage(nextPagination.pageSize);
        setPage(1);
      } else if (
        nextPagination.pageIndex !== pagination.pageIndex
      ) {
        setPage(nextPagination.pageIndex + 1);
      }
    },
  });

  const rows = table.getRowModel().rows;

  const from = totalData === 0 ? 0 : (page - 1) * perPage + 1;
  const to = totalData === 0 ? 0 : from + rows.length - 1;

  return (
    <>
      <section className="min-w-0 space-y-5">
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {/* HEADER */}
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FaDatabase
                  className="text-emerald-500"
                  aria-hidden="true"
                />

                <h1 className="text-lg font-bold text-slate-800 dark:text-white">
                  Master Segment
                </h1>
              </div>

              <p className="ml-6 text-xs text-slate-500 dark:text-slate-400">
                Kelola data segment, detail, dan sub detail
              </p>
            </div>

            <div className="flex w-full items-center gap-3 lg:w-auto">
              {/* FILTER DAN SEARCH */}
              <div className="w-full lg:w-96">
                <FilterBar
                  search={search}
                  onSearchChange={handleSearchChange}
                  active={hasActiveFilters}
                  onReset={resetFilters}
                >
                  <div className="grid w-full grid-cols-1 gap-4">
                    <div className="w-full">
                      <FilterSelect
                        label="Status Segment"
                        value={statusFilter ?? ""}
                        onChange={(value) => {
                          setStatusFilter(
                            value === "" ? null : value,
                          );
                          setPage(1);
                        }}
                        placeholder="Semua"
                        options={[
                          { value: "true", label: "Aktif" },
                          { value: "false", label: "Nonaktif" },
                        ]}
                      />
                    </div>
                  </div>
                </FilterBar>
              </div>

              {/* ACTION */}
              <div className="hidden gap-2 xl:flex">
                <Button
                  variant="primer"
                  onClick={handleOpenCreate}
                >
                  <FaPlus className="text-[16px]" />
                  Tambah
                </Button>
              </div>
            </div>
          </div>

          {/* PAGINATION DAN COLUMN VISIBILITY */}
          <div className="border-b bg-slate-50/50 px-4 py-2 dark:border-slate-700 dark:bg-slate-900/30 sm:px-6">
            <TablePagination
              leftSlot={<ColumnVisibility table={table} />}
              itemPerPage={perPage}
              setItemPerPage={(value) => {
                setPerPage(value);
                setPage(1);
              }}
              currentPage={page}
              lastPage={Math.max(totalPages, 1)}
              fromPage={from}
              toPage={to}
              totalData={totalData}
              onPrev={() => table.previousPage()}
              onNext={() => table.nextPage()}
            />
          </div>

          {/* TABLE */}
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Memuat data segment...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <p className="text-sm text-red-500">{error}</p>

              <Button
                variant="blue"
                onClick={() => void fetchSegments()}
              >
                Coba Lagi
              </Button>
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <DataTable
                  table={table}
                  cellClassName="px-3 py-2"
                />
              </div>

              <div className="p-3 md:hidden">
                <MobileDataCard
                  table={table}
                  titleKey="name"
                />
              </div>

              {totalData === 0 && (
                <div className="p-8 text-center text-sm text-slate-500">
                  Data segment tidak ditemukan.
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CREATE SEGMENT */}
      <CreateMasterSegment
        open={isCreateOpen}
        onClose={handleCloseCreate}
        onSubmit={handleCreateSegment}
        submitting={submitting}
      />

      {/* FLOATING BUTTON MOBILE */}
      <MobileFloatingActionButton
        ariaLabel="Tambah Segment"
        onClick={handleOpenCreate}
      />

      {/* DETAIL SEGMENT */}
      <DetailMasterSegment
        open={isDetailOpen}
        segment={selectedSegment}
        onClose={() => {
          if (loadingDetail) return;

          setIsDetailOpen(false);
          setSelectedSegment(null);
        }}
      />

      {/* EDIT SEGMENT */}
      <UpdateMasterSegment
        open={isEditOpen}
        onClose={handleCloseEdit}
        segment={selectedEditSegment}
        submitting={updating || loadingEdit}
        onSubmit={handleUpdateSegment}
      />
    </>
  );
}

