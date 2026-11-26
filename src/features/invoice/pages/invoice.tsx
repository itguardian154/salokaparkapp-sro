import { dataTableFeatures } from "@/components/data-table/table-features";
import FilterBar from "@/components/Filter/filter-bar";
import FilterSelect from "@/components/Filter/filter-select";
import { Button } from "@/components/ui/button";
import { useTable, type ColumnVisibilityState } from "@tanstack/react-table";
import { FaBox, FaFileInvoice, FaPlus } from "react-icons/fa6";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import DataTable from "@/components/data-table/data-table";
import MobileDataCard from "@/components/data-table/mobile-data-card";
import ColumnVisibility from "@/components/data-table/column-visibility";
import TablePagination from "@/components/data-table/table-pagination";
import { getInvoiceColumns } from "../columns";
import FilterSearchable from "@/components/Filter/filter-searchable";
import MobileFloatingActionButton from "@/components/mobile-floating-action-button";
import useInvoices from "../hooks/use-invoices";
import { useNavigate } from "react-router-dom";
import { useKaryawan } from "@/features/karyawan/hooks/use-karyawan";
import type { Karyawan } from "@/features/karyawan/types/karyawan";
import useCustomer from "@/features/customers/hooks/use-customer";
import type { CustomerRecord } from "@/features/customers/types/customer";
import { isEligibleInvoiceSales } from "../utils/invoice-sales";
import { useSegments } from "@/features/master/master-segment/hooks/use-master-segment";
import type { Segment } from "@/features/master/master-segment/types/master-segment";
import DateRangePicker from "@/components/date-range-picker";
import { toLocalDateString } from "../utils/invoice-form-utils";
import useOptionAgent from "@/features/master/master-agen/hooks/use-option-agen";
import type { OptionAgent } from "@/features/master/master-agen/types/master-agen";
import { hasPermission } from "@/features/auth/utils/auth-storage";

export default function InvoicePage() {
  const canCreateInvoice = hasPermission("invoice.create");
  const canUpdateInvoice = hasPermission("invoice.update");
  const navigate = useNavigate();
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
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

  // Get Sales
  const {
    karyawan,
    searchKaryawan,
    setSearchKaryawan,
    loading: karyawanLoading,
    error: karyawanError,
  } = useKaryawan();
  const eligibleKaryawan = karyawan.filter(isEligibleInvoiceSales);

  // Get Customer
  const {
    dataCustomer,
    searchData: customerSearch,
    setSearchData: setCustomerSearch,
    loadingData: customerLoading,
    error: customerError,
  } = useCustomer({ is_active: true });

  // Get Segmen
  const {
    segments,
    loading: segmentsLoading,
    error: segmentsError,
  } = useSegments({ is_active: true });

  // Data option agen
  const {
    optionAgents,
    loading: loadingAgents,
    error: agentsError,
    search: searchAgent,
    setSearch: setSearchAgent,
  } = useOptionAgent({ is_active: true });
  const activeOptionAgents = optionAgents.filter(
    (agent) => agent.is_active !== false,
  );
  const uniqueOptionAgents = Array.from(
    new Map(
      activeOptionAgents.map((agent) => [agent.partner_id, agent]),
    ).values(),
  );

  // Get Invoices
  const columns = useMemo(() => getInvoiceColumns(), []);
  const {
    dataInvoices,
    loadingData,
    error,
    searchData,
    setSearchData,
    statusFilter,
    setStatusFilter,
    salesPersonFilter,
    setSalesPersonFilter,
    agenFilter,
    setAgenFilter,
    segmentFilter,
    setSegmentFilter,
    customerIdFilter,
    setCustomerIdFilter,
    setArrivalDateRange: setArrivalDateFilter,
    itemPerPage,
    setItemPerPage,
    currentPage,
    lastPage,
    totalData,
    fromPage,
    toPage,
    handleNextPage,
    handlePrevPage,
  } = useInvoices();

  const selectedInvoiceSegment = segments.find(
    (item) => String(item.id) === segmentFilter,
  );

  // Table
  const table = useTable({
    features: dataTableFeatures,
    data: dataInvoices,
    columns,
    state: {
      columnVisibility,
      pagination: { pageIndex: 0, pageSize: itemPerPage },
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

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
                  search={searchData}
                  onSearchChange={setSearchData}
                  active={Boolean(
                    searchData ||
                    statusFilter ||
                    salesPersonFilter ||
                    agenFilter ||
                    segmentFilter ||
                    customerIdFilter ||
                    arrivalDateRange?.from,
                  )}
                  onReset={() => {
                    setSearchData("");
                    setStatusFilter("");
                    setSalesPersonFilter("");
                    setSelectedSalesFilter(null);
                    setSearchKaryawan("");
                    setAgenFilter("");
                    setSelectedAgent(null);
                    setSearchAgent("");
                    setSelectedCustomerFilter(null);
                    setCustomerSearch("");
                    setCustomerIdFilter("");
                    setOpenCustomerFilter(false);
                    setSegmentFilter("");
                    setSearchSegment("");
                    setArrivalDateRange(undefined);
                    setArrivalDateFilter("", "");
                  }}
                >
                  <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* <div className="w-full">
                      <FilterSearchable<Departemen>
                        label="Departemen"
                        open={false}
                        onOpenChange={() => {}}
                        search=""
                        onSearchChange={() => {}}
                        placeholder="Semua"
                        emptyText="Filter departemen belum tersedia."
                        items={[]}
                        getKey={(item) => item.id_dept}
                        renderItem={(item) => item.departemen}
                        onSelect={() => {}}
                        disabled
                      />
                    </div> */}
                    <div className="w-full">
                      <FilterSearchable<Segment>
                        label="Segmen"
                        open={openSegment}
                        onOpenChange={setOpenSegment}
                        search={searchSegment}
                        onSearchChange={setSearchSegment}
                        placeholder="Semua"
                        selectedLabel={selectedInvoiceSegment?.name ?? null}
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
                        getKey={(agent) => agent.partner_id}
                        renderItem={(agent) => agent.name}
                        onSelect={(agent) => {
                          setSelectedAgent(agent);
                          setAgenFilter(agent?.partner_id ?? "");
                          setSearchAgent("");
                          setOpenAgenFilter(false);
                        }}
                      />
                    </div>
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
                        items={eligibleKaryawan}
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
                        items={dataCustomer.filter(
                          (customer) => customer.is_active,
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
                    <div className="w-full">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-200">
                          Tanggal Kedatangan
                        </label>
                        <DateRangePicker
                          value={arrivalDateRange}
                          onChange={(range) => {
                            setArrivalDateRange(range);
                            if (range?.from && range.to) {
                              setArrivalDateFilter(
                                toLocalDateString(range.from),
                                toLocalDateString(range.to),
                              );
                            } else {
                              setArrivalDateFilter("", "");
                            }
                          }}
                        />
                      </div>
                    </div>
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
              <div className="hidden gap-2 xl:flex">
                {canCreateInvoice && (
                  <Button
                    variant="primer"
                    onClick={() => navigate("/invoice/create")}
                  >
                    <FaPlus className="text-[16px]" />
                    Tambah
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 border-b bg-slate-50/50 px-4 py-2 dark:border-slate-700 dark:bg-slate-900/30 sm:px-6">
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

          <>
            <div className="hidden min-h-0 min-w-0 flex-1 flex-col md:flex">
              <DataTable
                table={table}
                loading={loadingData}
                cellClassName="px-3 py-2"
                containerClassName="scrollbar-thumb-transparent"
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
                  Memuat data invoice...
                </p>
              ) : (
                <MobileDataCard
                  table={table}
                  titleKey="invoice_id"
                  titleLabel="Invoice"
                  icon={<FaBox className="h-5 w-5" aria-hidden="true" />}
                  emptyTitle="Belum ada data invoice"
                  emptyDescription="Data invoice akan ditampilkan di sini."
                />
              )}
            </div>
          </>
        </div>
      </section>

      {canCreateInvoice && (
        <MobileFloatingActionButton
          ariaLabel="Tambah Invoice"
          onClick={() => navigate("/invoice/create")}
        />
      )}
    </>
  );
}
