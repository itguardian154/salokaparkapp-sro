import { useEffect, useMemo, useState } from "react";
import { useTable } from "@tanstack/react-table";
import type {
  ColumnVisibilityState,
  PaginationState,
} from "@tanstack/react-table";
import { FaDownload, FaFileInvoice, FaPlus } from "react-icons/fa6";

import FilterBar from "@/components/Filter/filter-bar";
import FilterSearchable from "@/components/Filter/filter-searchable";
import ColumnVisibility from "@/components/data-table/column-visibility";
import DataTable from "@/components/data-table/data-table";
import TablePagination from "@/components/data-table/table-pagination";
import { dataTableFeatures } from "@/components/data-table/table-features";
import { Button } from "@/components/ui/button";

import { getMasterAgentColumns } from "../columns";
import CreateMasterAgent from "../components/create-agen";
import DetailMasterAgent from "../components/detail-agen";
import type { DataTableRecord } from "../types/datatable";

const masterAgentData: DataTableRecord[] = [
  {
    id: 1,
    nama_travel: "PT Saloka Wisata",
    name_customer: "salokawisata@gmail.com",
    no_telepon: "081234567890",
    city: "Semarang",
    asosiasi: "ASSPI",
    is_active: true,
  },
  {
    id: 2,
    nama_travel: "CV Maju Bersama",
    name_customer: "majubersama@gmail.com",
    no_telepon: "081298765432",
    city: "Kendal",
    asosiasi: "GIPI",
    is_active: false,
  },
];

export default function MasterAgentPage() {
  const [search, setSearch] = useState("");

  const [agentFilter, setAgentFilter] = useState<string | null>(null);
  const [agentSearch, setAgentSearch] = useState("");
  const [agentPickerOpen, setAgentPickerOpen] = useState(false);

  const [isCreateMasterOpen, setIsCreateMasterOpen] = useState(false);
  const [isDetailMasterOpen, setIsDetailMasterOpen] = useState(false);

  const [selectedAgent, setSelectedAgent] =
    useState<DataTableRecord | null>(null);

  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });

  // Opsi filter agen
  const agentOptions = useMemo(
    () => [...new Set(masterAgentData.map((agent) => agent.nama_travel))],
    [],
  );

  // Kolom tabel
  const columns = useMemo(
    () =>
      getMasterAgentColumns((agent) => {
        setSelectedAgent(agent);
        setIsDetailMasterOpen(true);
      }),
    [],
  );

  // Search dan filter data
  const filteredData = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return masterAgentData.filter((agent) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          agent.nama_travel,
          agent.name_customer,
          agent.no_telepon,
          agent.city,
          agent.asosiasi,
          agent.is_active ? "aktif" : "inactive",
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(normalizedSearch),
        );

      const matchesAgent =
        !agentFilter || agent.nama_travel === agentFilter;

      return matchesSearch && matchesAgent;
    });
  }, [search, agentFilter]);

  // Reset halaman ketika filter berubah
  useEffect(() => {
    setPagination((current) => ({
      ...current,
      pageIndex: 0,
    }));
  }, [search, agentFilter]);

  // Reset filter
  const resetFilters = () => {
    setAgentFilter(null);
    setAgentSearch("");
  };

  const hasActiveFilters = Boolean(agentFilter);

  // Konfigurasi tabel
  const table = useTable({
    features: dataTableFeatures,
    data: filteredData,
    columns,
    state: {
      columnVisibility,
      pagination,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
  });

  const rows = table.getRowModel().rows;

  const currentPage = pagination.pageIndex + 1;
  const totalPages = Math.max(table.getPageCount(), 1);

  const from =
    rows.length === 0
      ? 0
      : pagination.pageIndex * pagination.pageSize + 1;

  const to =
    pagination.pageIndex * pagination.pageSize + rows.length;

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
              {/* FILTER */}
              <div className="w-full lg:w-96">
                <FilterBar
                  search={search}
                  onSearchChange={(event) =>
                    setSearch(event.target.value)
                  }
                  active={hasActiveFilters}
                  onReset={resetFilters}
                >
                  <div className="grid w-full grid-cols-1 gap-3">
                    <FilterSearchable<string>
                      label="Agen"
                      open={agentPickerOpen}
                      onOpenChange={setAgentPickerOpen}
                      search={agentSearch}
                      onSearchChange={setAgentSearch}
                      placeholder="Semua agen"
                      selectedLabel={agentFilter}
                      selectedKey={agentFilter}
                      items={agentOptions.filter((name) =>
                        name
                          .toLowerCase()
                          .includes(agentSearch.trim().toLowerCase()),
                      )}
                      getKey={(name) => name}
                      renderItem={(name) => name}
                      onSelect={(name) => {
                        setAgentFilter(name);
                        setAgentPickerOpen(false);
                        setAgentSearch("");
                      }}
                    />
                  </div>
                </FilterBar>
              </div>

              {/* ACTION */}
              <div className="hidden gap-2 xl:flex">
                <Button
                  variant="primer"
                  onClick={() => setIsCreateMasterOpen(true)}
                >
                  <FaPlus className="text-[16px]" />
                  Tambah
                </Button>

                <Button
                  variant="blue"
                  onClick={() => {
                    // TODO: export master agen
                  }}
                >
                  <FaDownload size={14} />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* PAGINATION + COLUMN */}
          <div className="border-b bg-slate-50/50 px-4 py-2 dark:border-slate-700 dark:bg-slate-900/30 sm:px-6">
            <TablePagination
              leftSlot={<ColumnVisibility table={table} />}
              itemPerPage={pagination.pageSize}
              setItemPerPage={table.setPageSize}
              currentPage={currentPage}
              lastPage={totalPages}
              fromPage={from}
              toPage={to}
              totalData={filteredData.length}
              onPrev={() => table.previousPage()}
              onNext={() => table.nextPage()}
            />
          </div>

          {/* TABLE */}
          <DataTable table={table} cellClassName="px-3 py-2" />
        </div>
      </section>

      {/* CREATE */}
      <CreateMasterAgent
        open={isCreateMasterOpen}
        onClose={() => setIsCreateMasterOpen(false)}
        onSubmit={() => {
          setIsCreateMasterOpen(false);
        }}
      />

      {/* DETAIL */}
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
