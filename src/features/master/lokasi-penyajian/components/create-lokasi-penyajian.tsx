import AppModal from "@/components/base-modal";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FaSave } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { useState } from "react";

import type { CreateLokasiPenyajianPayload } from "../types/lokasi-penyajian";
import {
  createLokasiPenyajianFormSchema,
  type CreateLokasiPenyajianFormValues,
} from "../schemas/lokasi-penyajian-scehma";

type CreateMasterProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateLokasiPenyajianPayload) => Promise<void>;
  submitting?: boolean;
};

type LokasiPenyajianFormData = CreateLokasiPenyajianFormValues;

type ValidationErrors = Partial<
  Record<keyof CreateLokasiPenyajianFormValues, string>
>;

const CreateMasterLokasiPenyajian = ({
  open,
  onClose,
  onSubmit,
  submitting = false,
}: CreateMasterProps) => {
  const [formData, setFormData] = useState<LokasiPenyajianFormData>({
    name: "",
    quota: "",
  });

  const [validationErrors, setValidationErrors] =
    useState<ValidationErrors>({});

  const clearForm = () => {
    setFormData({
      name: "",
      quota: "",
    });
    setValidationErrors({});
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const validation = createLokasiPenyajianFormSchema.safeParse({
      name: formData.name,
      quota: formData.quota,
    });

    if (!validation.success) {
      const nextErrors: ValidationErrors = {};

      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof CreateLokasiPenyajianFormValues;
        nextErrors[field] ??= issue.message;
      });

      setValidationErrors(nextErrors);
      return;
    }

    setValidationErrors({});

    const payload: CreateLokasiPenyajianPayload = {
      name: validation.data.name,
      quota: validation.data.quota,
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
      title="Tambah Master Lokasi Penyajian"
      icon={<FaPlus />}
      className="max-w-lg max-h-[70vh]"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="destructive" onClick={handleClose}>
            Batal
          </Button>

          <Button
            variant="primer"
            onClick={() => void handleSubmit()}
            disabled={submitting}
          >
            <FaSave size={14} />
            {submitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      }
    >
      <AppModal.Section title="Master Lokasi Penyajian" showHeader={false}>
        <div className="space-y-4">
          <Field>
            <FieldLabel>Nama Lokasi</FieldLabel>

            <Input
              placeholder="Masukkan nama lokasi"
              value={formData.name}
              onChange={(event) => {
                const value = event.target.value;

                setFormData((current) => ({
                  ...current,
                  name: value,
                }));

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

          <Field>
            <FieldLabel>Kuota Lokasi Penyajian</FieldLabel>

            <Input
              type="number"
              min="0"
              placeholder="Masukkan kuota lokasi penyajian"
              value={formData.quota}
              onChange={(event) => {
                const value = event.target.value;

                setFormData((current) => ({
                  ...current,
                  quota: value,
                }));

                setValidationErrors((current) => ({
                  ...current,
                  quota: undefined,
                }));
              }}
            />

            {validationErrors.quota && (
              <p role="alert" className="text-sm text-red-500">
                {validationErrors.quota}
              </p>
            )}
          </Field>
        </div>
      </AppModal.Section>
    </AppModal>
  );
};

export default CreateMasterLokasiPenyajian;