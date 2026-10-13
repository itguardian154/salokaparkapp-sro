import AppModal from "@/components/base-modal";
import SearchablePopover from "@/components/searchable-popover";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDepartemen } from "@/features/departemen/hooks/use-departemen";
import { formatRupiah } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { FaSave } from "react-icons/fa";
import { FaFilePdf, FaPlus, FaUpload, FaXmark } from "react-icons/fa6";

import type { Departemen } from "@/features/departemen/types/departemen";
import type { CreateProdukPayload } from "../types/master-produk";
import {
  createProdukFormSchema,
  type CreateProdukFormValues,
} from "../schemas/create-produk-schema";

type ValidationErrors = Partial<Record<keyof CreateProdukFormValues, string>>;
type ProdukFormData = Pick<
  CreateProdukFormValues,
  "name" | "price" | "typeDay"
> & {
  description: string;
  is_ticket: boolean | null;
};

type CreateMasterProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    payload: CreateProdukPayload,
    attachments: File[],
  ) => Promise<void>;
  submitting?: boolean;
  submitError?: string | null;
};

const CreateMasterProduk = ({
  open,
  onClose,
  onSubmit,
  submitting = false,
}: CreateMasterProps) => {
  const [formData, setFormData] = useState<ProdukFormData>({
    name: "",
    description: "",
    price: "",
    typeDay: "",
    is_ticket: null,
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [attachments, setAttachments] = useState<File[]>([]);
  const [draggingFiles, setDraggingFiles] = useState(false);
  const [attachmentError, setAttachmentError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrls = useRef(new Map<File, string>());
  const [openDepartemen, setOpenDepartemen] = useState(false);
  const [selectedDepartemen, setSelectedDepartemen] = useState<
    { id: string; name: string }[]
  >([]);
  const {
    departemen,
    searchDepartemen,
    setSearchDepartemen,
    loading: loadingDepartemen,
    error: departemenError,
  } = useDepartemen();

  useEffect(
    () => () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.current.clear();
    },
    [],
  );

  const addAttachments = (files: FileList | File[]) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const incoming = Array.from(files);
    const validFiles = incoming.filter(
      (file) =>
        allowedTypes.includes(file.type) && file.size <= 5 * 1024 * 1024,
    );

    if (validFiles.length === 0) {
      setAttachmentError(
        "Format file harus PDF, JPG, JPEG, atau PNG dengan ukuran maksimal 5 MB.",
      );
      return;
    }

    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.current.clear();

    const selectedFile = validFiles[0];
    if (selectedFile.type.startsWith("image/")) {
      previewUrls.current.set(selectedFile, URL.createObjectURL(selectedFile));
    }
    setAttachments([selectedFile]);
    setAttachmentError(
      incoming.length > 1
        ? "API hanya menerima satu file. File pertama yang dipilih akan digunakan."
        : "",
    );
  };

  const removeAttachment = (file: File) => {
    const previewUrl = previewUrls.current.get(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrls.current.delete(file);
    setAttachments((current) =>
      current.filter((currentFile) => currentFile !== file),
    );
  };

  const formatFileSize = (size: number) =>
    size >= 1024 * 1024
      ? `${(size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(size / 1024))} KB`;

  const clearForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      typeDay: "",
      is_ticket: null,
    });
    setValidationErrors({});
    setSelectedDepartemen([]);
    setSearchDepartemen("");
    setOpenDepartemen(false);
    setAttachments([]);
    setAttachmentError("");
    setDraggingFiles(false);
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.current.clear();
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const validation = createProdukFormSchema.safeParse({
      name: formData.name,
      price: formData.price,
      typeDay: formData.typeDay,
      is_ticket: formData.is_ticket,
      department_owners: selectedDepartemen,
    });

    if (!validation.success) {
      const nextErrors: ValidationErrors = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof CreateProdukFormValues;
        nextErrors[field] ??= issue.message;
      });
      setValidationErrors(nextErrors);
      return;
    }

    setValidationErrors({});
    const payload: CreateProdukPayload = {
      name: validation.data.name,
      description: formData.description.trim(),
      price: Number(validation.data.price),
      department_owners: validation.data.department_owners.map((item) => ({
        department_id: item.id,
        department_name: item.name,
      })),
      day_type: validation.data.typeDay,
      min_qty: 1,
      is_ticket: validation.data.is_ticket,
      is_active: false,
    };

    try {
      await onSubmit(payload, attachments);
      clearForm();
    } catch {
      // Parent menampilkan toast error; pertahankan isian agar bisa dicoba lagi.
    }
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="Tambah Master Produk"
      icon={<FaPlus />}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field>
            <FieldLabel>Nama Produk</FieldLabel>

            <Input
              placeholder="Masukkan nama produk"
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

          <Field>
            <FieldLabel>Apakah ini produk tiket ?</FieldLabel>

            <Select
              value={formData.is_ticket === null ? "" : String(formData.is_ticket)}
              onValueChange={(selectedValue) => {
                const value = selectedValue === "true"
                  ? true
                  : selectedValue === "false"
                    ? false
                    : null;
                setFormData((current) => ({ ...current, is_ticket: value }));
                if (value !== null) {
                  setValidationErrors((current) => ({
                    ...current,
                    is_ticket: undefined,
                  }));
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih status tiket">
                  {formData.is_ticket === null
                    ? undefined
                    : formData.is_ticket
                      ? "Ya"
                      : "Tidak"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="start" alignItemWithTrigger={false}>
                <SelectItem value="true">Ya</SelectItem>
                <SelectItem value="false">Tidak</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.is_ticket && (
              <p role="alert" className="text-sm text-red-500">
                {validationErrors.is_ticket}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel>Tipe Hari</FieldLabel>

            <Select
              value={formData.typeDay}
              onValueChange={(value) =>
                setFormData((current) => ({
                  ...current,
                  typeDay: value ?? "",
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih tipe hari">
                  {formData.typeDay === "weekend"
                    ? "Weekend"
                    : formData.typeDay === "weekday"
                      ? "Weekday"
                      : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="start" alignItemWithTrigger={false}>
                <SelectItem value="weekend">Weekend</SelectItem>
                <SelectItem value="weekday">Weekday</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.typeDay && (
              <p role="alert" className="text-sm text-red-500">
                {validationErrors.typeDay}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel>Harga</FieldLabel>

            <Input
              placeholder="Masukkan harga"
              value={formData.price ? formatRupiah(formData.price) : ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setFormData((current) => ({ ...current, price: value }));
                if (value) {
                  setValidationErrors((current) => ({
                    ...current,
                    price: undefined,
                  }));
                }
              }}
            />
            {validationErrors.price && (
              <p role="alert" className="text-sm text-red-500">
                {validationErrors.price}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel>Departemen Terkait</FieldLabel>
            <div
              className={`relative [&>button]:h-auto! [&>button]:max-h-24! [&>button]:min-h-10! [&>button]:items-center! [&>button]:overflow-hidden! [&>button]:py-1.5! ${
                selectedDepartemen.length > 0
                  ? "[&>button>span:first-child]:opacity-0!"
                  : ""
              }`}
            >
              <SearchablePopover<Departemen>
                multi
                open={openDepartemen}
                onOpenChange={setOpenDepartemen}
                search={searchDepartemen}
                onSearchChange={setSearchDepartemen}
                placeholder="Pilih departemen"
                items={departemen}
                selected={selectedDepartemen}
                onMultiSelect={(items) => {
                  const selected = items.map((item) => ({
                    id: item.id,
                    name: String(item.name),
                  }));
                  setSelectedDepartemen(selected);
                  if (selected.length > 0) {
                    setValidationErrors((current) => ({
                      ...current,
                      department_owners: undefined,
                    }));
                  }
                }}
                renderItem={(item) => item.departemen}
                getKey={(item) => item.id_dept}
                emptyText={
                  loadingDepartemen
                    ? "Memuat departemen..."
                    : (departemenError ?? "Departemen tidak ditemukan")
                }
              />
              {selectedDepartemen.length > 0 && (
                <div
                  className="absolute inset-y-1 left-2 right-9 flex flex-wrap content-start gap-1 overflow-y-auto pr-1"
                  onClick={() => setOpenDepartemen((current) => !current)}
                >
                  {selectedDepartemen.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex max-w-full items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-900 dark:bg-blue-950 dark:text-blue-100"
                    >
                      <span className="truncate">{item.name}</span>
                      <button
                        type="button"
                        aria-label={`Hapus departemen ${item.name}`}
                        className="pointer-events-auto rounded-full text-blue-600 hover:text-blue-900 dark:text-blue-300 dark:hover:text-white"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedDepartemen((current) =>
                            current.filter(
                              (selected) => selected.id !== item.id,
                            ),
                          );
                          setValidationErrors((current) => ({
                            ...current,
                            department_owners: undefined,
                          }));
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {validationErrors.department_owners && (
                <p role="alert" className="mt-2 text-sm text-red-500">
                  {validationErrors.department_owners}
                </p>
              )}
            </div>
          </Field>

          <Field>
            <FieldLabel>Deskripsi</FieldLabel>

            <Textarea
              placeholder="Masukkan deskripsi"
              value={formData.description}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </Field>
        </div>
        <Field className="mt-5">
          <FieldLabel htmlFor="picture">Referensi / Lampiran</FieldLabel>
          <Input
            ref={fileInputRef}
            id="picture"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className="sr-only"
            onChange={(event) => {
              if (event.target.files) addAttachments(event.target.files);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDraggingFiles(true);
            }}
            onDragLeave={() => setDraggingFiles(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDraggingFiles(false);
              addAttachments(event.dataTransfer.files);
            }}
            className={`flex min-h-20 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-3 text-center transition-colors ${
              draggingFiles
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                : "border-blue-200 hover:bg-blue-50/50 dark:border-slate-600 dark:hover:bg-slate-800"
            }`}
          >
            <FaUpload className="text-lg text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Drag &amp; drop file di sini
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              atau klik untuk memilih file
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Format: PDF, JPG, JPEG, PNG (Max 5 MB)
            </span>
          </button>
          {attachmentError && (
            <FieldDescription className="text-red-600">
              {attachmentError}
            </FieldDescription>
          )}
          <div className="space-y-2">
            {attachments.map((file) => {
              const previewUrl = previewUrls.current.get(file) ?? null;

              return (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-2 dark:border-slate-700"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt=""
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-red-50 text-red-500 dark:bg-red-950/40">
                      <FaFilePdf className="text-xl" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                      {file.name}
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      {formatFileSize(file.size)}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Hapus file ${file.name}`}
                    onClick={() => removeAttachment(file)}
                    className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-700"
                  >
                    <FaXmark />
                  </button>
                </div>
              );
            })}
          </div>
        </Field>
      </AppModal.Section>
    </AppModal>
  );
};

export default CreateMasterProduk;
