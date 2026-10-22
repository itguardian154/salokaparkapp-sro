import AppModal from "@/components/base-modal";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FaSave } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import type { CreateKategoriProdukPayload } from "../types/kategori-produk";
import { useState } from "react";
import {
  createKategoriProdukFormSchema,
  type CreateKategoriProdukFormValues,
} from "../schemas/create-kategori-schema";

type CreateMasterProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateKategoriProdukPayload) => Promise<void>;
  submitting?: boolean;
};

type KategoriProdukFormData = CreateKategoriProdukFormValues;

type ValidationErrors = Partial<
  Record<keyof CreateKategoriProdukFormValues, string>
>;

const CreateMasterKategoriProduk = ({
  open,
  onClose,
  onSubmit,
  submitting = false,
}: CreateMasterProps) => {
  const [formData, setFormData] = useState<KategoriProdukFormData>({
    name: "",
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );

  const clearForm = () => {
    setFormData({
      name: "",
    });
    setValidationErrors({});
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const validation = createKategoriProdukFormSchema.safeParse({
      name: formData.name,
    });

    if (!validation.success) {
      const nextErrors: ValidationErrors = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof CreateKategoriProdukFormValues;
        nextErrors[field] ??= issue.message;
      });
      setValidationErrors(nextErrors);
      return;
    }

    setValidationErrors({});
    const payload: CreateKategoriProdukPayload = {
      name: validation.data.name,
      is_active: true,
    };

    try {
      await onSubmit(payload);
      clearForm();
    } catch {
      // Parent menampilkan toast error; pertahankan isian agar bisa dicoba lagi.
    }
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="Tambah Master Kategori Produk"
      icon={<FaPlus />}
      className="max-w-lg max-h-[70vh]"
      footer={
        <div className="flex justify-end gap-3">
          {" "}
          <Button variant="destructive" onClick={handleClose}>
            Batal{" "}
          </Button>
          <Button variant="primer" onClick={() => void handleSubmit()}>
            <FaSave size={14} />
            {submitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      }
    >
      <AppModal.Section title="Master Produk" showHeader={false}>
        <Field>
          <FieldLabel>Nama Kategori</FieldLabel>

          <Input
            placeholder="Masukkan nama kategori"
            value={formData.name}
            onChange={(event) => {
              const value = event.target.value;
              setFormData((current) => ({ ...current, name: value }));
              if (value.trim()) {
                setValidationErrors((current) => ({
                  ...current,
                  name: undefined,
                }));
              }
            }}
          />
          {validationErrors.name && (
            <p role="alert" className="text-sm text-red-500">
              {validationErrors.name}
            </p>
          )}
        </Field>
      </AppModal.Section>
    </AppModal>
  );
};

export default CreateMasterKategoriProduk;
