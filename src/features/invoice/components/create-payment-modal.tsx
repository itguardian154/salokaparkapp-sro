import AppModal from "@/components/base-modal";
import DateRangePicker from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatRupiah } from "@/lib/utils";
import { useEffect, useState, type ChangeEvent } from "react";
import { FaSave } from "react-icons/fa";
import { FaPlus, FaUpload } from "react-icons/fa6";
import type { InvoicePaymentForm } from "../types/invoice";
import PaymentInformation from "./payment-information";
import { invoicePaymentFormSchema } from "../schemas/invoice-form-schema";

type UploadType = "surat_keterangan" | "bukti_bayar" | "";

type CreatePaymentModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (payment: InvoicePaymentForm) => void;
  onSaveSuratKeterangan?: (files: File[]) => void;
  initialValue: InvoicePaymentForm;
  hasPendingPayment: boolean;
  totalAmount: string | number;
  paidAmount: string | number;
  remainingAmount: string | number;
};

type UploadFieldProps = {
  label: string;
  files: File[];
  multiple?: boolean;
  onFilesChange: (files: File[]) => void;
};

function UploadField({
  label,
  files,
  multiple = false,
  onFilesChange,
}: UploadFieldProps) {
  const [error, setError] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    const validFiles = selectedFiles.filter(
      (file) => file.size <= 5 * 1024 * 1024,
    );

    setError(
      validFiles.length === selectedFiles.length
        ? ""
        : "Ukuran setiap file maksimal 5 MB.",
    );

    onFilesChange(validFiles);

    // Reset input agar file yang sama bisa dipilih kembali.
    event.target.value = "";
  };

  return (
    <Field className="gap-1.5">
      <FieldLabel className="text-xs">{label}</FieldLabel>

      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
          <FaUpload size={13} />
          Upload File
          <input
            type="file"
            className="sr-only"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            multiple={multiple}
            onChange={handleChange}
          />
        </label>

        <span className="text-xs text-slate-500">
          Format PDF, JPG, PNG (maks. 5 MB)
        </span>

        {files.length > 0 && (
          <span className="w-full truncate text-xs text-slate-600 dark:text-slate-300">
            {files.map((file) => file.name).join(", ")}
          </span>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </Field>
  );
}

const createEmptyPaymentForm = (): InvoicePaymentForm => ({
  paymentDate: undefined,
  paymentType: "dp",
  paymentMethod: "",
  accountHolderName: "",
  depositNumber: "",
  fromBank: "",
  toBank: "",
  amount: "",
  notes: "",
  proofFiles: [],
});

export default function CreatePaymentModal({
  open,
  onClose,
  onSave,
  onSaveSuratKeterangan,
  initialValue,
  hasPendingPayment,
  totalAmount,
  paidAmount,
  remainingAmount,
}: CreatePaymentModalProps) {
  const [value, setValue] = useState<InvoicePaymentForm>(
    createEmptyPaymentForm,
  );

  const [uploadType, setUploadType] = useState<UploadType>("");

  const [suratKeteranganFiles, setSuratKeteranganFiles] = useState<File[]>([]);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (open) {
      setUploadType(hasPendingPayment ? "bukti_bayar" : "");
      setSuratKeteranganFiles([]);
      setValidationErrors({});

      setValue(hasPendingPayment ? initialValue : createEmptyPaymentForm());
    }
  }, [hasPendingPayment, initialValue, open]);

  const updateValue = (updates: Partial<InvoicePaymentForm>) => {
    setValue((current) => ({
      ...current,
      ...updates,
    }));
  };

  const handleUploadTypeChange = (type: string | null) => {
    if (type === null) return;

    setUploadType(type as UploadType);
    setValidationErrors({});
  };

  const handleSave = () => {
    // Validasi pilihan upload
    if (!uploadType) {
      setValidationErrors({
        uploadType: "Silakan pilih jenis upload terlebih dahulu.",
      });
      return;
    }

    // Jika memilih Surat Keterangan
    if (uploadType === "surat_keterangan") {
      if (suratKeteranganFiles.length === 0) {
        setValidationErrors({
          suratKeteranganFiles: "Silakan upload surat keterangan.",
        });
        return;
      }

      if (!onSaveSuratKeterangan) {
        setValidationErrors({
          suratKeteranganFiles:
            "Handler penyimpanan surat keterangan belum tersedia.",
        });
        return;
      }

      onSaveSuratKeterangan(suratKeteranganFiles);
      setValidationErrors({});
      onClose();
      return;
    }

    // Jika memilih Bukti Bayar
    const validation = invoicePaymentFormSchema.safeParse(value);

    if (!validation.success) {
      const nextErrors: Record<string, string> = {};

      validation.error.issues.forEach((issue) => {
        const field = String(issue.path[0]);
        nextErrors[field] ??= issue.message;
      });

      setValidationErrors(nextErrors);
      return;
    }

    setValidationErrors({});
    onSave(value);
    onClose();
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={hasPendingPayment ? "Ubah Pembayaran" : "Tambah Pembayaran"}
      icon={<FaPlus />}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="destructive" onClick={onClose}>
            Batal
          </Button>

          <Button variant="primer" onClick={handleSave}>
            <FaSave size={14} />
            Simpan
          </Button>
        </div>
      }
    >
      <AppModal.Section title="Informasi Pembayaran" showHeader={false}>
        <div className="space-y-5 p-4">
          <PaymentInformation
            totalAmount={totalAmount}
            paidAmount={paidAmount}
            remainingAmount={remainingAmount}
          />
          {/* PILIHAN JENIS UPLOAD */}
          <Field>
            <FieldLabel className="text-xs">Jenis Upload</FieldLabel>
            <Select value={uploadType} onValueChange={handleUploadTypeChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Pilih jenis upload">
                  {uploadType === "surat_keterangan"
                    ? "Surat Keterangan"
                    : uploadType === "bukti_bayar"
                      ? "Bukti Bayar"
                      : "Pilih jenis upload"}
                </SelectValue>
              </SelectTrigger>

              <SelectContent align="start" alignItemWithTrigger={false}>
                <SelectItem value="surat_keterangan">
                  Surat Keterangan
                </SelectItem>

                <SelectItem value="bukti_bayar">Bukti Bayar</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.uploadType && (
              <p className="text-sm text-red-500" role="alert">
                {validationErrors.uploadType}
              </p>
            )}
          </Field>

          {/* UPLOAD SURAT KETERANGAN */}
          {uploadType === "surat_keterangan" && (
            <div className="space-y-3">
              <UploadField
                label="Upload Surat Keterangan"
                multiple
                files={suratKeteranganFiles}
                onFilesChange={setSuratKeteranganFiles}
              />

              {validationErrors.suratKeteranganFiles && (
                <p className="text-sm text-red-500" role="alert">
                  {validationErrors.suratKeteranganFiles}
                </p>
              )}
            </div>
          )}

          {/* FORM BUKTI BAYAR */}
          {uploadType === "bukti_bayar" && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {/* BUKTI BAYAR */}
                <UploadField
                  label="Bukti Bayar"
                  multiple
                  files={value.proofFiles}
                  onFilesChange={(proofFiles) => updateValue({ proofFiles })}
                />

                {/* ATAS NAMA REKENING */}
                <Field>
                  <FieldLabel className="text-xs">
                    Atas Nama Rekening
                  </FieldLabel>

                  <Input
                    className="h-10"
                    value={value.accountHolderName}
                    onChange={(event) =>
                      updateValue({
                        accountHolderName: event.target.value,
                      })
                    }
                    placeholder="Nama pemilik rekening"
                  />
                </Field>

                {/* METODE BAYAR */}
                <Field>
                  <FieldLabel className="text-xs">Metode Bayar</FieldLabel>

                  <Select
                    value={value.paymentMethod}
                    onValueChange={(method: string | null) => {
                      if (method !== null) {
                        updateValue({ paymentMethod: method });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih metode bayar" />
                    </SelectTrigger>

                    <SelectContent align="start" alignItemWithTrigger={false}>
                      <SelectItem value="cash">Tunai</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>

                  {validationErrors.paymentMethod && (
                    <p className="text-sm text-red-500" role="alert">
                      {validationErrors.paymentMethod}
                    </p>
                  )}
                </Field>

                {/* NOMOR SO / GROUP DEPOSIT */}
                <Field>
                  <FieldLabel className="text-xs">
                    Nomor SO / Group Deposit
                  </FieldLabel>

                  <Input
                    className="h-10"
                    value={value.depositNumber}
                    onChange={(event) =>
                      updateValue({
                        depositNumber: event.target.value,
                      })
                    }
                    placeholder="Isi jika menggunakan deposit"
                  />
                </Field>

                {/* DARI REKENING */}
                <Field>
                  <FieldLabel className="text-xs">Dari Rekening</FieldLabel>

                  <Select
                    value={value.fromBank}
                    onValueChange={(bank: string | null) => {
                      if (bank !== null) {
                        updateValue({ fromBank: bank });
                      }
                    }}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Pilih rekening asal" />
                    </SelectTrigger>

                    <SelectContent align="start" alignItemWithTrigger={false}>
                      <SelectItem value="BCA">BCA</SelectItem>
                      <SelectItem value="Mandiri">Mandiri</SelectItem>
                      <SelectItem value="BRI">BRI</SelectItem>
                      <SelectItem value="BNI">BNI</SelectItem>
                      <SelectItem value="Tunai">Tunai</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                {/* KE REKENING */}
                <Field>
                  <FieldLabel className="text-xs">Ke Rekening Saloka</FieldLabel>

                  <Select
                    value={value.toBank}
                    onValueChange={(bank: string | null) => {
                      if (bank !== null) {
                        updateValue({ toBank: bank });
                      }
                    }}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Pilih rekening tujuan" />
                    </SelectTrigger>

                    <SelectContent align="start" alignItemWithTrigger={false}>
                      <SelectItem value="BCA">BCA</SelectItem>
                      <SelectItem value="Mandiri">Mandiri</SelectItem>
                      <SelectItem value="BRI">BRI</SelectItem>
                      <SelectItem value="BNI">BNI</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                {/* TANGGAL BAYAR */}
                <Field>
                  <FieldLabel className="text-xs">Tanggal Bayar</FieldLabel>

                  <DateRangePicker
                    mode="single"
                    value={value.paymentDate}
                    onChange={(paymentDate) => updateValue({ paymentDate })}
                  />

                  {validationErrors.paymentDate && (
                    <p className="text-sm text-red-500" role="alert">
                      {validationErrors.paymentDate}
                    </p>
                  )}
                </Field>

                {/* JUMLAH PEMBAYARAN */}
                <Field>
                  <FieldLabel className="text-xs">Jumlah Pembayaran</FieldLabel>

                  <Input
                    className="h-10 text-right font-semibold"
                    inputMode="numeric"
                    value={formatRupiah(value.amount)}
                    onChange={(event) => {
                      const rawValue = event.target.value.replace(/\D/g, "");

                      updateValue({
                        amount: String(Number(rawValue) || 0),
                      });
                    }}
                    placeholder="0"
                  />

                  {validationErrors.amount && (
                    <p className="text-sm text-red-500" role="alert">
                      {validationErrors.amount}
                    </p>
                  )}
                </Field>

                {/* CATATAN TAMBAHAN */}
                <Field className="md:col-span-2">
                  <FieldLabel className="text-xs">Catatan Tambahan</FieldLabel>

                  <Textarea
                    className="min-h-20 resize-y"
                    placeholder="Keterangan jika ada tambahan informasi"
                    value={value.notes}
                    onChange={(event) =>
                      updateValue({ notes: event.target.value })
                    }
                  />
                </Field>
              </div>
            </>
          )}
        </div>
      </AppModal.Section>
    </AppModal>
  );
}
