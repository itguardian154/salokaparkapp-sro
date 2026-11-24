
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

import {
  FaSearchPlus,
  FaFileInvoice,
  FaSave,
} from "react-icons/fa";

import {
  Building2Icon,
  CalendarDays,
  Clock,
  HandCoins,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

import SearchablePopover from "@/components/searchable-popover";

import DetailActionFooter, {
  type DetailAction,
} from "@/components/detail-page/detail-action-footer";
import DetailPageLayout from "@/components/detail-page/detail-page-ayout";
import DetailSection from "@/components/detail-page/detail-section";

import type {
  InvoiceDetail,
  InvoiceApiRecord,
  InvoicePaymentRow,
} from "@/features/invoice/types/invoice";

import DetailOrderTable from "@/features/invoice/components/detail-order-table";
import DetailPaymentTable from "@/features/invoice/components/detail-payment-table";
import PaymentInformation from "@/features/invoice/components/payment-information";

import type { InvoiceOrder } from "@/features/invoice/types/invoice-order";

import { useDepartemen } from "@/features/departemen/hooks/use-departemen";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import CreateEventOrderModal from "./create-event-order";
import EventOrderContent from "./event-order-content";

import useCreateReservasi, {
  type InvoiceSearchRecord,
} from "../hooks/use-create-reservasi";

// ==============================
// TYPES
// ==============================

type InfoItemProps = {
  label: string;
  value: ReactNode;
};

// ==============================
// HELPERS
// ==============================

const hasValue = (value: unknown) =>
  value !== null &&
  value !== undefined &&
  String(value).trim() !== "";

const InfoItem = ({ label, value }: InfoItemProps) => (
  <div className="min-w-0 space-y-1">
    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {label}
    </p>

    <div className="wrap-break-words text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-200">
      {hasValue(value) ? value : "-"}
    </div>
  </div>
);

// ==============================
// MAPPING DETAIL PESANAN
// ==============================

const mapInvoiceItemsToOrders = (
  items: InvoiceDetail["items"]
): InvoiceOrder[] =>
  (items ?? []).map((item) => ({
    id: item.id,
    productId: item.product_id ?? 0,
    product: item.product_name,
    description: item.product_description ?? "",
    quantity: Number(item.quantity) || 0,
    compliment:
      item.bonus_quantity !== null &&
        item.bonus_quantity !== undefined
        ? Number(item.bonus_quantity) || 0
        : null,
    unitPrice: Number(item.unit_price) || 0,
    isTicket: Boolean(item.is_ticket),
    discountPrice: Number(item.discount_amount) || 0,
    subtotal: Number(item.subtotal) || 0,
  }));

// ==============================
// MAPPING DETAIL PEMBAYARAN
// ==============================

const mapInvoicePayments = (
  payments: NonNullable<InvoiceDetail["payments"]>
): InvoicePaymentRow[] =>
  payments.map((payment, index) => {
    const proof = payment.proof_of_payment ?? "";

    const attachments =
      payment.attachments?.length
        ? payment.attachments
        : proof
          ? [
            {
              name: "Bukti Pembayaran",
              url: proof,
            },
          ]
          : [];

    return {
      id: String(payment.id ?? payment.payment_id ?? index + 1),
      serverId: payment.payment_id ?? payment.id,

      paymentDate: payment.payment_date ?? null,
      paymentType: payment.payment_type ?? "",
      paymentTypeValue: payment.payment_type ?? "",

      uploadType:
        payment.payment_type === "surat_keterangan"
          ? "surat_keterangan"
          : "bukti_bayar",

      paymentMethod: payment.payment_method ?? "",
      accountHolderName: payment.account_holder_name ?? "",
      depositNumber: payment.deposit_number ?? "",
      fromBank: payment.from_bank ?? "",
      toBank: payment.to_bank ?? "",
      amount: payment.amount ?? 0,
      notes: payment.notes ?? "",
      proof,

      attachments,
      pending: payment.pending ?? false,
      editable: false,
    };
  });

// ==============================
// MAIN COMPONENT
// ==============================

export default function CreateReservasi() {
  const navigate = useNavigate();

  // ==============================
  // DEPARTEMEN
  // ==============================

  const {
    departemen,
    searchDepartemen,
    setSearchDepartemen,
    loading: loadingDepartemen,
    error: departemenError,
  } = useDepartemen();

  const departemenOptions = {
    items: departemen,
    search: searchDepartemen,
    onSearchChange: setSearchDepartemen,
    loading: loadingDepartemen,
    error: departemenError,
  };

  // ==============================
  // CREATE RESERVASI HOOK
  // ==============================

  const {
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

    accessTourLeader,
    setAccessTourLeader,
    arrivalType,
    setArrivalType,
    arrivalTime,
    setArrivalTime,

    eventOrders,
    generateLoading,
    openCreateEventOrder,
    editingEventOrderIndex,
    handleEditEventOrder,
    handleSubmitEventOrder,
    handleCloseEventOrderModal,

    submitting,
    errorMessage,
    successMessage,
    handleSubmit,
  } = useCreateReservasi();

  // ==============================
  // DETAIL PESANAN
  // ==============================

  const detailPesanan = selectedInvoice
    ? mapInvoiceItemsToOrders(selectedInvoice.items ?? [])
    : [];

  // ==============================
  // INFORMASI PEMBAYARAN
  // ==============================

  const totalAmount = Number(selectedInvoice?.total_amount ?? 0);
  const paidAmount = Number(selectedInvoice?.paid_amount ?? 0);
  const remainingAmount = Math.max(totalAmount - paidAmount, 0);

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
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300">
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
          <DetailSection
            icon={FaFileInvoice}
            title="Informasi Invoice"
            variant="blue"
          >
            <div className="rounded-xl border-t-0 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                {hasValue(selectedInvoice.invoice_number) && (
                  <InfoItem
                    label="Nomor Invoice"
                    value={selectedInvoice.invoice_number}
                  />
                )}

                {hasValue(selectedInvoice.invoice_date) && (
                  <InfoItem
                    label="Tanggal Invoice"
                    value={new Date(
                      selectedInvoice.invoice_date!
                    ).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  />
                )}

                {hasValue(selectedInvoice.booking_type) && (
                  <InfoItem
                    label="Jenis Pemesanan"
                    value={
                      <span
                        className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${selectedInvoice.booking_type?.toLowerCase() ===
                            "travel"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                          }`}
                      >
                        {selectedInvoice.booking_type}
                      </span>
                    }
                  />
                )}

                {hasValue(selectedInvoice.customer_name) && (
                  <InfoItem
                    label="Nama Pelanggan"
                    value={selectedInvoice.customer_name}
                  />
                )}

                {hasValue(selectedInvoice.customer_address) && (
                  <InfoItem
                    label="Alamat Pelanggan"
                    value={selectedInvoice.customer_address}
                  />
                )}

                {hasValue(selectedInvoice.customer_city) && (
                  <InfoItem
                    label="Kota Pelanggan"
                    value={selectedInvoice.customer_city}
                  />
                )}

                {hasValue(selectedInvoice.customer_province) && (
                  <InfoItem
                    label="Provinsi Pelanggan"
                    value={selectedInvoice.customer_province}
                  />
                )}

                {hasValue(selectedInvoice.customer_phone) && (
                  <InfoItem
                    label="WhatsApp Pelanggan"
                    value={selectedInvoice.customer_phone}
                  />
                )}

                {hasValue(selectedInvoice.customer_contact_person) && (
                  <InfoItem
                    label="PIC Pelanggan"
                    value={selectedInvoice.customer_contact_person}
                  />
                )}

                {hasValue(selectedInvoice.partner_name) && (
                  <InfoItem
                    label="Nama Group"
                    value={selectedInvoice.partner_name}
                  />
                )}

                {hasValue(selectedInvoice.partner_association_name) && (
                  <InfoItem
                    label="Asosiasi"
                    value={selectedInvoice.partner_association_name}
                  />
                )}

                {hasValue(selectedInvoice.partner_city) && (
                  <InfoItem
                    label="Kota Group"
                    value={selectedInvoice.partner_city}
                  />
                )}

                {hasValue(selectedInvoice.partner_province) && (
                  <InfoItem
                    label="Provinsi Group"
                    value={selectedInvoice.partner_province}
                  />
                )}

                {hasValue(selectedInvoice.partner_phone) && (
                  <InfoItem
                    label="WhatsApp Group"
                    value={selectedInvoice.partner_phone}
                  />
                )}

                {hasValue(selectedInvoice.partner_contact_person) && (
                  <InfoItem
                    label="PIC Group"
                    value={selectedInvoice.partner_contact_person}
                  />
                )}

                {hasValue(selectedInvoice.partner_branch_name) && (
                  <InfoItem
                    label="Nama Cabang"
                    value={selectedInvoice.partner_branch_name}
                  />
                )}

                {hasValue(selectedInvoice.partner_branch_city) && (
                  <InfoItem
                    label="Kota Cabang"
                    value={selectedInvoice.partner_branch_city}
                  />
                )}

                {hasValue(selectedInvoice.partner_branch_province) && (
                  <InfoItem
                    label="Provinsi Cabang"
                    value={selectedInvoice.partner_branch_province}
                  />
                )}

                {hasValue(selectedInvoice.partner_branch_phone) && (
                  <InfoItem
                    label="WhatsApp Cabang"
                    value={selectedInvoice.partner_branch_phone}
                  />
                )}

                {hasValue(selectedInvoice.partner_branch_contact_person) && (
                  <InfoItem
                    label="PIC Cabang"
                    value={selectedInvoice.partner_branch_contact_person}
                  />
                )}

                {hasValue(selectedInvoice.sales_person_name) && (
                  <InfoItem
                    label="Nama Sales"
                    value={selectedInvoice.sales_person_name}
                  />
                )}

                {hasValue(selectedInvoice.arrival_date) && (
                  <InfoItem
                    label="Tanggal Kedatangan"
                    value={new Date(
                      selectedInvoice.arrival_date!
                    ).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  />
                )}

                {hasValue(selectedInvoice.segment_name) && (
                  <InfoItem
                    label="Segmen"
                    value={selectedInvoice.segment_name}
                  />
                )}

                {hasValue(selectedInvoice.segment_detail_name) && (
                  <InfoItem
                    label={
                      selectedInvoice.segment_name?.toLowerCase() ===
                        "edukasi"
                        ? "Jenis"
                        : "Bidang Usaha"
                    }
                    value={selectedInvoice.segment_detail_name}
                  />
                )}

                {hasValue(selectedInvoice.sub_segment_detail_name) && (
                  <InfoItem
                    label={
                      selectedInvoice.segment_name?.toLowerCase() ===
                        "edukasi"
                        ? "Jenjang"
                        : "Jenis Usaha"
                    }
                    value={selectedInvoice.sub_segment_detail_name}
                  />
                )}

                {hasValue(selectedInvoice.segment_option_name) && (
                  <InfoItem
                    label="Status"
                    value={selectedInvoice.segment_option_name}
                  />
                )}
              </div>

              {hasValue(selectedInvoice.notes) && (
                <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-700">
                  <InfoItem
                    label="Deskripsi"
                    value={
                      <p className="text-sm italic leading-relaxed text-slate-600 dark:text-slate-300">
                        "{selectedInvoice.notes}"
                      </p>
                    }
                  />
                </div>
              )}
            </div>
          </DetailSection>

          {/* DETAIL PESANAN */}

          <DetailSection
            icon={FaFileInvoice}
            title="Detail Pesanan"
            variant="blue"
          >
            <div className="p-5">
              <DetailOrderTable
                data={detailPesanan}
                hideActions
              />
            </div>
          </DetailSection>

          {/* INFORMASI PEMBAYARAN */}

          <DetailSection
            icon={HandCoins}
            title="Informasi Pembayaran"
            variant="blue"
          >
            <div className="p-5">
              <PaymentInformation
                totalAmount={totalAmount}
                paidAmount={paidAmount}
                remainingAmount={remainingAmount}
              />
            </div>

            <div className="p-5">
              <DetailPaymentTable
                data={mapInvoicePayments(selectedInvoice.payments ?? [])}
                hideActions
              />
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
                <FieldLabel>Jenis Kedatangan</FieldLabel>

                <Select
                  value={arrivalType}
                  onValueChange={(value) =>
                    setArrivalType(value ?? "")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih jenis kedatangan">
                      {arrivalType === "early"
                        ? "Early"
                        : arrivalType === "normal"
                          ? "Normal"
                          : arrivalType === "late"
                            ? "Late"
                            : undefined}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent
                    align="start"
                    alignItemWithTrigger={false}
                  >
                    <SelectItem value="early">Early</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Jam Kedatangan</FieldLabel>

                <Popover>
                  <PopoverTrigger>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      {arrivalTime || "Pilih jam kedatangan"}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-64 p-3"
                    align="start"
                  >
                    <div className="flex items-center gap-3">
                      <Select
                        value={arrivalTime.split(":")[0] || ""}
                        onValueChange={(hour) => {
                          const minute =
                            arrivalTime.split(":")[1] || "00";

                          setArrivalTime(`${hour}:${minute}`);
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Jam" />
                        </SelectTrigger>

                        <SelectContent className="max-h-60">
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem
                              key={i}
                              value={String(i).padStart(2, "0")}
                            >
                              {String(i).padStart(2, "0")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <span className="font-semibold">:</span>

                      <Select
                        value={arrivalTime.split(":")[1] || ""}
                        onValueChange={(minute) => {
                          const hour =
                            arrivalTime.split(":")[0] || "00";

                          setArrivalTime(`${hour}:${minute}`);
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Menit" />
                        </SelectTrigger>

                        <SelectContent className="max-h-60">
                          {Array.from({ length: 60 }, (_, i) => (
                            <SelectItem
                              key={i}
                              value={String(i).padStart(2, "0")}
                            >
                              {String(i).padStart(2, "0")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </PopoverContent>
                </Popover>
              </Field>
            </div>
          </DetailSection>

          {/* EVENT ORDER */}

          <DetailSection
            icon={Building2Icon}
            title="Event Order"
            variant="orange"
          >
            <div className="space-y-4 p-5">
              {eventOrders.map((item, index) => (
                <EventOrderContent
                  key={index}
                  item={item}
                  onEdit={() => handleEditEventOrder(index)}
                />
              ))}
            </div>
          </DetailSection>
        </>
      )}

      {/* MODAL EDIT EVENT ORDER */}

      {/* MODAL EDIT EVENT ORDER */}

      <CreateEventOrderModal
        open={openCreateEventOrder}
        onClose={handleCloseEventOrderModal}
        onSubmit={handleSubmitEventOrder}
        submitting={submitting}
        initialData={
          editingEventOrderIndex !== null
            ? eventOrders[editingEventOrderIndex]
            : null
        }
        departemenOptions={departemenOptions}
        invoiceItems={(selectedInvoice?.items ?? [])
          .filter(
            (item): item is typeof item & { product_id: number } =>
              typeof item.product_id === "number",
          )
          .map((item) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_description: item.product_description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
          }))}
      />
    </DetailPageLayout>
  );
}
