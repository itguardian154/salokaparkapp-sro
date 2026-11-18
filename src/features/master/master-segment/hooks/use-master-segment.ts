import { useEffect, useState } from "react";
import { getSegments } from "../service/master-segment-service";
import type { Segment, SegmentQueryParams } from "../types/master-segment";

const DEFAULT_ITEM_PER_PAGE = 100;

type UseSegmentsOptions = {
  is_active?: boolean | null;
  itemPerPage?: number;
};

export const useSegments = (options: UseSegmentsOptions = {}) => {
  const initialStatusFilter =
    options.is_active === null
      ? ""
      : String(options.is_active ?? true);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchData, setSearchData] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [itemPerPage, setItemPerPage] = useState(
    options.itemPerPage ?? DEFAULT_ITEM_PER_PAGE,
  );
  const [pageData, setPageData] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [fromPage, setFromPage] = useState<number | null>(null);
  const [toPage, setToPage] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchSegments = async () => {
      setLoading(true);
      setError(null);

      const params: SegmentQueryParams = {
        page: pageData,
        per_page: itemPerPage,
        ...(searchData.trim() && { "filter[name]": searchData.trim() }),
        ...(statusFilter && {
          "filter[is_active]":
            statusFilter === "true"
              ? "1"
              : statusFilter === "false"
                ? "0"
                : statusFilter,
        }),
      };

      try {
        const response = await getSegments(params, controller.signal);
        if (controller.signal.aborted) return;

        setSegments(response.data);
        setCurrentPage(response.meta.current_page);
        setLastPage(response.meta.last_page);
        setTotalData(response.meta.total);
        setFromPage(response.meta.from);
        setToPage(response.meta.to);
      } catch (fetchError) {
        if (controller.signal.aborted) return;

        setSegments([]);
        setCurrentPage(1);
        setLastPage(1);
        setTotalData(0);
        setFromPage(null);
        setToPage(null);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Gagal mengambil data Segment.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void fetchSegments();
    return () => controller.abort();
  }, [
    itemPerPage,
    pageData,
    refreshKey,
    searchData,
    statusFilter,
  ]);

  const changeSearch = (value: string) => {
    setSearchData(value);
    setPageData(1);
  };

  const changeStatusFilter = (value: string | null) => {
    setStatusFilter(value ?? "");
    setPageData(1);
  };

  const changeItemPerPage = (value: number) => {
    setItemPerPage(value);
    setPageData(1);
  };

  const handleNextPage = () => {
    if (currentPage < lastPage) setPageData((page) => page + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setPageData((page) => page - 1);
  };

  const refetch = () => setRefreshKey((key) => key + 1);

  return {
    segments,
    loading,
    error,
    searchData,
    setSearchData: changeSearch,
    statusFilter,
    setStatusFilter: changeStatusFilter,
    itemPerPage,
    setItemPerPage: changeItemPerPage,
    currentPage,
    setPage: setPageData,
    lastPage,
    totalData,
    fromPage,
    toPage,
    handleNextPage,
    handlePrevPage,
    refetch,
  };
};
