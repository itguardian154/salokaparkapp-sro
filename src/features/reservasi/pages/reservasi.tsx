
import { dataTableFeatures } from "@/components/data-table/table-features";
import FilterBar from "@/components/Filter/filter-bar";
import FilterSelect from "@/components/Filter/filter-select";
import FilterSearchable from "@/components/Filter/filter-searchable";
import DateRangePicker from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/data-table/data-table";
import MobileDataCard from "@/components/data-table/mobile-data-card";
import ColumnVisibility from "@/components/data-table/column-visibility";
import TablePagination from "@/components/data-table/table-pagination";
import MobileFloatingActionButton from "@/components/mobile-floating-action-button";

import { useTable, type ColumnVisibilityState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { FaBox, FaFileInvoice, FaPlus } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

import { getReservasiColumns } from "../columns";
import useReservasi from "../hooks/use-reservasi";

import { useKaryawan } from "@/features/karyawan/hooks/use-karyawan";
import type { Karyawan } from "@/features/karyawan/types/karyawan";

import useCustomer from "@/features/customers/hooks/use-customer";
import type { CustomerRecord } from "@/features/customers/types/customer";

import { useSegments } from "@/features/master/master-segment/hooks/use-master-segment";
import type { Segment } from "@/features/master/master-segment/types/master-segment";

import useOptionAgent from "@/features/master/master-agen/hooks/use-option-agen";
import type { OptionAgent } from "@/features/master/master-agen/types/master-agen";

import { toLocalDateString } from "@/features/invoice/utils/invoice-form-utils";
import { getAuthSession } from "@/features/auth/utils/auth-storage";

export default function ReservasiPage() {

  const permissions = getAuthSession()?.permissions ?? [];
  const canCreateReservasi = permissions.includes("sales-order.create");
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});

  const navigate = useNavigate();

  // State untuk tampilan dropdown
  const [openSalesFilter, setOpenSalesFilter] = useState(false);
  const [selectedSalesFilter, setSelectedSalesFilter] =
    useState<Karyawan | null>(null);

  const [openCustomerFilter, setOpenCustomerFilter] = useState(false);
  const [selectedCustomerFilter, setSelectedCustomerFilter] =
    useState<CustomerRecord | null>(null);

  const [openSegment, setOpenSegment] = useState(false);
  const [searchSegment, setSearchSegment] = useState("");

  const [openAgenFilter, setOpenAgenFilter] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<OptionAgent | null>(null);

  const [arrivalDateRange, setArrivalDateRange] = useState<DateRange>();

  // Department
  const departmentId = localStorage.getItem("idDepartemen");
  const subDepartmentId = localStorage.getItem("id_sub_dept");

  const columns = useMemo(
    () => getReservasiColumns(departmentId, subDepartmentId),
    [departmentId, subDepartmentId],
  );

  // Get Sales: seluruh data karyawan
  const {
    karyawan,
    searchKaryawan,
    setSearchKaryawan,
    loading: karyawanLoading,
    error: karyawanError,
  } = useKaryawan();

  // Get Customer
  const {
    dataCustomer,
    searchData: customerSearch,
    setSearchData: setCustomerSearch,
    loadingData: customerLoading,
    error: customerError,
  } = useCustomer({ is_active: true });

  // Get Segmen: seluruh master segmen aktif
  const {
    segments,
    loading: segmentsLoading,
    error: segmentsError,
  } = useSegments({ is_active: true });

  // Get Agen
  const {
    optionAgents,
    loading: loadingAgents,
    error: agentsError,
    search: searchAgent,
    setSearch: setSearchAgent,
  } = useOptionAgent({ is_active: true });

  // Get Reservasi dan seluruh state filter dari hook
  const {
    dataReservasi,
    loadingData,
    error,
    searchData,
    setSearchData,
    statusFilter,
    setStatusFilter,

    salesPersonFilter,
    setSalesPersonFilter,
    segmentFilter,
    setSegmentFilter,
    agenFilter,
    setAgenFilter,
    customerIdFilter,
    setCustomerIdFilter,

    setArrivalDateFrom,
    setArrivalDateTo,

    resetFilters,

    itemPerPage,
    setItemPerPage,
    currentPage,
    lastPage,
    totalData,
    fromPage,
    toPage,
    handleNextPage,
    handlePrevPage,
  } = useReservasi();

  // ID agen yang muncul pada data Reservasi
  const reservasiPartnerIds = useMemo(
    () =>
      new Set(
        dataReservasi
          .map((item) => String(item.partner_id ?? ""))
          .filter(Boolean),
      ),
    [dataReservasi],
  );

  // Agen hanya yang muncul di data Reservasi
  const uniqueOptionAgents = useMemo(() => {
    const filteredAgents = optionAgents.filter(
      (agent) =>
        agent.is_active !== false &&
        reservasiPartnerIds.has(String(agent.partner_id)),
    );

    return Array.from(
      new Map(
        filteredAgents.map((agent) => [
          String(agent.partner_id),
          agent,
        ]),
      ).values(),
    );
  }, [optionAgents, reservasiPartnerIds]);

  // ID customer yang muncul pada data Reservasi
  const reservasiCustomerIds = useMemo(
    () =>
      new Set(
        dataReservasi
          .map((item) => String(item.customer_id ?? ""))
          .filter(Boolean),
      ),
    [dataReservasi],
  );

  // Nama Group hanya yang muncul di data Reservasi
  const reservasiCustomers = useMemo(
    () =>
      dataCustomer.filter(
        (customer) =>
          customer.is_active &&
          reservasiCustomerIds.has(String(customer.id)),
      ),
    [dataCustomer, reservasiCustomerIds],
  );

  // Segmen terpilih
  const selectedReservasiSegment = segments.find(
    (item) => String(item.id) === segmentFilter,
  );

  // Table
  const table = useTable({
    features: dataTableFeatures,
    data: dataReservasi,
    columns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  // Reset seluruh filter
  const handleResetFilter = () => {
    resetFilters();

    setSelectedSalesFilter(null);
    setSearchKaryawan("");

    setSelectedAgent(null);
    setSearchAgent("");

    setSelectedCustomerFilter(null);
    setCustomerSearch("");

    setSearchSegment("");

    setArrivalDateRange(undefined);

    setOpenCustomerFilter(false);
    setOpenSegment(false);
    setOpenSalesFilter(false);
    setOpenAgenFilter(false);
  };

  return (
    <>
      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex shrink-0 flex-col gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FaFileInvoice
                  className="text-emerald-500"
                  aria-hidden="true"
                />
                <h1 className="text-lg font-bold text-slate-800 dark:text-white">
                  Reservasi
                </h1>
              </div>

              <p className="ml-6 text-xs text-slate-500 dark:text-slate-400">
                Daftar Reservasi
              </p>
            </div>

            <div className="flex w-full items-center gap-3 lg:w-auto">
              <div className="w-full lg:w-96">
                <FilterBar
                  search={searchData}
                  onSearchChange={setSearchData}
                  active={Boolean(
                    searchData ||
                    statusFilter ||
                    salesPersonFilter ||
                    agenFilter ||
                    segmentFilter ||
                    customerIdFilter ||
                    arrivalDateRange?.from ||
                    arrivalDateRange?.to,
                  )}
                  onReset={handleResetFilter}
                >
                  <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Segmen */}
                    <div className="w-full">
                      <FilterSearchable<Segment>
                        label="Segmen"
                        open={openSegment}
                        onOpenChange={setOpenSegment}
                        search={searchSegment}
                        onSearchChange={setSearchSegment}
                        placeholder="Semua"
                        selectedLabel={selectedReservasiSegment?.name ?? null}
                        selectedKey={segmentFilter || null}
                        emptyText={
                          segmentsLoading
                            ? "Memuat segmen..."
                            : (segmentsError ?? "Segmen tidak ditemukan.")
                        }
                        items={segments.filter((item) =>
                          item.name
                            .toLowerCase()
                            .includes(searchSegment.toLowerCase().trim()),
                        )}
                        getKey={(item) => String(item.id)}
                        renderItem={(item) => item.name}
                        onSelect={(item) => {
                          setSegmentFilter(item ? String(item.id) : "");
                          setSearchSegment("");
                          setOpenSegment(false);
                        }}
                      />
                    </div>

                    {/* Agen */}
                    <div className="w-full">
                      <FilterSearchable<OptionAgent>
                        label="Agen"
                        open={openAgenFilter}
                        onOpenChange={setOpenAgenFilter}
                        search={searchAgent}
                        onSearchChange={setSearchAgent}
                        placeholder="Semua"
                        selectedLabel={selectedAgent?.name ?? null}
                        selectedKey={agenFilter || null}
                        emptyText={
                          loadingAgents
                            ? "Memuat data agen..."
                            : (agentsError ?? "Agen tidak ditemukan.")
                        }
                        items={uniqueOptionAgents}
                        getKey={(agent) => String(agent.partner_id)}
                        renderItem={(agent) => agent.name}
                        onSelect={(agent) => {
                          setSelectedAgent(agent);
                          setAgenFilter(
                            agent ? String(agent.partner_id) : "",
                          );
                          setSearchAgent("");
                          setOpenAgenFilter(false);
                        }}
                      />
                    </div>

                    {/* Sales */}
                    <div className="w-full">
                      <FilterSearchable<Karyawan>
                        label="Sales"
                        open={openSalesFilter}
                        onOpenChange={setOpenSalesFilter}
                        search={searchKaryawan}
                        onSearchChange={setSearchKaryawan}
                        placeholder="Semua"
                        selectedLabel={selectedSalesFilter?.name ?? null}
                        selectedKey={salesPersonFilter || null}
                        emptyText={
                          karyawanLoading
                            ? "Memuat data sales..."
                            : (karyawanError ?? "Sales tidak ditemukan.")
                        }
                        items={karyawan.filter((item) =>
                          item.name
                            .toLowerCase()
                            .includes(searchKaryawan.toLowerCase().trim()),
                        )}
                        getKey={(item) => item.id_absen}
                        renderItem={(item) => item.name}
                        onSelect={(item) => {
                          setSelectedSalesFilter(item);
                          setSalesPersonFilter(item?.id_absen ?? "");
                          setSearchKaryawan("");
                          setOpenSalesFilter(false);
                        }}
                      />
                    </div>

                    {/* Nama Group */}
                    <div className="w-full">
                      <FilterSearchable<CustomerRecord>
                        label="Nama Group"
                        open={openCustomerFilter}
                        onOpenChange={setOpenCustomerFilter}
                        search={customerSearch}
                        onSearchChange={setCustomerSearch}
                        placeholder="Semua"
                        selectedLabel={selectedCustomerFilter?.name ?? null}
                        selectedKey={customerIdFilter || null}
                        emptyText={
                          customerLoading
                            ? "Memuat customer..."
                            : (customerError ?? "Customer tidak ditemukan.")
                        }
                        items={reservasiCustomers.filter((customer) =>
                          customer.name
                            .toLowerCase()
                            .includes(customerSearch.toLowerCase().trim()),
                        )}
                        getKey={(customer) => String(customer.id)}
                        renderItem={(customer) => customer.name}
                        onSelect={(customer) => {
                          setSelectedCustomerFilter(customer);
                          setCustomerIdFilter(
                            customer ? String(customer.id) : "",
                          );
                          setCustomerSearch("");
                          setOpenCustomerFilter(false);
                        }}
                      />
                    </div>

                    {/* Tanggal Kedatangan */}
                    <div className="w-full">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-200">
                          Tanggal Kedatangan
                        </label>

                        <DateRangePicker
                          value={arrivalDateRange}
                          onChange={(range) => {
                            setArrivalDateRange(range);

                            setArrivalDateFrom(
                              range?.from
                                ? toLocalDateString(range.from)
                                : "",
                            );

                            setArrivalDateTo(
                              range?.to
                                ? toLocalDateString(range.to)
                                : "",
                            );
                          }}
                        />
                      </div>
                    </div>

                    {/* Status Reservasi */}
                    <div className="w-full">
                      <FilterSelect
                        label="Status"
                        value={statusFilter}
                        onChange={setStatusFilter}
                        placeholder="Semua"
                        options={[
                          { value: "draft", label: "Draft" },
                          {
                            value: "waiting_sales_spv_or_manager",
                            label: "Menunggu Persetujuan SPV/Manager Sales",
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
                  </div>
                </FilterBar>
              </div>
              {canCreateReservasi && (
                <div className="hidden gap-2 xl:flex">
                  <Button
                    variant="primer"
                    onClick={() => navigate("/reservation/create")}
                  >
                    <FaPlus className="text-[16px]" />
                    Tambah
                  </Button>
                </div>
              )}
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

          <div className="hidden min-h-0 min-w-0 flex-1 flex-col md:flex">
            {error && (
              <p role="alert" className="px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <DataTable
              table={table}
              loading={loadingData}
              cellClassName="px-3 py-2"
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-slate-300/60 scrollbar-track-transparent hover:scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-700 md:hidden">
            {error ? (
              <p
                role="alert"
                className="px-2 py-4 text-center text-sm text-red-600"
              >
                {error}
              </p>
            ) : loadingData ? (
              <p className="px-2 py-8 text-center text-sm text-slate-500">
                Memuat data reservasi...
              </p>
            ) : (
              <MobileDataCard
                table={table}
                titleKey="sales_order_number"
                titleLabel="Reservasi"
                icon={<FaBox className="h-5 w-5" aria-hidden="true" />}
                emptyTitle="Belum ada data reservasi"
                emptyDescription="Data reservasi akan ditampilkan di sini."
              />
            )}
          </div>
        </div>
      </section>
      {canCreateReservasi && (

        <MobileFloatingActionButton
          ariaLabel="Tambah Reservasi"
          onClick={() => navigate("/reservation/create")}
        />
      )}
    </>
  );
}
