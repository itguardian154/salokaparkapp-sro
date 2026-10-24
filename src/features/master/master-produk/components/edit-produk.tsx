import { useEffect, useRef, useState } from "react";
import { FaSave } from "react-icons/fa";
import { FaFilePdf, FaPen, FaUpload, FaXmark } from "react-icons/fa6";
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
import type { Departemen } from "@/features/departemen/types/departemen";
import type { KategoriProdukRecord } from "@/features/master/kategori-produk/types/kategori-produk";
import { formatRupiah } from "@/lib/utils";
import type { CreateProdukFormValues } from "../schemas/create-produk-schema";
import { createProdukFormSchema } from "../schemas/create-produk-schema";
import type {
  ProdukDetail,
  SearchableOptions,
  UpdateProdukPayload,
} from "../types/master-produk";

type EditMasterProdukProps = {
  open: boolean;
  produk: ProdukDetail | null;
  loadingProduk: boolean;
  produkError: string | null;
  submitting: boolean;
  submitError: string | null;
  kategoriOptions: SearchableOptions<KategoriProdukRecord>;
  departemenOptions: SearchableOptions<Departemen>;
  onClose: () => void;
  onSubmit: (
    payload: UpdateProdukPayload,
    referenceFile: File | null,
  ) => Promise<void>;
};

type ValidationErrors = Partial<Record<keyof CreateProdukFormValues, string>>;
type SelectedDepartment = { id: string; name: string };
type EditProdukFormData = {
  name: string;
  description: string;
  price: string;
  day_type: string;
  is_active: boolean;
  is_ticket: boolean;
  department_owners: SelectedDepartment[];
  product_category_id: number | null;
};

const EditMasterProduk = ({
  open,
  produk,
  loadingProduk,
  produkError,
  submitting,
  onClose,
  onSubmit,
  kategoriOptions,
  departemenOptions,
}: EditMasterProdukProps) => {
  const {
    items: kategoriProduk,
    search: kategoriSearch,
    onSearchChange: onKategoriSearchChange,
    loading: loadingKategoriProduk,
    error: kategoriProdukError,
  } = kategoriOptions;
  const {
    items: departemen,
    search: searchDepartemen,
    onSearchChange: setSearchDepartemen,
    loading: loadingDepartemen,
    error: departemenError,
  } = departemenOptions;
  const [formData, setFormData] = useState<EditProdukFormData>({
    name: "",
    description: "",
    price: "",
    day_type: "",
    is_active: true,
    is_ticket: false,
    department_owners: [],
    product_category_id: null,
  });
  const selectedDepartemen = formData.department_owners;
  const [departemenPickerOpen, setDepartemenPickerOpen] = useState(false);
  const [kategoriPickerOpen, setKategoriPickerOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open || !produk) return;

    const price = Number(produk.price);

    setFormData({
      name: produk.name ?? "",
      description: produk.description ?? "",
      price: Number.isFinite(price) ? String(Math.trunc(price)) : "",
      day_type: produk.day_type,
      is_active: produk.is_active,
      is_ticket: produk.is_ticket,
      product_category_id:
        produk.product_category_id ?? produk.product_category?.id ?? null,
      department_owners: (produk.department_owner ?? []).map((owner) => ({
        id: owner.department_id,
        name: owner.department_name,
      })),
    });
    setDepartemenPickerOpen(false);
    setKategoriPickerOpen(false);
    setSearchDepartemen("");
    onKategoriSearchChange("");
    setReferenceFile(null);
    setFileError("");
    setValidationErrors({});
  }, [open, produk, setSearchDepartemen]);

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      day_type: "",
      is_active: true,
      is_ticket: false,
      department_owners: [],
      product_category_id: null,
    });
    setDepartemenPickerOpen(false);
    setKategoriPickerOpen(false);
    setSearchDepartemen("");
    setReferenceFile(null);
    setFileError("");
    setValidationErrors({});
    onClose();
  };

  const handleSubmit = async () => {
    if (submitting || !produk) return;

    const validation = createProdukFormSchema.safeParse({
      name: formData.name,
      product_category_id: formData.product_category_id ?? 0,
      price: formData.price,
      typeDay: formData.day_type,
      is_ticket: formData.is_ticket,
      department_owners: formData.department_owners,
    });

    if (!validation.success) {
      const errors: ValidationErrors = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof CreateProdukFormValues;
        errors[field] ??= issue.message;
      });
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    const payload: UpdateProdukPayload = {
      name: validation.data.name,
      product_category_id: validation.data.product_category_id,
      description: formData.description.trim(),
      price: Number(validation.data.price),
      department_owners: validation.data.department_owners.map((owner) => ({
        department_id: owner.id,
        department_name: owner.name,
      })),
      day_type: formData.day_type,
      is_ticket: formData.is_ticket,
      is_active: formData.is_active,
    };

    try {
      await onSubmit(payload, referenceFile);
    } catch {
      // Parent menampilkan toast error; biarkan nilai form tetap tersedia.
    }
  };

  const handleFileChange = (file?: File) => {
    if (!file) return;
    const validType = ["application/pdf", "image/jpeg", "image/png"].includes(
      file.type,
    );
    if (!validType || file.size > 5 * 1024 * 1024) {
      setFileError(
        "Pilih PDF, JPG, JPEG, atau PNG dengan ukuran maksimal 5 MB.",
      );
      return;
    }
    setFileError("");
    setReferenceFile(file);
  };

  const currentReference = produk?.reference_file;
  const currentReferenceName =
    typeof currentReference === "string"
      ? currentReference.split(/[\\/]/).pop()
      : currentReference?.name;
  const currentReferenceUrl =
    typeof currentReference === "object" && currentReference
      ? currentReference.url
      : typeof currentReference === "string"
        ? currentReference
        : undefined;

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="Edit Master Produk"
      icon={<FaPen />}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="destructive" onClick={handleClose}>
            Batal
          </Button>
          <Button variant="primer" onClick={() => void handleSubmit()}>
            <FaSave size={14} />
            {submitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      }
    >
      {loadingProduk ? (
        <p className="py-10 text-center text-sm text-slate-500">
          Memuat data produk...
        </p>
      ) : produkError ? (
        <p role="alert" className="py-6 text-sm text-red-600">
          {produkError}
        </p>
      ) : produk ? (
        <AppModal.Section title="Master Produk" showHeader={false}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field>
              <FieldLabel>Nama Produk</FieldLabel>
              <Input
                placeholder="Masukkan nama produk"
                value={formData.name}
                onChange={(event) => {
                  const value = event.target.value;
                  setFormData((current) => ({ ...current, name: value }));
                  if (value.trim())
                    setValidationErrors((current) => ({
                      ...current,
                      name: undefined,
                    }));
                }}
              />
              {validationErrors.name && (
                <p role="alert" className="text-sm text-red-500">
                  {validationErrors.name}
                </p>
              )}
            </Field>
            <Field>
              <FieldLabel>Kategori Produk</FieldLabel>
              <SearchablePopover<KategoriProdukRecord>
                open={kategoriPickerOpen}
                onOpenChange={setKategoriPickerOpen}
                search={kategoriSearch}
                onSearchChange={onKategoriSearchChange}
                placeholder="Pilih kategori produk"
                selectedLabel={
                  kategoriProduk.find(
                    (kategori) => kategori.id === formData.product_category_id,
                  )?.name ?? produk.product_category?.name ?? null
                }
                selectedKey={
                  formData.product_category_id === null
                    ? null
                    : String(formData.product_category_id)
                }
                items={kategoriProduk}
                onSelect={(kategori) => {
                  setFormData((current) => ({
                    ...current,
                    product_category_id: kategori.id,
                  }));
                  setKategoriPickerOpen(false);
                  setValidationErrors((current) => ({
                    ...current,
                    product_category_id: undefined,
                  }));
                }}
                renderItem={(kategori) => kategori.name}
                getKey={(kategori) => String(kategori.id)}
                emptyText={
                  loadingKategoriProduk
                    ? "Memuat kategori produk..."
                    : (kategoriProdukError ?? "Kategori produk tidak ditemukan")
                }
              />
              {validationErrors.product_category_id && (
                <p role="alert" className="text-sm text-red-500">
                  {validationErrors.product_category_id}
                </p>
              )}
            </Field>
            <Field>
              <FieldLabel>Apakah ini produk tiket?</FieldLabel>
              <Select
                value={String(formData.is_ticket)}
                onValueChange={(value) =>
                  setFormData((current) => ({
                    ...current,
                    is_ticket: value === "true",
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {formData.is_ticket ? "Ya" : "Tidak"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="start" alignItemWithTrigger={false}>
                  <SelectItem value="true">Ya</SelectItem>
                  <SelectItem value="false">Tidak</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Tipe Hari</FieldLabel>
              <Select
                value={formData.day_type}
                onValueChange={(value) =>
                  setFormData((current) => ({
                    ...current,
                    day_type: value ?? "",
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {formData.day_type === "weekend"
                      ? "Weekend"
                      : formData.day_type === "weekday"
                        ? "Weekday"
                        : formData.day_type}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="start" alignItemWithTrigger={false}>
                  <SelectItem value="weekend">Weekend</SelectItem>
                  <SelectItem value="weekday">Weekday</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Harga</FieldLabel>
              <Input
                placeholder="Masukkan harga"
                value={formData.price ? formatRupiah(formData.price) : ""}
                onChange={(event) => {
                  const value = event.target.value.replace(/\D/g, "");
                  setFormData((current) => ({ ...current, price: value }));
                  if (value)
                    setValidationErrors((current) => ({
                      ...current,
                      price: undefined,
                    }));
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
                className={`relative [&>button]:h-auto! [&>button]:max-h-24! [&>button]:min-h-10! [&>button]:items-center! [&>button]:overflow-hidden! [&>button]:py-1.5! ${selectedDepartemen.length ? "[&>button>span:first-child]:opacity-0" : ""}`}
              >
                <SearchablePopover<Departemen>
                  multi
                  open={departemenPickerOpen}
                  onOpenChange={setDepartemenPickerOpen}
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
                    setFormData((current) => ({
                      ...current,
                      department_owners: selected,
                    }));
                    if (selected.length)
                      setValidationErrors((current) => ({
                        ...current,
                        department_owners: undefined,
                      }));
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
                    onClick={() =>
                      setDepartemenPickerOpen((current) => !current)
                    }
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
                          className="rounded-full text-blue-600 hover:text-blue-900 dark:text-blue-300 dark:hover:text-white"
                          onClick={(event) => {
                            event.stopPropagation();
                            setFormData((current) => ({
                              ...current,
                              department_owners:
                                current.department_owners.filter(
                                  (selected) => selected.id !== item.id,
                                ),
                            }));
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {validationErrors.department_owners && (
                <p role="alert" className="text-sm text-red-500">
                  {validationErrors.department_owners}
                </p>
              )}
            </Field>
            <Field>
              <FieldLabel>Status Produk</FieldLabel>
              <Select
                value={String(formData.is_active)}
                onValueChange={(value) =>
                  setFormData((current) => ({
                    ...current,
                    is_active: value === "true",
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {formData.is_active ? "Aktif" : "Nonaktif"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="start" alignItemWithTrigger={false}>
                  <SelectItem value="true">Aktif</SelectItem>
                  <SelectItem value="false">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
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
            <FieldLabel htmlFor="edit-reference-file">
              Referensi / Lampiran
            </FieldLabel>
            <Input
              ref={fileInputRef}
              id="edit-reference-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              className="sr-only"
              onChange={(event) => {
                handleFileChange(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleFileChange(event.dataTransfer.files[0]);
              }}
              className="flex min-h-20 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-blue-200 px-4 py-3 text-center hover:bg-blue-50/50 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              <FaUpload className="text-lg text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium">
                Drag &amp; drop file di sini atau klik untuk memilih
              </span>
              <span className="text-xs text-slate-500">
                PDF, JPG, JPEG, PNG (maks. 5 MB)
              </span>
            </button>
            {fileError && (
              <FieldDescription className="text-red-600">
                {fileError}
              </FieldDescription>
            )}
            {referenceFile ? (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                {referenceFile.type.startsWith("image/") ? (
                  <span className="text-blue-500">Gambar</span>
                ) : (
                  <FaFilePdf className="text-red-500" />
                )}
                <span className="truncate">{referenceFile.name}</span>
                <button
                  type="button"
                  aria-label="Hapus file baru"
                  onClick={() => setReferenceFile(null)}
                >
                  <FaXmark />
                </button>
              </div>
            ) : currentReferenceName ? (
              <p className="truncate text-sm text-slate-600 dark:text-slate-300">
                File saat ini:{" "}
                {currentReferenceUrl ? (
                  <a
                    href={currentReferenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400"
                  >
                    {currentReferenceName}
                  </a>
                ) : (
                  currentReferenceName
                )}
              </p>
            ) : null}
          </Field>
        </AppModal.Section>
      ) : null}
    </AppModal>
  );
};

export default EditMasterProduk;
