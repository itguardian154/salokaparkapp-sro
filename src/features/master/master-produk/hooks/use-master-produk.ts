import { useEffect, useState } from "react";
import { getMasterProduk } from "../service/master-produk-service";
import type {
  ProdukFilters,
  ProdukQueryParams,
  ProdukRecord,
} from "../types/master-produk";

const DEFAULT_ITEM_PER_PAGE = 25;

const useMasterProduk = () => {
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataMasterProduk, setDataMasterProduk] = useState<ProdukRecord[]>([]);
  const [searchData, setSearchData] = useState("");
  const [filterData, setFilterData] = useState<ProdukFilters>({
    filter: {
      department_id: "",
      product_category_id: "",
      status: "",
      is_active: "",
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
    setDataMasterProduk([]);
    setCurrentPage(1);
    setLastPage(1);
    setTotalData(0);
    setFromPage(null);
    setToPage(null);
  };

  useEffect(() => {
    const controller = new AbortController();

    const getDataMasterProduk = async () => {
      setLoadingData(true);
      setError(null);

      try {
        const params: ProdukQueryParams = {
          page: pageData,
          per_page: itemPerPage,
          ...(searchData.trim() && {
            "filter[search]": searchData.trim(),
          }),
          ...(filterData.filter.department_id && {
            "filter[department_id]": filterData.filter.department_id,
          }),
          ...(filterData.filter.product_category_id && {
            "filter[product_category_id]":
              filterData.filter.product_category_id,
          }),
          ...(filterData.filter.is_active && {
            "filter[is_active]":
              filterData.filter.is_active === "true"
                ? "1"
                : filterData.filter.is_active === "false"
                  ? "0"
                  : filterData.filter.is_active,
          }),
          ...(filterData.filter.status && {
            "filter[status]": filterData.filter.status,
          }),
        };

        const response = await getMasterProduk(params, controller.signal);
        const { data, meta } = response;
        setDataMasterProduk(data);
        setCurrentPage(meta.current_page);
        setLastPage(meta.last_page);
        setTotalData(meta.total);
        setFromPage(meta.from);
        setToPage(meta.to);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;

        console.error("Gagal mengambil data produk:", error);
       // setError("Gagal mengambil data produk.");
        clearData();
      } finally {
        if (!controller.signal.aborted) setLoadingData(false);
      }
    };

    void getDataMasterProduk();

    return () => controller.abort();
  }, [searchData, itemPerPage, pageData, refreshKey, filterData]);

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

  const refetch = () => setRefreshKey((key) => key + 1);

  return {
    dataMasterProduk,
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

export default useMasterProduk;
