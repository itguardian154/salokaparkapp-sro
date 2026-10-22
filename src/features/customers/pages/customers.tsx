import { useCallback, useMemo, useState } from "react";
import { useTable } from "@tanstack/react-table";
import type { ColumnVisibilityState } from "@tanstack/react-table";
import { FaDatabase, FaUsers, FaPlus } from "react-icons/fa6";

import { Button } from "@/components/ui/button";

import FilterBar from "@/components/Filter/filter-bar";
import FilterSearchable from "@/components/Filter/filter-searchable";
import FilterSelect from "@/components/Filter/filter-select";

import ColumnVisibility from "@/components/data-table/column-visibility";
import DataTable from "@/components/data-table/data-table";
import TablePagination from "@/components/data-table/table-pagination";
import MobileDataCard from "@/components/data-table/mobile-data-card";
import { dataTableFeatures } from "@/components/data-table/table-features";

import useCustomer from "../hooks/use-customer";
import useCreateCustomer from "../hooks/use-create-customer";

import CreateCustomer from "../components/create-customer";

import { getCustomerColumns } from "../columns";
import type {
  CustomerRecord,
  CreateCustomerPayload,
} from "../types/customer";

interface RegionOption {
  id: string;
  name: string;
}

interface CustomerRegionData {
  province_name?: string | null;
  city_name?: string | null;
}

interface CustomerFilterOption {
  value: string;
  label: string;
}

function getRegionOption(
  customer: CustomerRegionData,
  type: "province" | "city",
): RegionOption | null {
  const name =
    type === "province"
      ? customer.province_name
      : customer.city_name;

  if (!name) {
    return null;
  }

  return {
    id: name,
    name,
  };
}

function getUniqueRegions(
  customers: CustomerRegionData[],
  type: "province" | "city",
): RegionOption[] {
  const uniqueRegions = new Map<string, RegionOption>();

  customers.forEach((customer) => {
    const region = getRegionOption(customer, type);

    if (region) {
      uniqueRegions.set(region.name, region);
    }
  });

  return Array.from(uniqueRegions.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "id"),
  );
}

export default function CustomerPage() {
  const {
    dataCustomer,
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
  } = useCustomer();

  const {
    submit: submitCustomer,
    loading: submittingCreate,
    error: createError,
    clearError: clearCreateError,
  } = useCreateCustomer();

  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});

  // Modal tambah customer
  const [createOpen, setCreateOpen] = useState(false);

  // Filter provinsi dan kota
  const [provincePickerOpen, setProvincePickerOpen] =
    useState(false);
  const [cityPickerOpen, setCityPickerOpen] =
    useState(false);

  const [provinceSearch, setProvinceSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  const [selectedProvince, setSelectedProvince] =
    useState<RegionOption | null>(null);
  const [selectedCity, setSelectedCity] =
    useState<RegionOption | null>(null);

  // Opsi segment dan segment detail.
  // Data dapat dihubungkan ke API nantinya.
  const [segmentOptions] = useState<CustomerFilterOption[]>([]);
  const [segmentDetailOptions] =
    useState<CustomerFilterOption[]>([]);

  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedSegmentDetail, setSelectedSegmentDetail] =
    useState("");

  // Data customer terpilih untuk detail dan edit.
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerRecord | null>(null);

// const [detailOpen, setDetailOpen] = useState(false);
// const [editOpen, setEditOpen] = useState(false);

// const handleDetail = useCallback((record: CustomerRecord) => {
//   setSelectedCustomer(record);
//   setDetailOpen(true);
//   setEditOpen(false);
// }, []);

// const handleEdit = useCallback((record: CustomerRecord) => {
//   setSelectedCustomer(record);
//   setEditOpen(true);
//   setDetailOpen(false);
// }, []);

const handleDetail = useCallback((record: CustomerRecord) => {
  console.log("Detail customer:", record);
}, []);

const handleEdit = useCallback((record: CustomerRecord) => {
  console.log("Edit customer:", record);
}, []);

  // Sesuaikan dengan mekanisme hak akses aplikasi.
  const canEdit = true;

  const customers = useMemo(
    () => (dataCustomer ?? []) as CustomerRecord[],
    [dataCustomer],
  );

  const regionCustomers = useMemo<CustomerRegionData[]>(
    () => customers,
    [customers],
  );

  const provinceOptions = useMemo(
    () => getUniqueRegions(regionCustomers, "province"),
    [regionCustomers],
  );

  const cityOptions = useMemo(() => {
    if (!selectedProvince) {
      return [];
    }

    const filteredCustomers = regionCustomers.filter(
      (customer) =>
        customer.province_name === selectedProvince.name,
    );

    return getUniqueRegions(filteredCustomers, "city");
  }, [regionCustomers, selectedProvince]);

  const columns = useMemo(
    () => getCustomerColumns(handleDetail, handleEdit, canEdit),
    [handleDetail, handleEdit, canEdit],
  );

  const table = useTable({
    features: dataTableFeatures,
    data: customers,
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

  // Buka modal tambah customer.
  const handleOpenCreate = () => {
    clearCreateError();
    setCreateOpen(true);
  };

  // Kirim data customer tanpa attachments atau upload file.
  const handleCreateCustomer = async (
    payload: CreateCustomerPayload,
  ) => {
    await submitCustomer(payload);
  };

  // Tutup modal dan bersihkan error.
  const handleCloseCreate = () => {
    if (submittingCreate) return;

    clearCreateError();
    setCreateOpen(false);
  };

  const resetFilters = () => {
    setSearchData("");

    setFilterData((current) => ({
      ...current,
      filter: {
        ...current.filter,
        segment_id: "",
        segment_detail_id: "",
        province_name: "",
        city_name: "",
        status: "",
        is_active: "",
      },
    }));

    setSelectedSegment("");
    setSelectedSegmentDetail("");
    setSelectedProvince(null);
    setSelectedCity(null);

    setProvinceSearch("");
    setCitySearch("");

    setProvincePickerOpen(false);
    setCityPickerOpen(false);
  };

  const activeFilters = Boolean(
    filterData.filter.segment_id ||
      filterData.filter.segment_detail_id ||
      filterData.filter.province_name ||
      filterData.filter.city_name ||
      filterData.filter.status ||
      filterData.filter.is_active,
  );

  return (
    <section className="min-w-0 space-y-5">
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FaDatabase
                className="text-emerald-500"
                aria-hidden="true"
              />

              <h1 className="text-lg font-bold text-slate-800 dark:text-white">
                Customer
              </h1>
            </div>

            <p className="ml-6 text-xs text-slate-500 dark:text-slate-400">
              Daftar customer
            </p>
          </div>

          {/* Search dan tombol tambah */}
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
            <div className="w-full sm:min-w-0 sm:flex-1 lg:w-96 lg:flex-none">
              <FilterBar
                search={searchData}
                onSearchChange={setSearchData}
                active={activeFilters}
                onReset={resetFilters}
              >
                <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
                  {/* Segment */}
                  <div className="w-full">
                    <FilterSelect
                      label="Segment"
                      value={selectedSegment}
                      onChange={(value) => {
                        setSelectedSegment(value);
                        setSelectedSegmentDetail("");

                        setFilterData((current) => ({
                          ...current,
                          filter: {
                            ...current.filter,
                            segment_id: value,
                            segment_detail_id: "",
                          },
                        }));
                      }}
                      placeholder="Semua"
                      options={segmentOptions}
                    />
                  </div>

                  {/* Segment detail */}
                  <div className="w-full">
                    <FilterSelect
                      label="Segment Detail"
                      value={selectedSegmentDetail}
                      onChange={(value) => {
                        setSelectedSegmentDetail(value);

                        setFilterData((current) => ({
                          ...current,
                          filter: {
                            ...current.filter,
                            segment_detail_id: value,
                          },
                        }));
                      }}
                      placeholder="Semua"
                      options={segmentDetailOptions}
                    />
                  </div>

                  {/* Provinsi */}
                  <div className="w-full">
                    <FilterSearchable<RegionOption>
                      label="Provinsi"
                      open={provincePickerOpen}
                      onOpenChange={setProvincePickerOpen}
                      search={provinceSearch}
                      onSearchChange={setProvinceSearch}
                      placeholder="Semua"
                      selectedLabel={selectedProvince?.name}
                      selectedKey={selectedProvince?.id}
                      emptyText="Provinsi tidak ditemukan pada data customer"
                      items={provinceOptions}
                      getKey={(item) => item.id}
                      renderItem={(item) => item.name}
                      onSelect={(item) => {
                        setSelectedProvince(item);
                        setSelectedCity(null);
                        setCitySearch("");

                        setFilterData((current) => ({
                          ...current,
                          filter: {
                            ...current.filter,
                            province_name: item?.name ?? "",
                            city_name: "",
                          },
                        }));

                        setProvinceSearch("");
                        setProvincePickerOpen(false);
                      }}
                    />
                  </div>

                  {/* Kota */}
                  <div className="w-full">
                    <FilterSearchable<RegionOption>
                      label="Kota"
                      open={cityPickerOpen}
                      onOpenChange={setCityPickerOpen}
                      search={citySearch}
                      onSearchChange={setCitySearch}
                      placeholder="Semua"
                      selectedLabel={selectedCity?.name}
                      selectedKey={selectedCity?.id}
                      emptyText={
                        !selectedProvince
                          ? "Pilih provinsi terlebih dahulu"
                          : "Kota tidak ditemukan pada data customer"
                      }
                      items={cityOptions}
                      getKey={(item) => item.id}
                      renderItem={(item) => item.name}
                      onSelect={(item) => {
                        setSelectedCity(item);

                        setFilterData((current) => ({
                          ...current,
                          filter: {
                            ...current.filter,
                            city_name: item?.name ?? "",
                          },
                        }));

                        setCitySearch("");
                        setCityPickerOpen(false);
                      }}
                    />
                  </div>
                </div>
              </FilterBar>
            </div>

            <Button
              type="button"
              variant="primer"
              onClick={handleOpenCreate}
              className="w-full shrink-0 sm:w-auto"
            >
              <FaPlus size={14} />
              Tambah
            </Button>
          </div>
        </div>

        {/* Pagination dan pengaturan kolom */}
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

        {/* Tabel customer */}
        {error ? (
          <p
            role="alert"
            className="px-4 py-3 text-sm text-red-600"
          >
            {error}
          </p>
        ) : loadingData ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            Memuat data customer...
          </p>
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
                titleLabel="Nama Customer"
                icon={
                  <FaUsers
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                }
                emptyTitle="Belum ada data customer"
                emptyDescription="Data customer akan ditampilkan di sini."
              />
            </div>
          </>
        )}
      </div>

      {/* Modal tambah customer */}
      <CreateCustomer
        open={createOpen}
        onClose={handleCloseCreate}
        onSubmit={handleCreateCustomer}
        submitting={submittingCreate}
        submitError={createError}
      />
    </section>
  );
}
