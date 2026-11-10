import { useEffect, useState } from "react";
import { formatTanggal } from "@/lib/utils";
import type { ReservasiListParams, ReservasiTableRecord } from "../types/reservasi";
import { getReservasi } from "../service/reservasi-service";

const DEFAULT_ITEM_PER_PAGE = 25;

const useInvoices = () => {
  const [dataReservasi, setDataReservasi] = useState<ReservasiTableRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchData, setSearchData] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [itemPerPage, setItemPerPage] = useState(DEFAULT_ITEM_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [fromPage, setFromPage] = useState<number | null>(null);
  const [toPage, setToPage] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchReservasi = async () => {
      setLoadingData(true);
      setError(null);

      const params: ReservasiListParams = {
        page: currentPage,
        per_page: itemPerPage,
        ...(searchData.trim() && { "filter[search]": searchData.trim() }),
        ...(statusFilter && { "filter[status]": statusFilter }),
      };

      try {
        const response = await getReservasi(params, controller.signal);

        const reservasi = response.data.map((item) => ({
          id: item.id,
          invoice_id: item.invoice_number,
          sales: item.sales_person_name ?? "-",
          segment_name: item.segment_name ?? "-",
          customer_name: item.customer_name ?? "-",
          partner_name: item.partner_name ?? "-",
          kedatangan: formatTanggal(item.arrival_date),
          ticket: item.ticket_created_count,
          revenue: Number(item.total_amount) || 0,
          status: item.status_label || item.status,
          status_value: item.status,
        }));

        setDataReservasi(reservasi);
        setCurrentPage(response.meta.current_page);
        setLastPage(response.meta.last_page);
        setTotalData(response.meta.total);
        setFromPage(response.meta.from);
        setToPage(response.meta.to);
      } catch (fetchError) {
        if (controller.signal.aborted) return;

        console.error("Gagal mengambil data invoice:", fetchError);
        setDataReservasi([]);
        setLastPage(1);
        setTotalData(0);
        setFromPage(null);
        setToPage(null);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Gagal mengambil data invoice.",
        );
      } finally {
        if (!controller.signal.aborted) setLoadingData(false);
      }
    };

    void fetchReservasi();
    return () => controller.abort();
  }, [currentPage, itemPerPage, refreshKey, searchData, statusFilter]);

  const changeSearch = (value: string) => {
    setSearchData(value);
    setCurrentPage(1);
  };

  const changeStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const changeItemPerPage = (value: number) => {
    setItemPerPage(value);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (currentPage < lastPage) setCurrentPage((page) => page + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((page) => page - 1);
  };

  const refetch = () => setRefreshKey((key) => key + 1);

  return {
    dataReservasi,
    loadingData,
    error,
    searchData,
    setSearchData: changeSearch,
    statusFilter,
    setStatusFilter: changeStatusFilter,
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

export default useInvoices;
