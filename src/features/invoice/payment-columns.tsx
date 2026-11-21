import { Button } from "@/components/ui/button";
import API_URLS from "@/config/env";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Image, Pencil, Trash2 } from "lucide-react";
import type { dataTableFeatures } from "@/components/data-table/table-features";
import type { InvoicePaymentRow } from "./types/invoice";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const paymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    cash: "Tunai",
    Tunai: "Tunai",
    tunai: "Tunai",
    transfer: "Transfer",
    deposit: "Deposit",
    other: "Lainnya",
  };
  return labels[method] ?? (method || "-");
};

const resolveAttachmentUrl = (url: string) => {
  if (/^https?:\/\//i.test(url)) return url;
  const backendUrl = API_URLS.sro.replace(/api\/?$/, "");
  return new URL(url.replace(/^\/+/, ""), backendUrl).toString();
};

const openAttachment = (url: string) => {
  window.open(resolveAttachmentUrl(url), "_blank", "noopener,noreferrer");
};

export const getInvoicePaymentColumns = (actions?: {
  disabled?: boolean;
  onEdit?: (payment: InvoicePaymentRow) => void;
  onDelete?: (payment: InvoicePaymentRow) => void;
}): ColumnDef<typeof dataTableFeatures, InvoicePaymentRow, unknown>[] => [
  {
    accessorKey: "paymentDate",
    header: "Tanggal",
    cell: ({ row }) =>
      row.original.paymentDate ? formatTanggal(row.original.paymentDate) : "-",
  },
  {
    accessorKey: "paymentType",
    header: "Tipe Pembayaran",
    cell: ({ row }) => {
      const paymentType = (
        row.original.paymentTypeValue ?? row.original.paymentType
      )
        .toLowerCase()
        .replace(/[\s-]+/g, "_");
      return paymentType === "surat_keterangan"
        ? "Surat Keterangan"
        : "Bukti Bayar";
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Metode",
    cell: ({ row }) => paymentMethodLabel(row.original.paymentMethod),
  },
  {
    accessorKey: "accountHolderName",
    header: "Atas Nama",
    cell: ({ row }) => row.original.accountHolderName || "-",
  },
  {
    accessorKey: "bank",
    header: "Rekening",
    cell: ({ row }) =>
      [row.original.fromBank, row.original.toBank]
        .filter(Boolean)
        .join(" Ke ") || "-",
  },
  {
    accessorKey: "amount",
    header: "Jumlah",
    cell: ({ row }) =>
      row.original.amount == null ? "-" : formatRupiah(row.original.amount),
  },
  {
    accessorKey: "notes",
    header: "Catatan",
    cell: ({ row }) => row.original.notes || "-",
  },
  {
    accessorKey: "proof",
    header: "Lampiran",
    cell: ({ row }) => {
      const attachments = row.original.attachments ?? [];
      if (attachments.length > 0) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((attachment, index) => (
                    <Button
                      key={`${attachment.url}-${index}`}
                      variant="litleSekunder"
                      size="litle"
                      onClick={() => openAttachment(attachment.url)}
                    >
                      <Image />
                    </Button>
                  ))}
                </div>
              </TooltipTrigger>

              <TooltipContent>
                <p>Tampilkan</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
      return row.original.proof && !row.original.pending ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => openAttachment(row.original.proof)}
        >
          <ExternalLink className="mr-1 h-4 w-4" />
          Buka
        </Button>
      ) : row.original.proof ? (
        <span className="text-xs text-slate-600">{row.original.proof}</span>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Aksi",
    cell: ({ row }) =>
      row.original.editable === false ? (
        "-"
      ) : (
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Ubah pembayaran"
            disabled={actions?.disabled}
            onClick={() => actions?.onEdit?.(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Hapus pembayaran"
            disabled={actions?.disabled}
            onClick={() => actions?.onDelete?.(row.original)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
  },
];
