import AppModal from "@/components/base-modal";
import SearchablePopover from "@/components/searchable-popover";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useMasterProduk from "@/features/master/master-produk/hooks/use-master-produk";
import type { ProdukRecord } from "@/features/master/master-produk/types/master-produk";
import type { InvoiceOrder } from "../types/invoice-order";
import { formatRupiah } from "@/lib/utils";
import { useState } from "react";
import { FaSave } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";

type CreateDetailInvoiceProps = {
  open: boolean;
  onClose: () => void;
  onSave: (order: Omit<InvoiceOrder, "id">) => void;
};

const toAmount = (value: string | number | null | undefined) => {
  const rawValue = String(value ?? "");
  const numericValue = Number(rawValue);
  if (Number.isFinite(numericValue)) return numericValue;
  return Number(rawValue.replace(/[^\d]/g, "")) || 0;
};

export default function CreateDetailInvoice({
  open,
  onClose,
  onSave,
}: CreateDetailInvoiceProps) {
  const {
    dataMasterProduk,
    loadingData: loadingProduk,
    error: produkError,
    searchData: searchProduk,
    setSearchData: setSearchProduk,
  } = useMasterProduk();

  const [openProduk, setOpenProduk] = useState(false);
  const [selectedProduk, setSelectedProduk] = useState<ProdukRecord | null>(
    null,
  );
  const [quantity, setQuantity] = useState("");
  const [complimentary, setComplimentary] = useState("0");
  const [discountPrice, setDiscountPrice] = useState("");
  const [errors, setErrors] = useState<{
    product?: string;
    quantity?: string;
    complimentary?: string;
  }>({});

  const unitPrice = toAmount(selectedProduk?.price);
  const quantityAmount = Number(quantity) || 0;
  const discountAmount = Number(discountPrice) || 0;
  const subtotal = quantityAmount * unitPrice - discountAmount;

  const resetForm = () => {
    setOpenProduk(false);
    setSelectedProduk(null);
    setQuantity("");
    setComplimentary("0");
    setDiscountPrice("");
    setSearchProduk("");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    const nextErrors: typeof errors = {};
    if (!selectedProduk) nextErrors.product = "Pilih produk terlebih dahulu.";
    if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
      nextErrors.quantity = "Quantity harus berupa bilangan bulat positif.";
    }
    if (
      !Number.isInteger(Number(complimentary)) ||
      Number(complimentary) < 0
    ) {
      nextErrors.complimentary =
        "Complimentary harus berupa bilangan bulat nol atau lebih.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSave({
      productId: selectedProduk!.id,
      product: selectedProduk!.name,
      description: selectedProduk!.description ?? "",
      quantity: quantityAmount,
      compliment: Number(complimentary),
      unitPrice,
      discountPrice: Number(discountPrice) || 0,
      subtotal,
    });

    handleClose();
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="Tambah Detail Pesanan"
      icon={<FaPlus />}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="destructive" onClick={handleClose}>
            Batal
          </Button>
          <Button variant="primer" onClick={handleSave}>
            <FaSave size={14} />
            Simpan
          </Button>
        </div>
      }
    >
      <AppModal.Section title="Detail Pesanan" showHeader={false}>
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <Field className="md:col-span-2">
            <FieldLabel>
              Produk <span className="text-xs text-red-500">*</span>
            </FieldLabel>
            <SearchablePopover<ProdukRecord>
              open={openProduk}
              onOpenChange={setOpenProduk}
              search={searchProduk}
              onSearchChange={setSearchProduk}
              placeholder={loadingProduk ? "Memuat produk..." : "Pilih produk"}
              selectedLabel={selectedProduk?.name ?? null}
              selectedKey={selectedProduk ? String(selectedProduk.id) : null}
              items={dataMasterProduk}
              getKey={(produk) => String(produk.id)}
              renderItem={(produk) => produk.name}
              onSelect={(produk) => {
                setSelectedProduk(produk);
                setDiscountPrice("");
                setOpenProduk(false);
                setSearchProduk("");
                setErrors((current) => ({ ...current, product: undefined }));
              }}
              emptyText={
                loadingProduk
                  ? "Memuat produk..."
                  : (produkError ?? "Produk tidak ditemukan.")
              }
              debounceDelay={500}
            />
            {errors.product && (
              <p role="alert" className="text-sm text-red-500">
                {errors.product}
              </p>
            )}
          </Field>

          <Field className="md:col-span-2">
            <FieldLabel>Deskripsi</FieldLabel>
            <Textarea
              className="min-h-20"
              value={selectedProduk?.description ?? ""}
              placeholder="Deskripsi terisi otomatis dari produk"
              readOnly
            />
          </Field>

          <Field>
            <FieldLabel>
              Quantity <span className="text-xs text-red-500">*</span>
            </FieldLabel>
            <Input
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(event) => {
                setQuantity(event.target.value);
                setErrors((current) => ({ ...current, quantity: undefined }));
              }}
              placeholder="Masukkan quantity"
            />
            {errors.quantity && (
              <p role="alert" className="text-sm text-red-500">
                {errors.quantity}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel>Complimentary</FieldLabel>
            <Input
              type="number"
              min={0}
              step={1}
              value={complimentary}
              onChange={(event) => {
                setComplimentary(event.target.value);
                setErrors((current) => ({
                  ...current,
                  complimentary: undefined,
                }));
              }}
              placeholder="0"
            />
            {errors.complimentary && (
              <p role="alert" className="text-sm text-red-500">
                {errors.complimentary}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel>Harga Satuan</FieldLabel>
            <Input
              value={selectedProduk ? formatRupiah(unitPrice, false) : ""}
              placeholder="Otomatis dari produk"
              readOnly
              disabled
            />
          </Field>

          <Field>
            <FieldLabel>Harga Diskon</FieldLabel>
            <Input
              type="number"
              min={0}
              step={1}
              value={discountPrice}
              onChange={(event) => setDiscountPrice(event.target.value)}
              placeholder="Masukkan harga diskon"
              disabled={!selectedProduk}
            />
          </Field>

          <Field className="md:col-span-2">
            <FieldLabel>Sub total</FieldLabel>
            <Input
              value={
                selectedProduk && quantity && discountPrice
                  ? formatRupiah(subtotal, false)
                  : ""
              }
              placeholder="Sub total"
              readOnly
              disabled
            />
          </Field>
        </div>
      </AppModal.Section>
    </AppModal>
  );
}
