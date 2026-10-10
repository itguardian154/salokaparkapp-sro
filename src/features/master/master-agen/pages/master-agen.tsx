import { useMemo, useState } from "react";
import { useTable } from "@tanstack/react-table";
import type {
  ColumnVisibilityState,
  PaginationState,
} from "@tanstack/react-table";
import { FaFileInvoice, FaPlus } from "react-icons/fa6";

import FilterBar from "@/components/Filter/filter-bar";
import FilterSearchable from "@/components/Filter/filter-searchable";
import ColumnVisibility from "@/components/data-table/column-visibility";
import DataTable from "@/components/data-table/data-table";
import TablePagination from "@/components/data-table/table-pagination";
import { dataTableFeatures } from "@/components/data-table/table-features";
import MobileDataCard from "@/components/data-table/mobile-data-card";
import { Button } from "@/components/ui/button";

import { getMasterAgentColumns } from "../columns";
import CreateMasterAgent from "../components/create-agen";
import DetailMasterAgent from "../components/detail-agen";
import { useMasterAgent } from "../hooks/use-master-agen";
import {
  createMasterAgent,
  getMasterAgentDetail,
} from "../service/master-agen-service";
import type {
  Agent,
  AgentDetail,
  CreateMasterAgentPayload,
} from "../types/master-agen";

export default function MasterAgentPage() {
  // Filter asosiasi
  const [associationFilter, setAssociationFilter] = useState<string | null>(
    null,
  );
  const [associationSearch, setAssociationSearch] = useState("");
  const [associationPickerOpen, setAssociationPickerOpen] = useState(false);

  // Filter kota
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [citySearch, setCitySearch] = useState("");
  const [cityPickerOpen, setCityPickerOpen] = useState(false);

  // Filter status
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [statusSearch, setStatusSearch] = useState("");
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);

  // Modal
  const [isCreateMasterOpen, setIsCreateMasterOpen] = useState(false);
  const [isDetailMasterOpen, setIsDetailMasterOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentDetail | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Visibilitas kolom
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});

  // Data agen dan parameter filter API
  const {
    agents,
    loading,
    error,
    search,
    page,
    perPage,
    totalPages,
    totalData,
    setSearch,
    setPage,
    setPerPage,
    refetch,
  } = useMasterAgent({
    city: cityFilter ?? undefined,
    association_name: associationFilter ?? undefined,
    is_active:
      statusFilter === null ? undefined : statusFilter === "true",
  });

  const pagination: PaginationState = {
    pageIndex: page - 1,
    pageSize: perPage,
  };

  // Opsi kota dari response API
  const cityOptions = useMemo<string[]>(
    () => [
      ...new Set(
        agents
          .map((agent) =>
            typeof agent.city === "string"
              ? agent.city
              : agent.city?.name ?? "",
          )
          .filter((city) => city.trim() !== ""),
      ),
    ],
    [agents],
  );

  const filteredCityOptions = useMemo(
    () =>
      cityOptions.filter((city) =>
        city.toLowerCase().includes(citySearch.trim().toLowerCase()),
      ),
    [cityOptions, citySearch],
  );

  // Opsi asosiasi
  const associationOptions = useMemo(
    () => [
      ...new Set(
        agents
          .map((agent) => agent.association_name)
          .filter((name): name is string => Boolean(name)),
      ),
    ],
    [agents],
  );

  const filteredAssociationOptions = useMemo(
    () =>
      associationOptions.filter((name) =>
        name.toLowerCase().includes(associationSearch.trim().toLowerCase()),
      ),
    [associationOptions, associationSearch],
  );

  // Opsi status
  const statusOptions = useMemo(() => ["true", "false"], []);

  const filteredStatusOptions = useMemo(
    () =>
      statusOptions.filter((status) => {
        const label = status === "true" ? "Aktif" : "Nonaktif";

        return label.toLowerCase().includes(statusSearch.trim().toLowerCase());
      }),
    [statusOptions, statusSearch],
  );

  // Buka detail agen
  const handleOpenDetail = async (agent: Agent) => {
    try {
      const response = await getMasterAgentDetail(agent.id);

      setSelectedAgent(response.data);
      setIsDetailMasterOpen(true);
    } catch (error) {
      console.error("Gagal mengambil detail agen:", error);
    }
  };

  const columns = useMemo(
    () => getMasterAgentColumns(handleOpenDetail),
    [],
  );

  // Submit agen baru ke API
  const handleCreateAgent = async (
    payload: CreateMasterAgentPayload,
  ) => {
    if (isCreating) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      await createMasterAgent(payload);

      setIsCreateMasterOpen(false);
      setPage(1);

      await refetch();
    } catch (error: unknown) {
      console.error("Gagal membuat agen:", error);

      setCreateError(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan data agen. Silakan coba lagi.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Pencarian
  const handleSearchChange = (value: string) => {
    setPage(1);
    setSearch(value);
  };

  // Reset semua filter
  const resetFilters = () => {
    setAssociationFilter(null);
    setAssociationSearch("");
    setAssociationPickerOpen(false);

    setCityFilter(null);
    setCitySearch("");
    setCityPickerOpen(false);

    setStatusFilter(null);
    setStatusSearch("");
    setStatusPickerOpen(false);

    setSearch("");
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    associationFilter || cityFilter || statusFilter !== null,
  );

  // Tabel menggunakan data hasil API
  const table = useTable({
    features: dataTableFeatures,
    data: agents,
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
      } else if (nextPagination.pageIndex !== pagination.pageIndex) {
        setPage(nextPagination.pageIndex + 1);
      }
    },
  });

  const rows = table.getRowModel().rows;
  const from = rows.length === 0 ? 0 : (page - 1) * perPage + 1;
  const to = rows.length === 0 ? 0 : from + rows.length - 1;

  return (
    <>
      <section className="min-w-0 space-y-5">
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {/* HEADER */}
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FaFileInvoice
                  className="text-emerald-500"
                  aria-hidden="true"
                />
                <h1 className="text-lg font-bold text-slate-800 dark:text-white">
                  Master Agen
                </h1>
              </div>

              <p className="ml-6 text-xs text-slate-500 dark:text-slate-400">
                Kelola data agen
              </p>
            </div>

            <div className="flex w-full items-center gap-3 lg:w-auto">
              {/* SEARCH DAN FILTER */}
              <div className="w-full lg:w-96">
                <FilterBar
                  search={search}
                  onSearchChange={(event) =>
                    handleSearchChange(event.target.value)
                  }
                  active={hasActiveFilters}
                  onReset={resetFilters}
                >
                  <div className="grid w-full grid-cols-2 gap-4">
                    {/* FILTER KOTA */}
                    <div className="w-full">
                      <FilterSearchable<string>
                        label="Kota"
                        open={cityPickerOpen}
                        onOpenChange={setCityPickerOpen}
                        search={citySearch}
                        onSearchChange={setCitySearch}
                        placeholder="Semua kota"
                        selectedLabel={cityFilter}
                        selectedKey={cityFilter}
                        items={filteredCityOptions}
                        getKey={(city) => city}
                        renderItem={(city) => city}
                        onSelect={(city) => {
                          setCityFilter(city);
                          setPage(1);
                          setCityPickerOpen(false);
                          setCitySearch("");
                        }}
                      />
                    </div>

                    {/* FILTER ASOSIASI */}
                    <div className="w-full">
                      <FilterSearchable<string>
                        label="Asosiasi"
                        open={associationPickerOpen}
                        onOpenChange={setAssociationPickerOpen}
                        search={associationSearch}
                        onSearchChange={setAssociationSearch}
                        placeholder="Semua asosiasi"
                        selectedLabel={associationFilter}
                        selectedKey={associationFilter}
                        items={filteredAssociationOptions}
                        getKey={(name) => name}
                        renderItem={(name) => name}
                        onSelect={(name) => {
                          setAssociationFilter(name);
                          setPage(1);
                          setAssociationPickerOpen(false);
                          setAssociationSearch("");
                        }}
                      />
                    </div>

                    {/* FILTER STATUS */}
                    <div className="w-full">
                      <FilterSearchable<string>
                        label="Status"
                        open={statusPickerOpen}
                        onOpenChange={setStatusPickerOpen}
                        search={statusSearch}
                        onSearchChange={setStatusSearch}
                        placeholder="Semua status"
                        selectedLabel={
                          statusFilter === "true"
                            ? "Aktif"
                            : statusFilter === "false"
                              ? "Nonaktif"
                              : null
                        }
                        selectedKey={statusFilter}
                        items={filteredStatusOptions}
                        getKey={(status) => status}
                        renderItem={(status) =>
                          status === "true" ? "Aktif" : "Nonaktif"
                        }
                        onSelect={(status) => {
                          setStatusFilter(status);
                          setPage(1);
                          setStatusPickerOpen(false);
                          setStatusSearch("");
                        }}
                      />
                    </div>
                  </div>
                </FilterBar>
              </div>

              {/* ACTION */}
              <div className="hidden gap-2 xl:flex">
                <Button
                  variant="primer"
                  onClick={() => {
                    setCreateError(null);
                    setIsCreateMasterOpen(true);
                  }}
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
              setItemPerPage={table.setPageSize}
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
              Memuat data agen...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <p className="text-sm text-red-500">{error}</p>
              <Button variant="blue" onClick={() => void refetch()}>
                Coba Lagi
              </Button>
            </div>
          ) : (
            <>
              {/* Tampilan desktop */}
              <div className="hidden md:block">
                <DataTable table={table} cellClassName="px-3 py-2" />
              </div>

              {/* Tampilan mobile */}
              <div className="p-3 md:hidden">
                <MobileDataCard table={table} titleKey="name" />
              </div>
            </>
          )}
        </div>
      </section>

      {/* CREATE AGEN */}
      <CreateMasterAgent
        open={isCreateMasterOpen}
        onClose={() => {
          if (isCreating) return;

          setCreateError(null);
          setIsCreateMasterOpen(false);
        }}
        onSubmit={handleCreateAgent}
      />

      {/* Pesan error submit */}
      {createError && (
        <div
          role="alert"
          className="fixed bottom-5 right-5 z-[100] max-w-md rounded-lg border border-red-200 bg-white p-4 text-sm text-red-600 shadow-lg dark:border-red-800 dark:bg-slate-800"
        >
          <div className="flex items-start justify-between gap-4">
            <p>{createError}</p>
            <button
              type="button"
              aria-label="Tutup pesan"
              onClick={() => setCreateError(null)}
              className="font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* FLOATING BUTTON TAMBAH AGEN - MOBILE */}
      <button
        type="button"
        onClick={() => {
          setCreateError(null);
          setIsCreateMasterOpen(true);
        }}
        aria-label="Tambah Agen"
        className="fixed bottom-6 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-all hover:bg-emerald-700 active:scale-95 md:hidden"
      >
        <FaPlus className="text-xl" />
      </button>

      {/* DETAIL AGEN */}
      <DetailMasterAgent
        open={isDetailMasterOpen}
        agent={selectedAgent}
        onClose={() => {
          setIsDetailMasterOpen(false);
          setSelectedAgent(null);
        }}
      />
    </>
  );
}
