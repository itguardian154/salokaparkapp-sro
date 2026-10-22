import { useEffect, useState } from "react";
import type { KategoriProdukFilters, KategoriProdukQueryParams, KategoriProdukRecord } from "../types/kategori-produk";
import { getMasterKategoriProduk } from "../service/master-kategori-service";


const DEFAULT_ITEM_PER_PAGE = 25;

const useMasterKategoriProduk = () => {
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataMasterKategoriProduk, setDataMasterKategoriProduk] = useState<KategoriProdukRecord[]>([]);
  const [searchData, setSearchData] = useState("");
  const [filterData, setFilterData] = useState<KategoriProdukFilters>({
    filter: { name: "", is_active: "" },
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
    setDataMasterKategoriProduk([]);
    setCurrentPage(1);
    setLastPage(1);
    setTotalData(0);
    setFromPage(null);
    setToPage(null);
  };

  useEffect(() => {
    const controller = new AbortController();

    const getDataMasterKategoriProduk = async () => {
      setLoadingData(true);
      setError(null);

      try {
        const params: KategoriProdukQueryParams = {
          page: pageData,
          per_page: itemPerPage,
          ...(searchData.trim() && {
            "filter[search]": searchData.trim(),
          }),
          ...(filterData.filter.name && {
            "filter[name]": filterData.filter.name,
          }),
          ...(filterData.filter.is_active && {
            "filter[is_active]":
              filterData.filter.is_active === "true"
                ? "1"
                : filterData.filter.is_active === "false"
                  ? "0"
                  : filterData.filter.is_active,
          }),
        };

        const response = await getMasterKategoriProduk(params, controller.signal);
        const { data, meta } = response;
        setDataMasterKategoriProduk(data);
        setCurrentPage(meta.current_page);
        setLastPage(meta.last_page);
        setTotalData(meta.total);
        setFromPage(meta.from);
        setToPage(meta.to);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;

        console.error("Gagal mengambil data kategoriproduk:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data kategori produk.",
        );
        clearData();
      } finally {
        if (!controller.signal.aborted) setLoadingData(false);
      }
    };

    void getDataMasterKategoriProduk();

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
    dataMasterKategoriProduk,
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

export default useMasterKategoriProduk;
