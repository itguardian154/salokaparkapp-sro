import { useCallback, useEffect, useState } from "react";

import { getCustomer } from "../services/customer-service";
import type {
  CustomerFilters,
  CustomerQueryParams,
  CustomerRecord,
} from "../types/customer";

const DEFAULT_ITEM_PER_PAGE = 25;

const useCustomer = () => {
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dataCustomer, setDataCustomer] = useState<CustomerRecord[]>([]);
  const [searchData, setSearchData] = useState("");

const [filterData, setFilterData] = useState<CustomerFilters>({
  filter: {
    segment_id: "",
    segment_detail_id: "",
    province_name: "",
    city_name: "",
    status: "",
    is_active: "",
  },
});

  const [itemPerPage, setItemPerPage] = useState(DEFAULT_ITEM_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [fromPage, setFromPage] = useState<number | null>(null);
  const [toPage, setToPage] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCustomers = async () => {
      setLoadingData(true);
      setError(null);

      try {
        const params: CustomerQueryParams = {
          page: currentPage,
          per_page: itemPerPage,

          ...(searchData.trim() && {
            "filter[search]": searchData.trim(),
          }),

          ...(filterData.filter.segment_id && {
            "filter[segment_id]": filterData.filter.segment_id,
          }),

          ...(filterData.filter.segment_detail_id && {
            "filter[segment_detail_id]":
              filterData.filter.segment_detail_id,
          }),

          ...(filterData.filter.province_name && {
            "filter[province_name]":
              filterData.filter.province_name,
          }),

          ...(filterData.filter.city_name && {
            "filter[city_name]": filterData.filter.city_name,
          }),
        };

        const response = await getCustomer(params, controller.signal);
        const { data, meta } = response;

        setDataCustomer(data);
        setCurrentPage(meta.current_page ?? currentPage);
        setLastPage(meta.last_page ?? 1);
        setTotalData(meta.total ?? 0);
        setFromPage(meta.from ?? null);
        setToPage(meta.to ?? null);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;

        console.error("Gagal mengambil data customer:", error);

        setError("Gagal mengambil data customer.");
        setDataCustomer([]);
        setLastPage(1);
        setTotalData(0);
        setFromPage(null);
        setToPage(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoadingData(false);
        }
      }
    };

    void fetchCustomers();

    return () => controller.abort();
  }, [
    searchData,
    itemPerPage,
    currentPage,
    refreshKey,
    filterData,
  ]);

  const handleNextPage = () => {
    if (currentPage < lastPage) {
      setCurrentPage((page) => page + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((page) => page - 1);
    }
  };

  const changeSearch = useCallback((value: string) => {
    setSearchData(value);
    setCurrentPage(1);
  }, []);

  const changeItemPerPage = (value: number) => {
    setItemPerPage(value);
    setCurrentPage(1);
  };

  const changeFilters: typeof setFilterData = (nextFilters) => {
    setFilterData(nextFilters);
    setCurrentPage(1);
  };

  const refetch = () => {
    setRefreshKey((key) => key + 1);
  };

  return {
    dataCustomer,
    loadingData,
    error,
    searchData,
    setSearchData: changeSearch,
    filterData,
    setFilterData: changeFilters,
    itemPerPage,
    setItemPerPage: changeItemPerPage,
    currentPage,
    lastPage,
    totalData,
    fromPage,
    toPage,
    handleNextPage,
    handlePrevPage,
    refetch,
  };
};

export default useCustomer;
