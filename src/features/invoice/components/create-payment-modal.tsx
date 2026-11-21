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
import SearchablePopover from "@/components/searchable-popover";
import { getInvoiceConfigurations } from "@/features/konfigurasi/invoice/service/configuration-service";
import PaymentInformation from "./payment-information";
import { invoicePaymentFormSchema } from "../schemas/invoice-form-schema";

type UploadType = "surat_keterangan" | "bukti_bayar" | "";

type CreatePaymentModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (payment: InvoicePaymentForm, uploadType: UploadType) => void;
  onSaveSuratKeterangan?: (files: File[]) => void;
  initialValue: InvoicePaymentForm;
  initialUploadType: UploadType;
  initialAttachmentNames?: string[];
  isEditing?: boolean;
  hasPendingPayment: boolean;
  totalAmount: string | number;
  paidAmount: string | number;
  remainingAmount: string | number;
};

type UploadFieldProps = {
  label: string;
  files: File[];
  existingFileNames?: string[];
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  accept?: string;
  formatHint?: string;
  onFilesChange: (files: File[]) => void;
};

function UploadField({
  label,
  files,
  existingFileNames = [],
  multiple = false,
  maxFiles,
  maxFileSize = 5 * 1024 * 1024,
  accept = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png",
  formatHint = "Format PDF, JPG, PNG (maks. 5 MB)",
  onFilesChange,
}: UploadFieldProps) {
  const [error, setError] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    const withinCount =
      maxFiles === undefined || selectedFiles.length <= maxFiles;
    const allowedExtensions = new Set(
      accept
        .split(",")
        .filter((value) => value.startsWith("."))
        .map((value) => value.slice(1).toLowerCase()),
    );
    const validFiles = selectedFiles.filter((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase();
      return (
        file.size <= maxFileSize &&
        Boolean(extension && allowedExtensions.has(extension))
      );
    });

    setError(
      !withinCount
        ? `Maksimal ${maxFiles} file.`
        : validFiles.length === selectedFiles.length
          ? ""
          : `Pastikan format file sesuai dan ukuran setiap file maksimal ${Math.floor(maxFileSize / (1024 * 1024))} MB.`,
    );

    onFilesChange(
      !withinCount
        ? []
        : maxFiles === undefined
          ? validFiles
          : validFiles.slice(0, maxFiles),
    );

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
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
          />
        </label>

        <span className="text-xs text-slate-500">{formatHint}</span>

        {(files.length > 0 || existingFileNames.length > 0) && (
          <span className="w-full truncate text-xs text-slate-600 dark:text-slate-300">
            {files.length > 0
              ? files.map((file) => file.name).join(", ")
              : existingFileNames.join(", ")}
          </span>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </Field>
  );
}

const createEmptyPaymentForm = (): InvoicePaymentForm => ({
  paymentDate: undefined,
  paymentType: "",
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
  initialUploadType,
  initialAttachmentNames = [],
  isEditing = false,
  hasPendingPayment,
  totalAmount,
  paidAmount,
  remainingAmount,
}: CreatePaymentModalProps) {
  const [bankAccountOptions, setBankAccountOptions] = useState<string[]>([]);
  const [bankAccountPopoverOpen, setBankAccountPopoverOpen] = useState(false);

  const [value, setValue] = useState<InvoicePaymentForm>(
    createEmptyPaymentForm,
  );

  const [uploadType, setUploadType] = useState<UploadType>("");

  const [suratKeteranganFiles, setSuratKeteranganFiles] = useState<File[]>([]);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const isCashPayment = ["tunai", "cash"].includes(
    value.paymentMethod.trim().toLowerCase(),
  );

  useEffect(() => {
    if (open) {
      setUploadType(initialUploadType);
      setSuratKeteranganFiles([]);
      setValidationErrors({});

      setValue({
        ...initialValue,
        paymentMethod:
          initialValue.paymentMethod.toLowerCase() === "cash"
            ? "Tunai"
            : initialValue.paymentMethod,
      });
    }
  }, [hasPendingPayment, initialUploadType, initialValue, open]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    void getInvoiceConfigurations()
      .then((configurations) => {
        if (!cancelled) {
          const bankAccount = configurations["Bank Account"]?.trim();
          setBankAccountOptions(bankAccount ? [bankAccount] : []);
        }
      })
      .catch(() => {
        if (!cancelled) setBankAccountOptions([]);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

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
        uploadType: "Silakan pilih tipe pembayaran terlebih dahulu.",
      });
      return;
    }

    // Jika memilih Surat Keterangan
    if (uploadType === "surat_keterangan") {
      if (suratKeteranganFiles.length === 0) {
        if (initialAttachmentNames.length > 0 && onSaveSuratKeterangan) {
          onSaveSuratKeterangan([]);
          onClose();
          return;
        }
        setValidationErrors({
          suratKeteranganFiles: "Silakan upload surat keterangan.",
        });
        return;
      }

      if (
        suratKeteranganFiles.length > 20 ||
        suratKeteranganFiles.some((file) => {
          const extension = file.name.split(".").pop()?.toLowerCase();
          return (
            file.size > 10 * 1024 * 1024 ||
            !["jpg", "jpeg", "png", "webp", "pdf"].includes(extension ?? "")
          );
        })
      ) {
        setValidationErrors({
          suratKeteranganFiles:
            "Maksimal 20 file berformat JPG, JPEG, PNG, WEBP, atau PDF dengan ukuran maksimal 10 MB per file.",
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
    onSave(value, uploadType);
    onClose();
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={isEditing ? "Ubah Pembayaran" : "Tambah Pembayaran"}
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
          {/* PILIHAN tipe pembayaran  */}
          <Field>
            <FieldLabel className="text-xs">Tipe Pembayaran</FieldLabel>
            <Select value={uploadType} onValueChange={handleUploadTypeChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Pilih tipe pembayaran">
                  {uploadType === "surat_keterangan"
                    ? "Surat Keterangan"
                    : uploadType === "bukti_bayar"
                      ? "Bukti Bayar"
                      : "Pilih tipe pembayaran"}
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
                maxFiles={20}
                maxFileSize={10 * 1024 * 1024}
                accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                formatHint="Format JPG, JPEG, PNG, WEBP, PDF (maks. 20 file, 10 MB per file)"
                files={suratKeteranganFiles}
                existingFileNames={initialAttachmentNames}
                onFilesChange={setSuratKeteranganFiles}
              />
              <p className="text-xs text-slate-500">
                File akan diunggah saat invoice disimpan.
              </p>

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
                 {/* METODE BAYAR */}
          <Field>
            <FieldLabel className="text-xs">Metode Bayar</FieldLabel>

            <Select
              value={value.paymentMethod}
              onValueChange={(method: string | null) => {
                if (method !== null) {
                  updateValue({
                    paymentMethod: method === "cash" ? "Tunai" : method,
                  });
                  setValidationErrors((current) => ({
                    ...current,
                    paymentMethod: "",
                    proofFiles: "",
                    accountHolderName: "",
                    fromBank: "",
                    toBank: "",
                  }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih metode bayar" />
              </SelectTrigger>

              <SelectContent align="start" alignItemWithTrigger={false}>
                <SelectItem value="Tunai">Tunai</SelectItem>
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
          
                {!isCashPayment && (
                  <>
                    {/* BUKTI BAYAR */}
                    <div>
                      <UploadField
                        label="Bukti Bayar"
                        multiple
                        files={value.proofFiles}
                        existingFileNames={initialAttachmentNames}
                        onFilesChange={(proofFiles) =>
                          updateValue({ proofFiles })
                        }
                      />
                      {validationErrors.proofFiles && (
                        <p className="text-sm text-red-500" role="alert">
                          {validationErrors.proofFiles}
                        </p>
                      )}
                    </div>

                    {/* ATAS NAMA REKENING */}
                    <Field>
                      <FieldLabel className="text-xs">
                        Atas Nama Rekening
                      </FieldLabel>

                      <Input
                        className="h-10"
                        value={value.accountHolderName}
                        onChange={(event) =>
                          updateValue({ accountHolderName: event.target.value })
                        }
                        placeholder="Nama pemilik rekening"
                      />
                      {validationErrors.accountHolderName && (
                        <p className="text-sm text-red-500" role="alert">
                          {validationErrors.accountHolderName}
                        </p>
                      )}
                    </Field>
                  </>
                )}

                {!isCashPayment && (
                  <>
                    {/* NOMOR SO / GROUP DEPOSIT */}
                    <Field>
                      <FieldLabel className="text-xs">
                        Nomor SO / Group Deposit
                      </FieldLabel>

                      <Input
                        className="h-10"
                        value={value.depositNumber}
                        onChange={(event) =>
                          updateValue({ depositNumber: event.target.value })
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
                          if (bank !== null) updateValue({ fromBank: bank });
                        }}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Pilih rekening asal" />
                        </SelectTrigger>

                        <SelectContent
                          align="start"
                          alignItemWithTrigger={false}
                        >
                          <SelectItem value="BCA">BCA</SelectItem>
                          <SelectItem value="Mandiri">Mandiri</SelectItem>
                          <SelectItem value="BRI">BRI</SelectItem>
                          <SelectItem value="BNI">BNI</SelectItem>
                          <SelectItem value="Tunai">Tunai</SelectItem>
                        </SelectContent>
                      </Select>
                      {validationErrors.fromBank && (
                        <p className="text-sm text-red-500" role="alert">
                          {validationErrors.fromBank}
                        </p>
                      )}
                    </Field>

                    {/* KE REKENING */}
                    <Field>
                      <FieldLabel className="text-xs">
                        Ke Rekening Saloka
                      </FieldLabel>
                      <SearchablePopover<string>
                        open={bankAccountPopoverOpen}
                        onOpenChange={setBankAccountPopoverOpen}
                        items={bankAccountOptions}
                        placeholder="Pilih rekening tujuan"
                        selectedLabel={
                          value.toBank.replace(/\s*\n\s*/g, " - ") || null
                        }
                        selectedKey={value.toBank}
                        getKey={(bankAccount) => bankAccount}
                        renderItem={(bankAccount) =>
                          bankAccount.replace(/\s*\n\s*/g, " - ")
                        }
                        onSelect={(bankAccount) => {
                          updateValue({ toBank: bankAccount });
                          setBankAccountPopoverOpen(false);
                        }}
                      />

                      {validationErrors.toBank && (
                        <p className="text-sm text-red-500" role="alert">
                          {validationErrors.toBank}
                        </p>
                      )}
                    </Field>
                  </>
                )}

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
