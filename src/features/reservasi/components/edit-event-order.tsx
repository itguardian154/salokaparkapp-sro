
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
import type { EditReservasiEventOrder } from "../types/reservasi";

import { useEffect, useRef, useState } from "react";
import { FaSave } from "react-icons/fa";
import {
  FaDatabase,
  FaFilePdf,
  FaPlus,
  FaUpload,
  FaXmark,
} from "react-icons/fa6";

type DepartemenOptions = {
  items: Departemen[];
  search: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
  error: string | null;
};

type EditEventOrderModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    payload: EditReservasiEventOrder,
    attachments: File[],
  ) => Promise<void>;
  submitting?: boolean;
  initialData?: EditReservasiEventOrder | null;
  departemenOptions: DepartemenOptions;
};

type KuponBelanja = {
  id: number;
  jumlah: string;
  pecahan: string;
};

const EMPTY_FORM: EditReservasiEventOrder = {
  department_id: "",
  department_name: "",
  sub_department_id: null,
  sub_department_name: null,
  description: null,
  location_id: null,
  location_detail: null,
  product_id: null,
  product_code: null,
  product_description: null,
  quantity: null,
  unit_price: null,
  total_price: null,
  shopping_voucher: null,
  voucher_tour_leader: null,
  meal_voucher: null,
  ticket_print_date: null,
  serving_time: null,
  serving_location: null,
  serving_type: null,
  start_at: null,
  end_at: null,
  status: "draft",
  status_label: "Draft",
};

const penyajianOptions = [
  "Box",
  "Buffet",
  "Family Style",
  "Platter",
];

const tempatPenyajianOptions = [
  "Restaurant",
  "Hall",
  "Meeting Room",
  "Outdoor",
  "Lobby",
];

const pecahanOptions = [
  { label: "Rp 1.000", value: 1000 },
  { label: "Rp 2.000", value: 2000 },
  { label: "Rp 5.000", value: 5000 },
  { label: "Rp 10.000", value: 10000 },
  { label: "Rp 20.000", value: 20000 },
  { label: "Rp 50.000", value: 50000 },
  { label: "Rp 100.000", value: 100000 },
];

const getCurrentDateTime = () => {
  const now = new Date();

  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  const time = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join(":");

  return `${date} ${time}`;
};

const EditEventOrderModal = ({
  open,
  onClose,
  onSubmit,
  submitting = false,
  initialData,
  departemenOptions,
}: EditEventOrderModalProps) => {
  const {
    items: departemen,
    search: searchDepartemen,
    onSearchChange: setSearchDepartemen,
    loading: loadingDepartemen,
    error: departemenError,
  } = departemenOptions;

  const [formData, setFormData] =
    useState<EditReservasiEventOrder>(EMPTY_FORM);

  const [dateTime, setDateTime] = useState("");
  const [openDepartemen, setOpenDepartemen] = useState(false);
  const [selectedDepartemen, setSelectedDepartemen] =
    useState<Departemen | null>(null);

  const [kuponBelanja, setKuponBelanja] = useState<KuponBelanja[]>([
    { id: 1, jumlah: "", pecahan: "" },
  ]);

  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState("");
  const [draggingFiles, setDraggingFiles] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrls = useRef(new Map<File, string>());

  const isIR = formData.department_id === "DP005";
  const isFA = formData.department_id === "DP013";

  const namaKaryawan =
    localStorage.getItem("namakaryawan") ?? "";

  const departemenPembuat =
    localStorage.getItem("departemen") ?? "";

  const requestName = `${namaKaryawan}${
    departemenPembuat ? ` - ${departemenPembuat}` : ""
  }`;

  const updateField = <K extends keyof EditReservasiEventOrder>(
    field: K,
    value: EditReservasiEventOrder[K],
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (!open) return;

    setDateTime(getCurrentDateTime());

    if (initialData) {
      setFormData({ ...EMPTY_FORM, ...initialData });

      const department = departemen.find(
        (item) =>
          String(item.id_dept) ===
          String(initialData.department_id),
      );

      setSelectedDepartemen(department ?? null);
    } else {
      setFormData({ ...EMPTY_FORM });
      setSelectedDepartemen(null);
    }

    setSearchDepartemen("");
    setOpenDepartemen(false);

    setKuponBelanja([
      { id: Date.now(), jumlah: "", pecahan: "" },
    ]);

    setAttachments([]);
    setAttachmentError("");
    setDraggingFiles(false);
  }, [open, initialData]);

  useEffect(
    () => () => {
      previewUrls.current.forEach((url) =>
        URL.revokeObjectURL(url),
      );
      previewUrls.current.clear();
    },
    [],
  );

  const clearForm = () => {
    setFormData({ ...EMPTY_FORM });
    setSelectedDepartemen(null);
    setSearchDepartemen("");
    setOpenDepartemen(false);
    setKuponBelanja([]);
    setAttachments([]);
    setAttachmentError("");
    setDraggingFiles(false);

    previewUrls.current.forEach((url) =>
      URL.revokeObjectURL(url),
    );
    previewUrls.current.clear();
  };

  const handleClose = () => {
    if (submitting) return;
    clearForm();
    onClose();
  };

  const handleSelectDepartemen = (item: Departemen) => {
    setSelectedDepartemen(item);

    setFormData((current) => ({
      ...current,
      department_id: String(item.id_dept),
      department_name: String(item.departemen),
    }));

    setOpenDepartemen(false);
    setSearchDepartemen("");
  };

  const handleAddKuponBelanja = () => {
    setKuponBelanja((current) => [
      ...current,
      {
        id: Date.now() + Math.random(),
        jumlah: "",
        pecahan: "",
      },
    ]);
  };

  const handleDeleteKuponBelanja = (id: number) => {
    setKuponBelanja((current) =>
      current.filter((item) => item.id !== id),
    );
  };

  const handleChangeKuponBelanja = (
    id: number,
    field: "jumlah" | "pecahan",
    value: string,
  ) => {
    setKuponBelanja((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, [field]: value }
          : item,
      ),
    );
  };

  const addAttachments = (files: FileList | File[]) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    const incoming = Array.from(files);

    const validFiles = incoming.filter(
      (file) =>
        allowedTypes.includes(file.type) &&
        file.size <= 5 * 1024 * 1024,
    );

    if (validFiles.length === 0) {
      setAttachmentError(
        "Format file harus PDF, JPG, JPEG, atau PNG dengan ukuran maksimal 5 MB.",
      );
      return;
    }

    const selectedFile = validFiles[0];

    previewUrls.current.forEach((url) =>
      URL.revokeObjectURL(url),
    );
    previewUrls.current.clear();

    if (selectedFile.type.startsWith("image/")) {
      previewUrls.current.set(
        selectedFile,
        URL.createObjectURL(selectedFile),
      );
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

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    previewUrls.current.delete(file);

    setAttachments((current) =>
      current.filter((item) => item !== file),
    );
  };

  const formatFileSize = (size: number) =>
    size >= 1024 * 1024
      ? `${(size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(size / 1024))} KB`;

  const handleSubmit = async () => {
    if (submitting || !formData.department_id) return;

    let shoppingVoucher = 0;

    kuponBelanja.forEach((item) => {
      const jumlah = Number(item.jumlah) || 0;
      const pecahan = Number(item.pecahan) || 0;

      shoppingVoucher += jumlah * pecahan;
    });

    const payload: EditReservasiEventOrder = {
      ...formData,
      shopping_voucher:
        shoppingVoucher > 0
          ? shoppingVoucher
          : formData.shopping_voucher,
      department_id: String(formData.department_id),
      department_name: formData.department_name,
      status: formData.status || "draft",
      status_label: formData.status_label || "Draft",
    };

    try {
      await onSubmit(payload, attachments);
      clearForm();
      onClose();
    } catch {
      // Parent menangani error.
    }
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="Edit Event Order"
      icon={<FaDatabase />}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="destructive"
            onClick={handleClose}
            disabled={submitting}
          >
            Batal
          </Button>

          <Button
            type="button"
            variant="primer"
            onClick={() => void handleSubmit()}
            disabled={submitting || !formData.department_id}
          >
            <FaSave size={14} />
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      }
    >
      <AppModal.Section
        title="Edit Event Order"
        showHeader={false}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field>
            <FieldLabel>Date</FieldLabel>
            <Input
              value={dateTime}
              readOnly
              className="bg-slate-100"
            />
          </Field>

          <Field>
            <FieldLabel>Request Name</FieldLabel>
            <Input
              value={requestName}
              readOnly
              className="bg-slate-100"
            />
          </Field>

          <Field className="md:col-span-2">
            <FieldLabel>
              Departemen Tujuan
              <span className="text-red-500"> *</span>
            </FieldLabel>

            <SearchablePopover<Departemen>
              open={openDepartemen}
              onOpenChange={setOpenDepartemen}
              search={searchDepartemen}
              onSearchChange={setSearchDepartemen}
              placeholder="Pilih departemen"
              selectedLabel={
                selectedDepartemen?.departemen ??
                formData.department_name ??
                null
              }
              selectedKey={formData.department_id || null}
              items={departemen}
              onSelect={handleSelectDepartemen}
              renderItem={(item) => item.departemen}
              getKey={(item) => String(item.id_dept)}
              emptyText={
                loadingDepartemen
                  ? "Memuat departemen..."
                  : departemenError ??
                    "Departemen tidak ditemukan"
              }
            />
          </Field>

          {/* FORM IR */}

          {isIR && (
            <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
              <div className="border-t pt-4 md:col-span-2">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                  Food & Beverage
                </h3>
              </div>

              <Field>
                <FieldLabel>Paket</FieldLabel>
                <Input
                  value={formData.product_description ?? ""}
                  readOnly
                  placeholder="Auto fill"
                  className="bg-slate-100"
                />
              </Field>

              <Field>
                <FieldLabel>Penyajian</FieldLabel>
                <Select
                  value={formData.serving_type ?? ""}
                  onValueChange={(value) =>
                    updateField("serving_type", value ?? null)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih penyajian" />
                  </SelectTrigger>
                  <SelectContent>
                    {penyajianOptions.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Jumlah Pax</FieldLabel>
                <Input
                  type="number"
                  min="0"
                  value={formData.quantity ?? ""}
                  readOnly
                  placeholder="Auto fill"
                  className="bg-slate-100"
                />
              </Field>

              <Field>
                <FieldLabel>Jam Penyajian</FieldLabel>
                <Input
                  type="time"
                  value={formData.serving_time ?? ""}
                  onChange={(event) =>
                    updateField(
                      "serving_time",
                      event.target.value || null,
                    )
                  }
                />
              </Field>

              <Field>
                <FieldLabel>Harga</FieldLabel>
                <Input
                  value={formData.unit_price ?? ""}
                  readOnly
                  placeholder="Auto fill"
                  className="bg-slate-100"
                />
              </Field>

              <Field>
                <FieldLabel>Tempat Penyajian</FieldLabel>
                <Select
                  value={formData.serving_location ?? ""}
                  onValueChange={(value) =>
                    updateField(
                      "serving_location",
                      value ?? null,
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih tempat penyajian" />
                  </SelectTrigger>
                  <SelectContent>
                    {tempatPenyajianOptions.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field className="md:col-span-2">
                <FieldLabel>Detail Menu</FieldLabel>
                <Textarea
                  value={formData.product_description ?? ""}
                  readOnly
                  placeholder="Auto fill"
                  className="bg-slate-100"
                />
              </Field>

              <div className="border-t pt-4 md:col-span-2">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                  Retail & Merchandise
                </h3>
              </div>

              <Field>
                <FieldLabel>Nama Barang</FieldLabel>
                <Input
                  value={formData.product_description ?? ""}
                  readOnly
                  placeholder="Auto fill"
                  className="bg-slate-100"
                />
              </Field>

              <Field>
                <FieldLabel>Jumlah</FieldLabel>
                <Input
                  value={formData.quantity ?? ""}
                  readOnly
                  placeholder="Auto fill"
                  className="bg-slate-100"
                />
              </Field>

              <Field>
                <FieldLabel>Harga</FieldLabel>
                <Input
                  value={formData.unit_price ?? ""}
                  readOnly
                  placeholder="Auto fill"
                  className="bg-slate-100"
                />
              </Field>
            </div>
          )}

          {/* FORM FA */}

          {isFA && (
            <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
              <div className="border-t pt-4 md:col-span-2">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                  Detail Request FA
                </h3>
              </div>

              <Field>
                <FieldLabel>Tanggal Cetak Tiket</FieldLabel>
                <Input
                  type="date"
                  value={
                    formData.ticket_print_date?.slice(0, 10) ?? ""
                  }
                  onChange={(event) =>
                    updateField(
                      "ticket_print_date",
                      event.target.value || null,
                    )
                  }
                />
              </Field>

              <Field>
                <FieldLabel>Kupon Makan</FieldLabel>
                <Input
                  type="number"
                  min="0"
                  value={formData.meal_voucher ?? ""}
                  onChange={(event) =>
                    updateField(
                      "meal_voucher",
                      event.target.value
                        ? Number(event.target.value)
                        : null,
                    )
                  }
                  placeholder="Masukkan jumlah"
                />
              </Field>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/30 md:col-span-2">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <FieldLabel className="!mb-0">
                    Kupon Belanja
                  </FieldLabel>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddKuponBelanja}
                  >
                    <FaPlus />
                    Add Line
                  </Button>
                </div>

                <div className="space-y-3">
                  {kuponBelanja.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 items-end gap-3 md:grid-cols-[1fr_1fr_auto]"
                    >
                      <Field>
                        <FieldLabel>Jumlah</FieldLabel>
                        <Input
                          type="number"
                          min="0"
                          value={item.jumlah}
                          onChange={(event) =>
                            handleChangeKuponBelanja(
                              item.id,
                              "jumlah",
                              event.target.value,
                            )
                          }
                          placeholder="Jumlah"
                        />
                      </Field>

                      <Field>
                        <FieldLabel>Pecahan</FieldLabel>
                        <Select
                          value={item.pecahan}
                          onValueChange={(value) =>
                            handleChangeKuponBelanja(
                              item.id,
                              "pecahan",
                              value ?? "",
                            )
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih pecahan" />
                          </SelectTrigger>
                          <SelectContent>
                            {pecahanOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={String(option.value)}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={kuponBelanja.length === 1}
                        onClick={() =>
                          handleDeleteKuponBelanja(item.id)
                        }
                        className="h-10 w-10 text-red-500"
                      >
                        <FaXmark />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Field>
                <FieldLabel>Voucher TL</FieldLabel>
                <Input
                  type="number"
                  min="0"
                  value={formData.voucher_tour_leader ?? ""}
                  onChange={(event) =>
                    updateField(
                      "voucher_tour_leader",
                      event.target.value
                        ? Number(event.target.value)
                        : null,
                    )
                  }
                  placeholder="Masukkan jumlah"
                />
              </Field>
            </div>
          )}

          {/* INFORMASI UMUM */}

          {formData.department_id && (
            <>
              <Field className="md:col-span-2">
                <FieldLabel>Desc Request</FieldLabel>
                <Textarea
                  value={formData.description ?? ""}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value || null,
                    )
                  }
                  placeholder="Masukkan deskripsi request"
                />
              </Field>
            </>
          )}
        </div>

        {/* LAMPIRAN */}

        {formData.department_id && (
          <Field className="mt-5">
            <FieldLabel>Referensi / Lampiran</FieldLabel>

            <Input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              className="sr-only"
              onChange={(event) => {
                if (event.target.files) {
                  addAttachments(event.target.files);
                }
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
              className={`flex min-h-20 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-3 text-center ${
                draggingFiles
                  ? "border-blue-500 bg-blue-50"
                  : "border-blue-200 hover:bg-blue-50/50 dark:border-slate-600"
              }`}
            >
              <FaUpload className="text-lg text-blue-600" />
              <span className="text-sm font-medium">
                Drag & drop file di sini
              </span>
              <span className="text-xs text-slate-500">
                PDF, JPG, JPEG, PNG (Maksimal 5 MB)
              </span>
            </button>

            {attachmentError && (
              <FieldDescription className="text-red-600">
                {attachmentError}
              </FieldDescription>
            )}

            {attachments.map((file) => {
              const previewUrl =
                previewUrls.current.get(file) ?? null;

              return (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="flex items-center gap-3 rounded-lg border p-2"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt=""
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-red-50 text-red-500">
                      <FaFilePdf />
                    </span>
                  )}

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {file.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatFileSize(file.size)}
                    </span>
                  </span>

                  <button
                    type="button"
                    aria-label={`Hapus file ${file.name}`}
                    onClick={() => removeAttachment(file)}
                    className="rounded-md p-2 text-slate-500 hover:text-red-600"
                  >
                    <FaXmark />
                  </button>
                </div>
              );
            })}
          </Field>
        )}
      </AppModal.Section>
    </AppModal>
  );
};

export default EditEventOrderModal;
