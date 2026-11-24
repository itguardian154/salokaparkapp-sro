
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  getInvoices,
  getInvoice,
} from "@/features/invoice/service/invoice-service";

import type {
  InvoiceDetail,
  InvoiceApiRecord,
} from "@/features/invoice/types/invoice";

import {
  createReservasi,
  generateEventOrders,
} from "../service/reservasi-service";

import type {
  CreateReservasi,
  CreateReservasiEventOrder,
} from "../types/reservasi";

export type ReservasiInvoiceDetail = InvoiceDetail & {
  partner_name?: string | null;
  partner_province?: string | null;
  partner_city?: string | null;
  customer_phone?: string | null;
  customer_contact_person?: string | null;
  segment_name?: string | null;
  segment_detail_name?: string | null;
  sub_segment_detail_name?: string | null;
  partner_branch_name?: string | null;
};

export type InvoiceSearchRecord = InvoiceApiRecord & {
  status?: string;
  status_label?: string;
};

export type EventOrderForm = Omit<
  CreateReservasiEventOrder,
  "attachments"
> & {
  attachments?: (string | File)[] | null;
};

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message
    );
  }

  return error instanceof Error ? error.message : "Terjadi kesalahan.";
};

const isInvoiceDone = (invoice: InvoiceApiRecord) => {
  const record = invoice as InvoiceSearchRecord;

  const statuses = [record.status, record.status_label]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());

  return statuses.includes("done");
};

export default function useCreateReservasi() {
  const navigate = useNavigate();

  // ==============================
  // INVOICE SEARCH
  // ==============================

  const [searchInvoice, setSearchInvoice] = useState("");
  const [invoiceResults, setInvoiceResults] = useState<InvoiceApiRecord[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [openInvoice, setOpenInvoice] = useState(false);

  const [selectedInvoice, setSelectedInvoice] =
    useState<ReservasiInvoiceDetail | null>(null);

  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // ==============================
  // RESERVASI FORM
  // ==============================

  const [accessTourLeader, setAccessTourLeader] = useState("0");
  const [arrivalType, setArrivalType] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");

  // ==============================
  // EVENT ORDER
  // ==============================

  const [eventOrders, setEventOrders] = useState<EventOrderForm[]>([]);
  const [generateLoading, setGenerateLoading] = useState(false);

  const [openCreateEventOrder, setOpenCreateEventOrder] = useState(false);

  const [editingEventOrderIndex, setEditingEventOrderIndex] = useState<
    number | null
  >(null);

  // ==============================
  // SUBMIT
  // ==============================

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ==============================
  // LOAD INVOICE
  // ==============================

  useEffect(() => {
    if (!openInvoice || selectedInvoice) return;

    const controller = new AbortController();

    const timer = setTimeout(
      async () => {
        try {
          setSearchLoading(true);
          setErrorMessage("");

          const keyword = searchInvoice.trim();

          const response = await getInvoices(
            {
              page: 1,
              per_page: 10,
              ...(keyword ? { "filter[search]": keyword } : {}),
            },
            controller.signal,
          );

          const invoices = response.data ?? [];

          setInvoiceResults(invoices.filter(isInvoiceDone));
        } catch (error) {
          if (!controller.signal.aborted) {
            setInvoiceResults([]);
            setErrorMessage(getErrorMessage(error));
          }
        } finally {
          if (!controller.signal.aborted) {
            setSearchLoading(false);
          }
        }
      },
      searchInvoice.trim() ? 400 : 0,
    );

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [openInvoice, searchInvoice, selectedInvoice]);

  // ==============================
  // RESET RESERVASI FORM
  // ==============================

  const resetReservasiForm = () => {
    setAccessTourLeader("0");
    setArrivalType("");
    setArrivalTime("");

    setEventOrders([]);
    setOpenCreateEventOrder(false);
    setEditingEventOrderIndex(null);
  };

  // ==============================
  // GENERATE EVENT ORDER
  // ==============================

  const loadEventOrders = async (invoiceId: number | string) => {
    try {
      setGenerateLoading(true);

      const generated = await generateEventOrders(Number(invoiceId));

      setEventOrders(
        (generated.event_orders ?? []).map((item) => ({
          department_id: item.department_id,
          department_name: item.department_name,
          description: item.description,
          meal_voucher: item.meal_voucher ?? null,
          voucher_tour_leader: item.voucher_tour_leader ?? null,
          shopping_voucher: Array.isArray(item.shopping_voucher)
            ? item.shopping_voucher
            : [],
          product_id: item.product_id ?? null,
          quantity: item.quantity ?? null,
          unit_price: item.unit_price ?? null,
          total_price: item.total_price ?? null,
          status: item.status,
          status_label: item.status_label,

          // Data attachment dari API tetap dipertahankan.
          attachments: Array.isArray(item.attachments)
            ? item.attachments
            : [],

          sub_department_id: null,
          sub_department_name: null,
          location_id: null,
          location_detail: null,
          product_code: null,
          product_description: null,
          ticket_print_date: null,
          serving_time: null,
          serving_location: null,
          serving_type: null,
          start_at: null,
          end_at: null,
        })),
      );
    } finally {
      setGenerateLoading(false);
    }
  };

  // ==============================
  // SELECT INVOICE
  // ==============================

  const handleSelectInvoice = async (invoice: InvoiceApiRecord) => {
    try {
      setInvoiceLoading(true);
      setOpenInvoice(false);
      setErrorMessage("");
      setSuccessMessage("");

      resetReservasiForm();

      const detail = await getInvoice(String(invoice.id));

      const reservasiDetail = detail as ReservasiInvoiceDetail;

      setSelectedInvoice(reservasiDetail);
      setSearchInvoice(reservasiDetail.invoice_number ?? "");

      await loadEventOrders(reservasiDetail.id);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setInvoiceLoading(false);
    }
  };

  // ==============================
  // CHANGE INVOICE
  // ==============================

  const handleChangeInvoice = () => {
    setSelectedInvoice(null);
    setSearchInvoice("");
    setInvoiceResults([]);
    setOpenInvoice(false);

    resetReservasiForm();

    setErrorMessage("");
    setSuccessMessage("");
  };

  // ==============================
  // EVENT ORDER HANDLERS
  // ==============================

  const handleEditEventOrder = (index: number) => {
    setEditingEventOrderIndex(index);
    setOpenCreateEventOrder(true);
  };

  const handleSubmitEventOrder = async (
    payload: EventOrderForm,
    attachments: File[] = [],
  ): Promise<void> => {
    const payloadAttachments = payload.attachments ?? [];

    // Utamakan File dari payload.
    // Jika kosong, gunakan File dari parameter modal.
    const selectedFiles = payloadAttachments.filter(
      (item): item is File => item instanceof File,
    );

    const updatedEventOrder: EventOrderForm = {
      ...payload,
      attachments:
        selectedFiles.length > 0
          ? selectedFiles
          : attachments,
    };

    if (editingEventOrderIndex === null) {
      setEventOrders((prev) => [...prev, updatedEventOrder]);
    } else {
      setEventOrders((prev) =>
        prev.map((item, index) =>
          index === editingEventOrderIndex
            ? updatedEventOrder
            : item,
        ),
      );
    }

    setOpenCreateEventOrder(false);
    setEditingEventOrderIndex(null);
  };

  const handleCloseEventOrderModal = () => {
    setOpenCreateEventOrder(false);
    setEditingEventOrderIndex(null);
  };

  // ==============================
  // SUBMIT RESERVASI
  // ==============================

  const handleSubmit = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedInvoice) {
      setErrorMessage("Silakan pilih invoice terlebih dahulu.");
      return;
    }

    if (!arrivalType.trim()) {
      setErrorMessage("Arrival Type wajib diisi.");
      return;
    }

    if (!arrivalTime) {
      setErrorMessage("Arrival Time wajib diisi.");
      return;
    }

    if (eventOrders.length === 0) {
      setErrorMessage("Minimal harus ada satu Event Order.");
      return;
    }

    const payload: CreateReservasi = {
      invoice_id: selectedInvoice.id,

      event_orders: eventOrders.map((item) => ({
        ...item,

        // File tetap berupa objek File.
        // Service akan mengubahnya menjadi multipart FormData.
        attachments: (item.attachments ?? []).filter(
          (attachment): attachment is File =>
            attachment instanceof File,
        ),
      })),

      access_tour_leader: Number(accessTourLeader) || 0,
      arrival_type: arrivalType,
      arrival_time: arrivalTime,
    };

    try {
      setSubmitting(true);

      await createReservasi(payload);

      setSuccessMessage("Reservasi berhasil dibuat.");

      setTimeout(() => {
        navigate("/reservation");
      }, 1000);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    // Invoice
    searchInvoice,
    setSearchInvoice,
    invoiceResults,
    searchLoading,
    openInvoice,
    setOpenInvoice,
    selectedInvoice,
    invoiceLoading,
    handleSelectInvoice,
    handleChangeInvoice,

    // Reservasi form
    accessTourLeader,
    setAccessTourLeader,
    arrivalType,
    setArrivalType,
    arrivalTime,
    setArrivalTime,

    // Event Order
    eventOrders,
    generateLoading,
    openCreateEventOrder,
    editingEventOrderIndex,
    handleEditEventOrder,
    handleSubmitEventOrder,
    handleCloseEventOrderModal,

    // Submit
    submitting,
    errorMessage,
    successMessage,
    handleSubmit,

    // Reset
    resetReservasiForm,
  };
}
