import DateRangePicker from "@/components/date-range-picker";
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
import type { InvoicePaymentForm } from "../types/invoice";
import { useState, type ChangeEvent } from "react";
import { FaUpload } from "react-icons/fa6";

type PaymentInformationProps = {
  totalInvoice: number;
  value: InvoicePaymentForm;
  onChange: (value: InvoicePaymentForm) => void;
  onProofChange?: (hasProof: boolean) => void;
};

type UploadFieldProps = {
  label: string;
  description: string;
  multiple?: boolean;
  onFilesChange?: (files: File[]) => void;
};

function UploadField({
  label,
  description,
  multiple = false,
  onFilesChange,
}: UploadFieldProps) {
  const [files, setFiles] = useState<File[]>([]);
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
    setFiles(validFiles);
    onFilesChange?.(validFiles);
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
        <span className="text-xs text-slate-500">{description}</span>
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

export default function PaymentInformation({
  totalInvoice,
  value,
  onChange,
  onProofChange,
}: PaymentInformationProps) {
  const updateValue = (updates: Partial<InvoicePaymentForm>) =>
    onChange({ ...value, ...updates });
  const paymentAmount = Number(value.amount) || 0;

  const outstanding = Math.max(totalInvoice - paymentAmount, 0);

  return (
    <div className="grid gap-6 p-5 xl:grid-cols-[minmax(0,2.2fr)_minmax(260px,0.9fr)]">
      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <UploadField
            label="Surat Keterangan"
            description="Format: PDF, JPG, PNG (Maks. 5 MB)"
            multiple
          />
          <UploadField
            label="Bukti Bayar"
            description="Format: PDF, JPG, PNG (Maks. 5 MB)"
            multiple
            onFilesChange={(files) => {
              updateValue({ proofFiles: files });
              onProofChange?.(files.length > 0);
            }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field>
            <FieldLabel className="text-xs">Atas Nama Rekening</FieldLabel>
            <Input
              className="h-10"
              value={value.accountHolderName}
              onChange={(event) =>
                updateValue({ accountHolderName: event.target.value })
              }
              placeholder="Nama pemilik rekening"
            />
          </Field>

          <Field>
            <FieldLabel className="text-xs">Metode Bayar</FieldLabel>
            <Select
              value={value.paymentMethod}
              onValueChange={(value: string | null) => {
                if (value !== null) updateValue({ paymentMethod: value });
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
          </Field>

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

          <Field>
            <FieldLabel className="text-xs">Dari Rekening</FieldLabel>
            <Select
              value={value.fromBank}
              onValueChange={(value: string | null) => {
                if (value !== null) updateValue({ fromBank: value });
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

          <Field>
            <FieldLabel className="text-xs">Ke Rekening</FieldLabel>
            <Select
              value={value.toBank}
              onValueChange={(value: string | null) => {
                if (value !== null) updateValue({ toBank: value });
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

          <Field>
            <FieldLabel className="text-xs">Tanggal Bayar</FieldLabel>
            <DateRangePicker
              mode="single"
              value={value.paymentDate}
              onChange={(paymentDate) => updateValue({ paymentDate })}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel className="text-xs">Catatan Tambahan</FieldLabel>
          <Textarea
            className="min-h-20 resize-y"
            placeholder="Keterangan jika ada tambahan informasi"
            value={value.notes}
            onChange={(event) => updateValue({ notes: event.target.value })}
          />
        </Field>
      </div>

      <aside className="h-fit rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-slate-50 p-5 dark:border-emerald-900/50 dark:from-emerald-950/40 dark:to-slate-900">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-600 dark:text-slate-300">
              Total Tagihan
            </span>
            <strong className="text-slate-900 dark:text-white">
              {formatRupiah(totalInvoice)}
            </strong>
          </div>

          <Field className="gap-2">
            <FieldLabel className="text-sm text-slate-600 dark:text-slate-300">
              Total Pembayaran
            </FieldLabel>
            <Input
              className="h-10 border-emerald-200 bg-white text-right font-semibold dark:border-emerald-900 dark:bg-slate-900"
              type="text"
              inputMode="numeric"
              value={formatRupiah(value.amount)}
              onChange={(event) => {
                const rawValue = event.target.value.replace(/\D/g, "");

                updateValue({
                  amount: String(Math.max(Number(rawValue) || 0, 0)),
                });
              }}
              placeholder="0"
            />
          </Field>

          <div className="border-t border-emerald-200 pt-4 dark:border-emerald-900">
            <div className="flex items-center justify-between gap-4">
              <strong className="text-sm text-slate-800 dark:text-slate-100">
                Kurang Bayar
              </strong>
              <strong
                className={`text-base ${outstanding === 0 ? "text-emerald-600" : "text-amber-600"}`}
              >
                {formatRupiah(outstanding)}
              </strong>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
