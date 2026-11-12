import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { ReactNode } from "react";

import {
  FaPlus,
  FaTrash,
  FaSearchPlus,
  FaFileInvoice,
  FaSave,
} from "react-icons/fa";

import {
  Users,
  ClipboardList,
  CalendarDays,
  Building2,
  CircleCheck,
  CircleX,
  Plus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

import SearchablePopover from "@/components/searchable-popover";

import DetailActionFooter, {
  type DetailAction,
} from "@/components/detail-page/detail-action-footer";
import DetailPageLayout from "@/components/detail-page/detail-page-ayout";
import DetailSection from "@/components/detail-page/detail-section";

import {
  getInvoices,
  getInvoice,
} from "@/features/invoice/service/invoice-service";

import DetailOrderTable from "@/features/invoice/components/detail-order-table";

import type {
  InvoiceDetail,
  InvoiceApiRecord,
} from "@/features/invoice/types/invoice";

import type { InvoiceOrder } from "@/features/invoice/types/invoice-order";

import {
  createReservasi,
  generateEventOrders,
} from "../service/reservasi-service";

import type {
  CreateReservasi,
  CreateReservasiEventOrder,
} from "../types/reservasi";

type EventOrderForm = CreateReservasiEventOrder;

// ==============================
// LOCAL INVOICE DETAIL TYPE
// Tidak mengubah invoice.ts
// ==============================

type ReservasiInvoiceDetail = InvoiceDetail & {
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

type InvoiceSearchRecord = InvoiceApiRecord & {
  status?: string;
  status_label?: string;
};

type InfoItemProps = {
  label: string;
  value: ReactNode;
};

// ==============================
// HELPERS
// ==============================

const hasValue = (value: unknown) =>
  String(value).trim() !== "";

const InfoItem = ({ label, value }: InfoItemProps) => (
  <div className="min-w-0 space-y-1">
    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {label}
    </p>

    <div className="break-words text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-200">
      {hasValue(value) ? value : "-"}
    </div>
  </div>
);

const createEmptyEventOrder = (): EventOrderForm => ({
  department_id: "",
  department_name: "",
  description: "",
  meal_voucher: null,
  voucher_tour_leader: null,
  shopping_voucher: null,
  product_id: undefined,
  quantity: "",
  unit_price: "",
  total_price: "",
  status: "",
  status_label: "",
});

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message
    );
  }

  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan.";
};

const isInvoiceDone = (invoice: InvoiceApiRecord) => {
  const record = invoice as InvoiceSearchRecord;

  const statuses = [
    record.status,
    record.status_label,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());

  return statuses.includes("done");
};

const getEventOrderStatus = (
  status?: string | null,
  statusLabel?: string | null,
) => {
  const value = String(statusLabel || status || "").trim();
  const normalized = value.toLowerCase();

  const positiveStatuses = [
    "active",
    "aktif",
    "done",
    "completed",
    "success",
  ];

  return {
    label: value || "-",
    positive: positiveStatuses.includes(normalized),
  };
};

// ==============================
// MAIN COMPONENT
// ==============================

export default function CreateReservasi() {
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

  const isCorporate =
    selectedInvoice?.segment_name?.trim().toLowerCase() === "corporate";

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

  // ==============================
  // SUBMIT
  // ==============================

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ==============================
  // LOAD INVOICE
  // Langsung mengambil daftar saat popover dibuka.
  // ==============================

  useEffect(() => {
    if (!openInvoice || selectedInvoice) return;

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        setErrorMessage("");

        const keyword = searchInvoice.trim();

        const response = await getInvoices(
          {
            page: 1,
            per_page: 10,
            ...(keyword
              ? { "filter[search]": keyword }
              : {}),
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
    }, searchInvoice.trim() ? 400 : 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [openInvoice, searchInvoice, selectedInvoice]);

  // ==============================
  // SELECT INVOICE
  // ==============================

  const handleSelectInvoice = async (invoice: InvoiceApiRecord) => {
    try {
      setInvoiceLoading(true);
      setOpenInvoice(false);
      setErrorMessage("");
      setSuccessMessage("");

      const detail = await getInvoice(String(invoice.id));

      // Menggunakan tipe lokal khusus Reservasi
      const reservasiDetail =
        detail as ReservasiInvoiceDetail;

      setSelectedInvoice(reservasiDetail);
      setSearchInvoice(reservasiDetail.invoice_number ?? "");

      // Reset data reservasi sebelumnya
      setEventOrders([]);
      setAccessTourLeader("0");
      setArrivalType("");
      setArrivalTime("");

      // Generate Event Order
      setGenerateLoading(true);

      const generated = await generateEventOrders(reservasiDetail.id);

      setEventOrders(
        (generated.event_orders ?? []).map((item) => ({
          department_id: item.department_id,
          department_name: item.department_name,
          description: item.description,
          meal_voucher: item.meal_voucher ?? null,
          voucher_tour_leader: item.voucher_tour_leader ?? null,
          shopping_voucher: item.shopping_voucher ?? null,
          product_id: item.product_id,
          quantity: item.quantity ?? "",
          unit_price: item.unit_price ?? "",
          total_price: item.total_price ?? "",
          status: item.status,
          status_label: item.status_label,
        })),
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setInvoiceLoading(false);
      setGenerateLoading(false);
    }
  };

  // ==============================
  // MAP INVOICE ITEMS
  // ==============================
  const invoiceOrderItems: InvoiceOrder[] = useMemo(() => {
    return (selectedInvoice?.items ?? []).map((item) => ({
      id: item.id,
      productId: item.product_id ?? 0,
      product: item.product_name ?? "",
      description: item.product_description ?? "",
      quantity: Number(item.quantity) || 0,
      compliment: Number(item.bonus_quantity) || 0,
      unitPrice: Number(item.unit_price) || 0,
      discountPrice: Number(item.discount_amount) || 0,
      subtotal: Number(item.subtotal) || 0,
      isTicket: Boolean(item.is_ticket),
    }));
  }, [selectedInvoice]);
  // ==============================
  // EVENT ORDER HANDLERS
  // ==============================

  const handleAddEventOrder = () => {
    setEventOrders((prev) => [
      ...prev,
      createEmptyEventOrder(),
    ]);
  };

  const handleRemoveEventOrder = (index: number) => {
    setEventOrders((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  // ==============================
  // SUBMIT
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
      event_orders: eventOrders,
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

  // ==============================
  // FOOTER ACTIONS
  // ==============================

  const actions: DetailAction[] = [
    {
      id: "save",
      label: submitting ? "Menyimpan..." : "Simpan Reservasi",
      icon: <FaSave size={15} />,
      variant: "primer",
      mobileColor: "bg-primer-60",
      position: "right",
      disabled:
        submitting ||
        invoiceLoading ||
        generateLoading ||
        !selectedInvoice,
      onClick: handleSubmit,
    },
  ];

  // ==============================
  // RESET SELECTED INVOICE
  // ==============================

  const handleChangeInvoice = () => {
    setSelectedInvoice(null);
    setSearchInvoice("");
    setInvoiceResults([]);
    setOpenInvoice(false);
    setEventOrders([]);
    setAccessTourLeader("0");
    setArrivalType("");
    setArrivalTime("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  // ==============================
  // RENDER
  // ==============================

  return (
    <DetailPageLayout
      icon={FaFileInvoice}
      title="Create Reservasi"
      subtitle="Buat reservasi berdasarkan invoice yang sudah tersedia."
      onClose={() => navigate("/reservation")}
      footer={<DetailActionFooter actions={actions} />}
    >
      {/* NOTIFICATION */}

      {errorMessage && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
          {successMessage}
        </div>
      )}

      {/* PILIH INVOICE */}

      <DetailSection
        icon={FaSearchPlus}
        title="Pilih Invoice"
        variant="blue"
      >
        <div className="grid grid-cols-1 gap-4 p-5">
          <Field>
            <FieldLabel>
              Nomor Invoice <span className="text-red-500">*</span>
            </FieldLabel>

            <SearchablePopover<InvoiceApiRecord>
              open={openInvoice}
              onOpenChange={setOpenInvoice}
              search={searchInvoice}
              onSearchChange={setSearchInvoice}
              placeholder={
                searchLoading
                  ? "Memuat daftar invoice..."
                  : "Pilih atau cari nomor invoice"
              }
              selectedLabel={selectedInvoice?.invoice_number ?? null}
              selectedKey={
                selectedInvoice ? String(selectedInvoice.id) : null
              }
              items={invoiceResults}
              getKey={(invoice) => String(invoice.id)}
              renderItem={(invoice) => {
                const record = invoice as InvoiceSearchRecord;

                const status =
                  record.status_label ?? record.status ?? "Done";

                return (
                  <div className="flex w-full items-center justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-white">
                        {invoice.invoice_number}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {invoice.customer_name ?? "-"}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                      {status}
                    </span>
                  </div>
                );
              }}
              onSelect={handleSelectInvoice}
              emptyText={
                searchLoading
                  ? "Memuat daftar invoice..."
                  : searchInvoice.trim()
                    ? "Invoice berstatus Done tidak ditemukan."
                    : "Belum ada invoice berstatus Done."
              }
              debounceDelay={400}
            />
          </Field>

          {invoiceLoading && (
            <p className="text-sm text-slate-500">
              Mengambil detail invoice...
            </p>
          )}

          {selectedInvoice && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/20">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 dark:bg-slate-800">
                  <FaFileInvoice size={18} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                    {selectedInvoice.invoice_number}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {selectedInvoice.customer_name ?? "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                  Done
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleChangeInvoice}
                >
                  Ganti
                </Button>
              </div>
            </div>
          )}
        </div>
      </DetailSection>

      {/* DETAIL INVOICE */}

      {selectedInvoice && (
        <>
          {/* INFORMASI INVOICE */}

          <DetailSection
            icon={FaFileInvoice}
            title="Informasi Invoice"
            variant="blue"
          >
            <div className="space-y-5 p-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {hasValue(selectedInvoice.invoice_number) && (
                  <InfoItem
                    label="Nomor Invoice"
                    value={selectedInvoice.invoice_number}
                  />
                )}

                {hasValue(selectedInvoice.partner_name) && (
                  <InfoItem
                    label="Nama Group"
                    value={selectedInvoice.partner_name}
                  />
                )}

                {hasValue(
                  selectedInvoice.partner_province ??
                  selectedInvoice.partner_branch_province
                ) && (
                    <InfoItem
                      label="Provinsi"
                      value={
                        selectedInvoice.partner_province ??
                        selectedInvoice.partner_branch_province
                      }
                    />
                  )}

                {hasValue(
                  selectedInvoice.partner_city ??
                  selectedInvoice.partner_branch_city
                ) && (
                    <InfoItem
                      label="Kota"
                      value={
                        selectedInvoice.partner_city ??
                        selectedInvoice.partner_branch_city
                      }
                    />
                  )}

                {hasValue(selectedInvoice.sales_person_name) && (
                  <InfoItem
                    label="Sales Person"
                    value={selectedInvoice.sales_person_name}
                  />
                )}

                {hasValue(selectedInvoice.arrival_date) && (
                  <InfoItem
                    label="Tanggal Kedatangan"
                    value={selectedInvoice.arrival_date}
                  />
                )}

                {hasValue(selectedInvoice.customer_phone) && (
                  <InfoItem
                    label="Kontak PIC"
                    value={selectedInvoice.customer_phone}
                  />
                )}

                {hasValue(selectedInvoice.customer_contact_person) && (
                  <InfoItem
                    label="Nama PIC"
                    value={selectedInvoice.customer_contact_person}
                  />
                )}

                {hasValue(selectedInvoice.segment_name) && (
                  <InfoItem
                    label="Segment"
                    value={selectedInvoice.segment_name}
                  />
                )}

                {isCorporate &&
                  hasValue(selectedInvoice.segment_detail_name) && (
                    <InfoItem
                      label="Bidang Usaha"
                      value={selectedInvoice.segment_detail_name}
                    />
                  )}

                {isCorporate &&
                  hasValue(selectedInvoice.sub_segment_detail_name) && (
                    <InfoItem
                      label="Jenis Usaha"
                      value={selectedInvoice.sub_segment_detail_name}
                    />
                  )}

                {hasValue(selectedInvoice.partner_branch_name) && (
                  <InfoItem
                    label="Nama Travel / Agent"
                    value={selectedInvoice.partner_branch_name}
                  />
                )}
              </div>
            </div>
          </DetailSection>

          {/* DETAIL PESANAN */}

          <DetailSection
            icon={ClipboardList}
            title="Detail Pesanan"
            variant="orange"
          >
            <div className="p-5">
              <DetailOrderTable data={invoiceOrderItems} />
            </div>
          </DetailSection>

          {/* INFORMASI RESERVASI */}

          <DetailSection
            icon={CalendarDays}
            title="Informasi Reservasi"
            variant="green"
          >
            <div className="grid gap-5 p-5 md:grid-cols-3">
              <Field>
                <FieldLabel>Access Tour Leader</FieldLabel>

                <Input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={accessTourLeader}
                  onChange={(event) =>
                    setAccessTourLeader(event.target.value)
                  }
                  placeholder="Masukkan jumlah"
                />
              </Field>

              <Field>
                <FieldLabel>Arrival Type</FieldLabel>

                <Input
                  value={arrivalType}
                  onChange={(event) =>
                    setArrivalType(event.target.value)
                  }
                  placeholder="Masukkan jenis kedatangan"
                />
              </Field>

              <Field>
                <FieldLabel>Arrival Time</FieldLabel>

                <Input
                  type="time"
                  value={arrivalTime}
                  onChange={(event) =>
                    setArrivalTime(event.target.value)
                  }
                />
              </Field>
            </div>
          </DetailSection>

          {/* EVENT ORDER */}

          <DetailSection
            icon={Users}
            title="Event Order"
            variant="orange"
            action={
              <Button
                variant="primer"
                size="lg"
                onClick={handleAddEventOrder}
              >
                <Plus size={16} />
                Tambah
              </Button>

            }
          >
            <div className="space-y-4 p-5">
              {generateLoading && (
                <p className="text-sm text-slate-500">
                  Mengambil Event Order dari invoice...
                </p>
              )}

              {!generateLoading && eventOrders.length === 0 && (
                <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-8 text-center dark:border-slate-700 dark:bg-slate-900/30">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                    <Building2 size={30} strokeWidth={1.5} />
                  </div>

                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Belum Ada Event Order
                  </h3>

                  <p className="mt-1 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    Event Order yang dibuat akan ditampilkan di sini.
                  </p>
                </div>
              )}

              {eventOrders.map((item, index) => {
                const status = getEventOrderStatus(
                  item.status,
                  item.status_label,
                );

                return (
                  <div
                    key={index}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                  >
                    {/* HEADER EVENT ORDER */}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/30">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                          <Building2 size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Event Order #{index + 1}
                          </p>

                          <h3 className="break-words text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {hasValue(item.department_name)
                              ? item.department_name
                              : "Nama Departemen -"}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            status.positive ? "success" : "secondary"
                          }
                          className="shrink-0 gap-1.5 px-2.5 py-1"
                        >
                          {status.positive ? (
                            <CircleCheck size={13} />
                          ) : (
                            <CircleX size={13} />
                          )}

                          {status.label}
                        </Badge>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleRemoveEventOrder(index)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>

                    {/* INFORMASI EVENT ORDER */}

                    <div className="space-y-4 p-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <InfoItem
                          label="Product ID"
                          value={item.product_id}
                        />

                        <InfoItem
                          label="Quantity"
                          value={item.quantity}
                        />

                        <InfoItem
                          label="Unit Price"
                          value={item.unit_price}
                        />

                        <InfoItem
                          label="Total Price"
                          value={item.total_price}
                        />

                        <InfoItem
                          label="Meal Voucher"
                          value={item.meal_voucher}
                        />

                        <InfoItem
                          label="Voucher Tour Leader"
                          value={item.voucher_tour_leader}
                        />

                        <InfoItem
                          label="Shopping Voucher"
                          value={item.shopping_voucher}
                        />

                        <InfoItem
                          label="Status"
                          value={item.status}
                        />

                        <InfoItem
                          label="Status Label"
                          value={item.status_label}
                        />
                      </div>

                      <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
                        <InfoItem
                          label="Deskripsi"
                          value={item.description}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </DetailSection>
        </>
      )}
    </DetailPageLayout>
  );
}
