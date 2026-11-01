import { useCallback, useMemo, useState } from "react";
import { useTable } from "@tanstack/react-table";
import type { ColumnVisibilityState } from "@tanstack/react-table";
import { FaUserGroup, FaUsers, FaPlus } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

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
import useEditCustomer from "../hooks/use-update-customer";
import useDetailCustomer from "../hooks/use-detail-customer";

import CreateCustomer from "../components/create-customer";
import UpdateCustomer from "../components/update-customer";
import DetailCustomer from "../components/detail-customer";

import { getCustomerColumns } from "../columns";

import type {
  CustomerRecord,
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from "../types/customer";
import MobileFloatingActionButton from "@/components/mobile-floating-action-button";

interface RegionOption {
  id: string;
  name: string;
}

interface CustomerFilterOption {
  value: string;
  label: string;
}

type CustomerFilterData = CustomerRecord;

function getUniqueRegions(
  customers: CustomerFilterData[],
  type: "province" | "city",
): RegionOption[] {
  const uniqueRegions = new Map<string, RegionOption>();

  customers.forEach((customer) => {
    const name =
      type === "province"
        ? customer.province_name
        : customer.city_name;

    if (name) {
      uniqueRegions.set(name, {
        id: name,
        name,
      });
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
    refetch,
  } = useCustomer();

  const {
    submit: submitCustomer,
    loading: submittingCreate,
    error: createError,
    clearError: clearCreateError,
  } = useCreateCustomer();

  const {
    submit: submitUpdateCustomer,
    loading: submittingUpdate,
    error: updateError,
    clearError: clearUpdateError,
  } = useEditCustomer();

  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});

  const [createOpen, setCreateOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerRecord | null>(null);

  const [updateOpen, setUpdateOpen] = useState(false);

  // State untuk detail customer
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDetailCustomerId, setSelectedDetailCustomerId] =
    useState<number | null>(null);

  const {
    customer: detailCustomer,
    loading: loadingDetailCustomer,
    error: detailCustomerError,
  } = useDetailCustomer(selectedDetailCustomerId, detailOpen);

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

  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedSegmentDetail, setSelectedSegmentDetail] =
    useState("");

  const customers = useMemo<CustomerRecord[]>(
    () => dataCustomer ?? [],
    [dataCustomer],
  );

  const provinceOptions = useMemo(
    () => getUniqueRegions(customers, "province"),
    [customers],
  );

  const cityOptions = useMemo(
    () => getUniqueRegions(customers, "city"),
    [customers],
  );

  const segmentOptions = useMemo<CustomerFilterOption[]>(() => {
  const uniqueSegments = new Map<string, string>();

  customers.forEach((customer) => {
    const segment = customer.segment;

    if (segment?.id && segment.name) {
      uniqueSegments.set(String(segment.id), segment.name);
    }
  });

  return Array.from(uniqueSegments.entries())
    .map(([id, name]) => ({
      value: id,
      label: name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "id"));
}, [customers]);

  const segmentDetailOptions = useMemo<CustomerFilterOption[]>(() => {
  const uniqueDetails = new Map<string, string>();

  customers.forEach((customer) => {
    const detail = customer.segment_detail;

    if (!detail?.id || !detail.name) return;

    if (
      selectedSegment &&
      String(customer.segment?.id) !== selectedSegment
    ) {
      return;
    }

    uniqueDetails.set(String(detail.id), detail.name);
  });

  return Array.from(uniqueDetails.entries())
    .map(([id, name]) => ({
      value: id,
      label: name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "id"));
}, [customers, selectedSegment]);


  const handleOpenEdit = useCallback(
    (customer: CustomerRecord) => {
      clearUpdateError();
      setSelectedCustomer(customer);
      setUpdateOpen(true);
    },
    [clearUpdateError],
  );

  // Callback membuka detail customer
  const handleDetail = useCallback((customer: CustomerRecord) => {
    setSelectedDetailCustomerId(customer.id);
    setDetailOpen(true);
  }, []);

  // Callback menutup detail customer
  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
    setSelectedDetailCustomerId(null);
  }, []);

  const columns = useMemo(
    () => getCustomerColumns(handleDetail, handleOpenEdit, true),
    [handleDetail, handleOpenEdit],
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

  const handleOpenCreate = () => {
    clearCreateError();
    setCreateOpen(true);
  };

  const handleCreateCustomer = async (
    payload: CreateCustomerPayload,
  ) => {
    try {
      await submitCustomer(payload);

      setCreateOpen(false);
      clearCreateError();
      refetch();

      toast.add({
        title: "Customer berhasil dibuat",
        description: "Customer baru sudah ditambahkan ke daftar.",
        type: "success",
        timeout: 4000,
      });
    } catch (err: unknown) {
      toast.add({
        title: "Customer gagal dibuat",
        description:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat menyimpan data customer.",
        type: "error",
        timeout: 6000,
      });
    }
  };

  const handleUpdateCustomer = async (
    id: number,
    payload: UpdateCustomerPayload,
  ) => {
    try {
      await submitUpdateCustomer(id, payload);

      setUpdateOpen(false);
      setSelectedCustomer(null);
      clearUpdateError();
      refetch();

      toast.add({
        title: "Customer berhasil diperbarui",
        description: "Perubahan data customer berhasil disimpan.",
        type: "success",
        timeout: 4000,
      });
    } catch (err: unknown) {
      toast.add({
        title: "Customer gagal diperbarui",
        description:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memperbarui customer.",
        type: "error",
        timeout: 6000,
      });
    }
  };

  const handleCloseCreate = () => {
    if (submittingCreate) return;

    clearCreateError();
    setCreateOpen(false);
  };

  const handleCloseEdit = () => {
    if (submittingUpdate) return;

    clearUpdateError();
    setUpdateOpen(false);
    setSelectedCustomer(null);
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
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FaUserGroup
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

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
            <div className="w-full sm:min-w-0 sm:flex-1 lg:w-96 lg:flex-none">
              <FilterBar
                search={searchData}
                onSearchChange={setSearchData}
                active={activeFilters}
                onReset={resetFilters}
              >
                <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
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

                        setFilterData((current) => ({
                          ...current,
                          filter: {
                            ...current.filter,
                            province_name: item?.name ?? "",
                          },
                        }));

                        setProvinceSearch("");
                        setProvincePickerOpen(false);
                      }}
                    />
                  </div>

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
                      emptyText="Kota tidak ditemukan pada data customer"
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
              className="hidden gap-2 xl:flex"
            >
              <FaPlus size={14} />
              Tambah
            </Button>
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

      <CreateCustomer
        open={createOpen}
        onClose={handleCloseCreate}
        onSubmit={handleCreateCustomer}
        submitting={submittingCreate}
        submitError={createError}
      />

      <UpdateCustomer
        open={updateOpen}
        onClose={handleCloseEdit}
        customer={selectedCustomer}
        onSubmit={handleUpdateCustomer}
        submitting={submittingUpdate}
        submitError={updateError}
      />

      <DetailCustomer
        open={detailOpen}
        customer={detailCustomer}
        loading={loadingDetailCustomer}
        error={detailCustomerError}
        onClose={handleCloseDetail}
      />
       {/* FLOATING BUTTON TAMBAH CUSTOMER - MOBILE */}
            <MobileFloatingActionButton
              ariaLabel="Tambah Customer"
              onClick={handleOpenCreate}
            />
    </section>
  );
}
