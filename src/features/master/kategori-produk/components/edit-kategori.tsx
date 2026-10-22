import { useEffect, useState, type SubmitEvent } from "react";
import AppModal from "@/components/base-modal";
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
import { FaSave } from "react-icons/fa";
import { FaPen } from "react-icons/fa6";
import type {
  KategoriProdukDetail,
  UpdateKategoriProdukPayload,
} from "../types/kategori-produk";
import { createKategoriProdukFormSchema } from "../schemas/create-kategori-schema";

type EditMasterProps = {
  open: boolean;
  produk: KategoriProdukDetail | null;
  loadingProduk: boolean;
  produkError: string | null;
  submitting: boolean;
  submitError: string | null;
  onClose: () => void;
  onSubmit: (payload: UpdateKategoriProdukPayload) => Promise<void>;
};

const EditMasterKategoriProduk = ({
  open,
  produk,
  loadingProduk,
  produkError,
  submitting,
  submitError,
  onClose,
  onSubmit,
}: EditMasterProps) => {
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !produk) return;
    setName(produk.name);
    setIsActive(produk.is_active);
    setNameError(null);
  }, [open, produk]);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || !produk) return;

    const validation = createKategoriProdukFormSchema.safeParse({ name });
    if (!validation.success) {
      setNameError(
        validation.error.issues[0]?.message ?? "Nama kategori tidak valid.",
      );
      return;
    }

    setNameError(null);
    try {
      await onSubmit({ name: validation.data.name, is_active: isActive });
    } catch {
      // Parent menampilkan pesan gagal dan mempertahankan nilai form.
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Edit Master Kategori Produk"
      icon={<FaPen />}
      className="max-w-lg max-h-[70vh]"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="destructive" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="primer"
            type="submit"
            form="edit-kategori-produk-form"
            disabled={submitting || loadingProduk || !produk}
          >
            <FaSave size={14} />
            {submitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      }
    >
      {loadingProduk ? (
        <p className="py-8 text-center text-sm text-slate-500">
          Memuat detail kategori produk...
        </p>
      ) : produkError ? (
        <p role="alert" className="py-6 text-sm text-red-600">
          {produkError}
        </p>
      ) : produk ? (
        <form
          id="edit-kategori-produk-form"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <AppModal.Section title="Kategori Produk" showHeader={false}>
            <div className="space-y-4">
              <Field>
                <FieldLabel>Nama Kategori</FieldLabel>
                <Input
                  placeholder="Masukkan nama kategori"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setNameError(null);
                  }}
                />
                {nameError && (
                  <p role="alert" className="text-sm text-red-500">
                    {nameError}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel>Status Produk</FieldLabel>
                <Select
                  value={String(isActive)}
                  onValueChange={(value) => setIsActive(value === "true")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>{isActive ? "Aktif" : "Nonaktif"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent align="start" alignItemWithTrigger={false}>
                    <SelectItem value="true">Aktif</SelectItem>
                    <SelectItem value="false">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {submitError && (
                <p role="alert" className="text-sm text-red-600">
                  {submitError}
                </p>
              )}
            </div>
          </AppModal.Section>
        </form>
      ) : null}
    </AppModal>
  );
};

export default EditMasterKategoriProduk;
