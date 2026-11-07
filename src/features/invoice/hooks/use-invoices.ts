import { useEffect, useState } from "react";
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
    dataInvoices,
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
