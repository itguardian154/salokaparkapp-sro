import { useEffect, useState } from "react";
import { formatTanggal } from "@/lib/utils";
import type {
  ReservasiListParams,
  ReservasiTableRecord,
} from "../types/reservasi";
import { getReservasi } from "../service/reservasi-service";

const DEFAULT_ITEM_PER_PAGE = 25;

const useReservasi = () => {
  const [dataReservasi, setDataReservasi] = useState<ReservasiTableRecord[]>(
    [],
  );
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search dan status
  const [searchData, setSearchData] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Filter tambahan
  const [salesPersonFilter, setSalesPersonFilter] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("");
  const [agenFilter, setAgenFilter] = useState("");
  const [customerIdFilter, setCustomerIdFilter] = useState("");
  const [arrivalDateFrom, setArrivalDateFrom] = useState("");
  const [arrivalDateTo, setArrivalDateTo] = useState("");

  // Pagination
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

        ...(searchData.trim() && {
          "filter[search]": searchData.trim(),
        }),

        ...(statusFilter && {
          "filter[status]": statusFilter,
        }),

        ...(salesPersonFilter && {
          "filter[sales_person_id]": salesPersonFilter,
        }),

        ...(segmentFilter && {
          "filter[segment_id]": segmentFilter,
        }),

        ...(agenFilter && {
          "filter[partner_id]": agenFilter,
        }),

        ...(customerIdFilter && {
          "filter[customer_id]": customerIdFilter,
        }),

        ...(arrivalDateFrom && {
          "filter[arrival_date_from]": arrivalDateFrom,
        }),

        ...(arrivalDateTo && {
          "filter[arrival_date_to]": arrivalDateTo,
        }),
      };

      try {
        const response = await getReservasi(params, controller.signal);

        const reservasi = response.data.map((item) => ({
          id: item.id,
          sales_order_number: item.sales_order_number,
          sales: item.sales_person_name ?? "-",
          segment_name: item.segment_name ?? "-",
          customer_name: item.customer_name ?? "-",
          partner_name: item.partner_name ?? "-",
          partner_id: item.partner_id ?? null,
          customer_id: item.customer_id ?? null,

          kedatangan: formatTanggal(item.arrival_date),
          ticket: item.ticket_created_count,
          revenue: Number(item.total_amount) || 0,
          status: item.status_label || item.status,
          status_value: item.status,
          payment_status: item.payment_status,
        }));

        setDataReservasi(reservasi);
        setCurrentPage(response.meta.current_page);
        setLastPage(response.meta.last_page);
        setTotalData(response.meta.total);
        setFromPage(response.meta.from);
        setToPage(response.meta.to);
      } catch (fetchError) {
        if (controller.signal.aborted) return;

        console.error("Gagal mengambil data reservasi:", fetchError);

        setDataReservasi([]);
        setLastPage(1);
        setTotalData(0);
        setFromPage(null);
        setToPage(null);

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Gagal mengambil data reservasi.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingData(false);
        }
      }
    };

    void fetchReservasi();

    return () => controller.abort();
  }, [
    currentPage,
    itemPerPage,
    refreshKey,
    searchData,
    statusFilter,
    salesPersonFilter,
    segmentFilter,
    agenFilter,
    customerIdFilter,
    arrivalDateFrom,
    arrivalDateTo,
  ]);

  // Setter filter
  const changeSearch = (value: string) => {
    setSearchData(value);
    setCurrentPage(1);
  };

  const changeStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const changeSalesPersonFilter = (value: string) => {
    setSalesPersonFilter(value);
    setCurrentPage(1);
  };

  const changeSegmentFilter = (value: string) => {
    setSegmentFilter(value);
    setCurrentPage(1);
  };

  const changeAgenFilter = (value: string) => {
    setAgenFilter(value);
    setCurrentPage(1);
  };

  const changeCustomerIdFilter = (value: string) => {
    setCustomerIdFilter(value);
    setCurrentPage(1);
  };

  const changeArrivalDateFrom = (value: string) => {
    setArrivalDateFrom(value);
    setCurrentPage(1);
  };

  const changeArrivalDateTo = (value: string) => {
    setArrivalDateTo(value);
    setCurrentPage(1);
  };

  const changeItemPerPage = (value: number) => {
    setItemPerPage(value);
    setCurrentPage(1);
  };

  // Reset seluruh filter
  const resetFilters = () => {
    setSearchData("");
    setStatusFilter("");
    setSalesPersonFilter("");
    setSegmentFilter("");
    setAgenFilter("");
    setCustomerIdFilter("");
    setArrivalDateFrom("");
    setArrivalDateTo("");
    setCurrentPage(1);
  };

  // Pagination
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

  const refetch = () => {
    setRefreshKey((key) => key + 1);
  };

  return {
    dataReservasi,
    loadingData,
    error,

    // Search
    searchData,
    setSearchData: changeSearch,

    // Status
    statusFilter,
    setStatusFilter: changeStatusFilter,

    // Filter sales
    salesPersonFilter,
    setSalesPersonFilter: changeSalesPersonFilter,

    // Filter segmen
    segmentFilter,
    setSegmentFilter: changeSegmentFilter,

    // Filter agen
    agenFilter,
    setAgenFilter: changeAgenFilter,

    // Filter nama group
    customerIdFilter,
    setCustomerIdFilter: changeCustomerIdFilter,

    // Filter tanggal kedatangan
    arrivalDateFrom,
    setArrivalDateFrom: changeArrivalDateFrom,
    arrivalDateTo,
    setArrivalDateTo: changeArrivalDateTo,

    // Reset
    resetFilters,

    // Pagination
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

export default useReservasi;
