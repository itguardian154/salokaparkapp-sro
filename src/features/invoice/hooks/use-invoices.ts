import { useCallback, useEffect, useState } from "react";
import { formatTanggal } from "@/lib/utils";
import { getInvoices } from "../service/invoice-service";
import type { InvoiceListParams, InvoiceRecord } from "../types/invoice";

const DEFAULT_ITEM_PER_PAGE = 25;

const useInvoices = () => {
  const [dataInvoices, setDataInvoices] = useState<InvoiceRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchData, setSearchData] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [salesPersonFilter, setSalesPersonFilter] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("");
  const [agenFilter, setAgenFilter] = useState("");
  const [customerIdFilter, setCustomerIdFilter] = useState("");
  const [arrivalDateFrom, setArrivalDateFrom] = useState("");
  const [arrivalDateTo, setArrivalDateTo] = useState("");
  const [itemPerPage, setItemPerPage] = useState(DEFAULT_ITEM_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [fromPage, setFromPage] = useState<number | null>(null);
  const [toPage, setToPage] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchInvoices = async () => {
      setLoadingData(true);
      setError(null);

      const params: InvoiceListParams = {
        page: currentPage,
        per_page: itemPerPage,
        ...(searchData.trim() && { "filter[search]": searchData.trim() }),
        ...(statusFilter && { "filter[status]": statusFilter }),
        ...(salesPersonFilter && {
          "filter[sales_person_id]": salesPersonFilter,
        }),
        ...(segmentFilter && { "filter[segment_id]": segmentFilter }),
         ...(agenFilter && { "filter[partner_id]": agenFilter }),
        ...(customerIdFilter && { "filter[customer_id]": customerIdFilter }),
        ...(arrivalDateFrom && { "filter[arrival_date_from]": arrivalDateFrom }),
        ...(arrivalDateTo && { "filter[arrival_date_to]": arrivalDateTo }),
      };

      try {
        const response = await getInvoices(params, controller.signal);
        const invoices = response.data.map((invoice) => ({
          id: invoice.id,
          invoice_id: invoice.invoice_number,
          sales: invoice.sales_person_name ?? "-",
          segment_name: invoice.segment_name ?? "-",
          customer_name: invoice.customer_name ?? "-",
          partner_name: invoice.partner_name ?? "-",
          kedatangan: formatTanggal(invoice.arrival_date),
          ticket: (invoice.items ?? []).reduce(
            (total, item) => total + Number(item.quantity || 0),
            0,
          ),
          revenue: Number(invoice.total_amount) || 0,
          status: invoice.status_label || invoice.status,
          status_value: invoice.status,
          payment_status: invoice.payment_status,
        }));

        setDataInvoices(invoices);
        setCurrentPage(response.meta.current_page);
        setLastPage(response.meta.last_page);
        setTotalData(response.meta.total);
        setFromPage(response.meta.from);
        setToPage(response.meta.to);
      } catch (fetchError) {
        if (controller.signal.aborted) return;

        console.error("Gagal mengambil data invoice:", fetchError);
        setDataInvoices([]);
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

    void fetchInvoices();
    return () => controller.abort();
  }, [
    arrivalDateFrom,
    arrivalDateTo,
    currentPage,
    customerIdFilter,
    itemPerPage,
    refreshKey,
    salesPersonFilter,
    searchData,
    segmentFilter,
    agenFilter,
    statusFilter,
  ]);

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

  const changeCustomerIdFilter = useCallback((value: string) => {
    setCustomerIdFilter(value);
    setCurrentPage(1);
  }, []);

  const changeArrivalDateRange = (from: string, to: string) => {
    setArrivalDateFrom(from);
    setArrivalDateTo(to);
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
    dataInvoices,
    loadingData,
    error,
    searchData,
    setSearchData: changeSearch,
    statusFilter,
    setStatusFilter: changeStatusFilter,
    salesPersonFilter,
    setSalesPersonFilter: changeSalesPersonFilter,
    segmentFilter,
    setSegmentFilter: changeSegmentFilter,
    agenFilter,
    setAgenFilter: changeAgenFilter,
    customerIdFilter,
    setCustomerIdFilter: changeCustomerIdFilter,
    arrivalDateFrom,
    arrivalDateTo,
    setArrivalDateRange: changeArrivalDateRange,
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
