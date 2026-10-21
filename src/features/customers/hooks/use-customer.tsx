
import { useEffect, useState } from "react";
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
  const [dataMasterCustomer, setDataMasterCustomer] = useState<
    CustomerRecord[]
  >([]);
  const [searchData, setSearchData] = useState("");

  const [filterData, setFilterData] = useState<CustomerFilters>({
    filter: {
      segment_id: 0,
      segment_detail_id: 0,
      province_id: 0 ,
      city_id: 0,
    },
  });

  const [itemPerPage, setItemPerPage] = useState(DEFAULT_ITEM_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageData, setPageData] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [fromPage, setFromPage] = useState<number | null>(null);
  const [toPage, setToPage] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const clearData = () => {
    setDataMasterCustomer([]);
    setCurrentPage(1);
    setLastPage(1);
    setTotalData(0);
    setFromPage(null);
    setToPage(null);
  };

  useEffect(() => {
    const controller = new AbortController();

    const getDataMasterCustomer = async () => {
      setLoadingData(true);
      setError(null);

      try {
        const params: CustomerQueryParams = {
          page: pageData,
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

          ...(filterData.filter.province_id && {
            "filter[province_id]": filterData.filter.province_id,
          }),

          ...(filterData.filter.city_id && {
            "filter[city_id]": filterData.filter.city_id,
          }),
        };

        const response = await getCustomer(
          params,
          controller.signal,
        );

        const { data, meta } = response;

        setDataMasterCustomer(data);
        setCurrentPage(meta.current_page ?? pageData);
        setLastPage(meta.last_page ?? 1);
        setTotalData(meta.total ?? 0);
        setFromPage(meta.from ?? null);
        setToPage(meta.to ?? null);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;

        console.error("Gagal mengambil data customer:", error);
        setError("Gagal mengambil data customer.");
        clearData();
      } finally {
        if (!controller.signal.aborted) {
          setLoadingData(false);
        }
      }
    };

    void getDataMasterCustomer();

    return () => controller.abort();
  }, [
    searchData,
    itemPerPage,
    pageData,
    refreshKey,
    filterData,
  ]);

  const handleNextPage = () => {
    if (currentPage < lastPage) {
      setPageData((previousPage) => previousPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setPageData((previousPage) => previousPage - 1);
    }
  };

  const changeSearch = (value: string) => {
    setSearchData(value);
    setPageData(1);
  };

  const changeItemPerPage = (value: number) => {
    setItemPerPage(value);
    setPageData(1);
  };

  const changeFilters: typeof setFilterData = (nextFilters) => {
    setFilterData(nextFilters);
    setPageData(1);
  };

  const refetch = () => {
    setRefreshKey((key) => key + 1);
  };

  return {
    dataMasterCustomer,
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
