
import { useEffect, useState } from "react";

import { getRoleAkses } from "../service/role-akses-service";
import type {
  RoleAksesFilters,
  RoleAksesQueryParams,
  RoleAksesRecord,
} from "../types/role-akses";

const DEFAULT_ITEM_PER_PAGE = 25;

const useRoleAkses = () => {
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dataRoleAkses, setDataRoleAkses] = useState<RoleAksesRecord[]>([]);
  const [searchData, setSearchData] = useState("");

  const [filterData, setFilterData] = useState<RoleAksesFilters>({
    filter: {
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

    const fetchRoleAkses = async () => {
      setLoadingData(true);
      setError(null);

      try {
        const params: RoleAksesQueryParams = {
          page: currentPage,
          per_page: itemPerPage,

          ...(searchData.trim() && {
            "filter[search]": searchData.trim(),
          }),
        };

        const response = await getRoleAkses(params, controller.signal);
        const { data, meta } = response;

        setDataRoleAkses(data);
        setCurrentPage(meta.current_page ?? currentPage);
        setLastPage(meta.last_page ?? 1);
        setTotalData(meta.total ?? 0);
        setFromPage(meta.from ?? null);
        setToPage(meta.to ?? null);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;

        console.error("Gagal mengambil data role akses:", error);

        setError("Gagal mengambil data role akses.");
        setDataRoleAkses([]);
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

    void fetchRoleAkses();

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

  const changeSearch = (value: string) => {
    setSearchData(value);
    setCurrentPage(1);
  };

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
    dataRoleAkses,
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

export default useRoleAkses;
