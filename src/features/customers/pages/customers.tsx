import { useMemo, useState } from "react";
import { useTable } from "@tanstack/react-table";
import type { ColumnVisibilityState } from "@tanstack/react-table";
import { FaDatabase, FaUsers } from "react-icons/fa6";

import FilterBar from "@/components/Filter/filter-bar";
import FilterSearchable from "@/components/Filter/filter-searchable";
import FilterSelect from "@/components/Filter/filter-select";

import ColumnVisibility from "@/components/data-table/column-visibility";
import DataTable from "@/components/data-table/data-table";
import TablePagination from "@/components/data-table/table-pagination";
import MobileDataCard from "@/components/data-table/mobile-data-card";
import { dataTableFeatures } from "@/components/data-table/table-features";

import useMasterCustomer from "../hooks/use-customer";
import { getCustomerColumns } from "../columns";

interface RegionOption {
  id: string | number;
  name: string;
}

interface CustomerRegionData {
  province?: RegionOption | string | null;
  province_id?: string | number | null;
  province_name?: string | null;
  city?: RegionOption | string | null;
  city_id?: string | number | null;
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
  const region = customer[type];

  const regionId =
    region && typeof region === "object"
      ? region.id
      : type === "province"
        ? customer.province_id
        : customer.city_id;

  const regionName =
    region && typeof region === "object"
      ? region.name
      : typeof region === "string"
        ? region
        : type === "province"
          ? customer.province_name
          : customer.city_name;

  if (
    regionId === null ||
    regionId === undefined ||
    !regionName
  ) {
    return null;
  }

  return {
    id: regionId,
    name: String(regionName),
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
      uniqueRegions.set(String(region.id), region);
    }
  });

  return Array.from(uniqueRegions.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "id"),
  );
}

export default function MasterCustomerPage() {
  const {
    dataMasterCustomer,
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
  } = useMasterCustomer();

  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});

  // State khusus filter provinsi dan kota.
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

  // State filter segment.
  const [segmentOptions] = useState<CustomerFilterOption[]>([]);
  const [segmentDetailOptions] =
    useState<CustomerFilterOption[]>([]);

  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedSegmentDetail, setSelectedSegmentDetail] =
    useState("");

  /**
   * Pilihan provinsi diambil dari data customer.
   * Provinsi yang belum memiliki customer tidak ditampilkan.
   */
  const provinceOptions = useMemo(
    () =>
      getUniqueRegions(
        dataMasterCustomer as CustomerRegionData[],
        "province",
      ),
    [dataMasterCustomer],
  );

  /**
   * Pilihan kota diambil dari data customer.
   * Jika provinsi dipilih, hanya kota dari provinsi tersebut
   * yang ditampilkan.
   */
  const cityOptions = useMemo(() => {
    const customers =
      dataMasterCustomer as CustomerRegionData[];

    const filteredCustomers = selectedProvince
      ? customers.filter((customer) => {
          const province = getRegionOption(
            customer,
            "province",
          );

          return (
            province &&
            String(province.id) ===
              String(selectedProvince.id)
          );
        })
      : customers;

    return getUniqueRegions(filteredCustomers, "city");
  }, [dataMasterCustomer, selectedProvince]);

  const columns = useMemo(
    () => getCustomerColumns(),
    [],
  );

  const table = useTable({
    features: dataTableFeatures,
    data: dataMasterCustomer,
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

  const resetFilters = () => {
    setSearchData("");

    setFilterData((current) => ({
      ...current,
      filter: {
        ...current.filter,
        segment_id: "",
        segment_detail_id: "",
        province_id: "",
        city_id: "",
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
      filterData.filter.province_id ||
      filterData.filter.city_id,
  );

  return (
    <section className="min-w-0 space-y-5">
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {/* Header dan pencarian */}
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FaDatabase
                className="text-emerald-500"
                aria-hidden="true"
              />

              <h1 className="text-lg font-bold text-slate-800 dark:text-white">
                Master Customer
              </h1>
            </div>

            <p className="ml-6 text-xs text-slate-500 dark:text-slate-400">
              Daftar customer
            </p>
          </div>

          <div className="w-full lg:w-96">
            <FilterBar
              search={searchData}
              onSearchChange={setSearchData}
              active={activeFilters}
              onReset={resetFilters}
            >
              <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Filter segment */}
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

                {/* Filter segment detail */}
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

                {/* Filter provinsi dari data customer */}
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
                          province_id: item
                            ? String(item.id)
                            : "",
                          city_id: "",
                        },
                      }));

                      setProvinceSearch("");
                      setProvincePickerOpen(false);
                    }}
                  />
                </div>

                {/* Filter kota dari data customer */}
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
                          city_id: item
                            ? String(item.id)
                            : "",
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
        </div>

        {/* Pagination */}
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

        {/* Data customer */}
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
    </section>
  );
}
