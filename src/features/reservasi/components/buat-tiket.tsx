
import { useEffect, useState } from "react";
import { Ticket, Loader2, AlertCircle } from "lucide-react";

import AppModal from "@/components/base-modal";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useTiket } from "../hooks/use-tiket";

interface CreateTicketModalProps {
  open: boolean;
  onClose: () => void;
  salesOrderId: number;
  defaultQuantity: number;
  ticket_created_count: number;
  total_ticket_count: number;
  ticket_printed_count: number;
  ticket_used_count: number;
  onSuccess: () => void;
}

const CreateTicketModal = ({
  open,
  onClose,
  salesOrderId,
  defaultQuantity,
  ticket_created_count,
  total_ticket_count,
  ticket_printed_count,
  ticket_used_count,
  onSuccess,
}: CreateTicketModalProps) => {
  const [quantity, setQuantity] = useState(String(defaultQuantity));
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { buatTiket, loading } = useTiket(salesOrderId);

  const remainingTickets = Math.max(
    0,
    total_ticket_count - ticket_created_count,
  );

  const parsedQuantity = Number(quantity);

  // RESET FORM SAAT MODAL DIBUKA
  useEffect(() => {
    if (open) {
      setQuantity(String(defaultQuantity));
      setError("");
      setShowConfirmation(false);
    }
  }, [open, defaultQuantity]);

  // CLEAR FORM
  const clearForm = () => {
    setQuantity(String(defaultQuantity));
    setError("");
    setShowConfirmation(false);
  };

  // TUTUP MODAL
  const handleClose = () => {
    if (loading) return;

    clearForm();
    onClose();
  };

  // VALIDASI DAN BUKA KONFIRMASI
  const handleSubmit = () => {
    if (loading) return;

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setError("Jumlah tiket harus berupa angka bulat lebih dari 0.");
      return;
    }

    if (parsedQuantity > remainingTickets) {
      setError(
        `Jumlah tiket melebihi sisa tiket yang dapat dibuat (${remainingTickets.toLocaleString("id-ID")} tiket).`,
      );
      return;
    }

    setError("");
    setShowConfirmation(true);
  };

  // KONFIRMASI BUAT TIKET
  const handleConfirmCreate = async () => {
    if (loading) return;

    try {
      const response = await buatTiket(parsedQuantity);

      if (response?.data?.sales_order_id) {
        clearForm();
        onClose();
        onSuccess();
      } else {
        setShowConfirmation(false);
        setError(response?.message || "Gagal membuat tiket.");
      }
    } catch (err) {
      setShowConfirmation(false);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat membuat tiket.",
      );
    }
  };

  // RINCIAN TIKET
  const ticketDetails = [
    {
      label: "Total Tiket",
      value: total_ticket_count,
    },
    {
      label: "Tiket Dibuat",
      value: ticket_created_count,
    },
    {
      label: "Tiket Dicetak",
      value: ticket_printed_count,
    },
    {
      label: "Tiket Digunakan",
      value: ticket_used_count,
    },
  ];

  return (
    <>
      <AppModal
        open={open && !showConfirmation}
        onClose={handleClose}
        title="Buat Tiket"
        icon={<Ticket size={18} />}
        className="max-w-lg max-h-[70vh]"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="destructive"
              onClick={handleClose}
              disabled={loading}
            >
              Batal
            </Button>

            <Button
              type="button"
              variant="primer"
              onClick={handleSubmit}
              disabled={loading || !quantity}
            >
              <Ticket size={14} />
              Buat Tiket
            </Button>
          </div>
        }
      >
        <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
          {/* RINCIAN TIKET */}
          <AppModal.Section title="Rincian Tiket">
            <div className="grid grid-cols-2 gap-3">
              {ticketDetails.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900"
                >
                  <p className="text-xs text-muted-foreground">
                    {item.label}
                  </p>

                  <p className="mt-1 text-xl font-semibold tabular-nums">
                    {(Number(item.value) || 0).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          </AppModal.Section>

          {/* JUMLAH TIKET */}
          <AppModal.Section title="Jumlah Tiket">
            <Field>
              <FieldLabel>
                Jumlah tiket yang akan dibuat{" "}
                <span className="text-xs text-red-500">*</span>
              </FieldLabel>

              <Input
                type="number"
                min={1}
                max={remainingTickets}
                step={1}
                placeholder="Masukkan jumlah tiket"
                value={quantity}
                disabled={loading}
                onChange={(event) => {
                  setQuantity(event.target.value);
                  setError("");
                }}
              />

              <p className="text-xs text-muted-foreground">
                Masukkan jumlah tiket yang ingin dibuat untuk reservasi ini.
                Sisa tiket yang dapat dibuat:{" "}
                <span className="font-semibold">
                  {remainingTickets.toLocaleString("id-ID")}
                </span>
              </p>

              {error && (
                <p role="alert" className="text-sm text-red-500">
                  {error}
                </p>
              )}
            </Field>
          </AppModal.Section>
        </div>
      </AppModal>

      {/* KONFIRMASI PEMBUATAN TIKET */}
      <AppModal
        open={open && showConfirmation}
        onClose={() => {
          if (!loading) setShowConfirmation(false);
        }}
        title="Konfirmasi Pembuatan Tiket"
        icon={<AlertCircle size={18} />}
        className="max-w-md"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowConfirmation(false)}
              disabled={loading}
            >
              Batal
            </Button>

            <Button
              type="button"
              variant="primer"
              onClick={() => void handleConfirmCreate()}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Membuat Tiket...
                </>
              ) : (
                <>
                  <Ticket size={14} />
                  Ya, Buat Tiket
                </>
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Apakah Anda yakin ingin membuat tiket dengan jumlah berikut?
          </p>

          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                Total Tiket Pesanan
              </span>
              <span className="font-semibold tabular-nums">
                {total_ticket_count.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                Tiket Sudah Dibuat
              </span>
              <span className="font-semibold tabular-nums">
                {ticket_created_count.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                Akan Dibuat
              </span>
              <span className="font-semibold tabular-nums text-primary">
                {parsedQuantity.toLocaleString("id-ID")} tiket
              </span>
            </div>

            <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">
                  Sisa Setelah Pembuatan
                </span>
                <span className="font-semibold tabular-nums">
                  {(
                    remainingTickets - parsedQuantity
                  ).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Pastikan jumlah tiket sudah sesuai. Proses pembuatan tiket akan
            dijalankan setelah Anda menekan tombol Ya, Buat Tiket.
          </p>
        </div>
      </AppModal>
    </>
  );
};

export default CreateTicketModal;
