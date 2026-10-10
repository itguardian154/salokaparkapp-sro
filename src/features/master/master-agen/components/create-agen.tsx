import AppModal from "@/components/base-modal";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProvinces } from "@/features/wilayah/hooks/use-provinces";
import { useCities } from "@/features/wilayah/hooks/use-cities";
import type { Province } from "@/features/wilayah/types/wilayah";
import { useEffect, useState } from "react";
import { FaSave } from "react-icons/fa";
import { FaPlus, FaTrash } from "react-icons/fa6";

import { createMasterAgentSchema } from "../schemas/master-agen-schema";
import type {
  CreateMasterAgentPayload,
  CreateMasterAgentBranchPayload,
} from "../types/master-agen";

type CreateMasterProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateMasterAgentPayload) => void;
};

type AgentTextField =
  | "code"
  | "name"
  | "association_name"
  | "type"
  | "company_name"
  | "contact_person"
  | "phone"
  | "address"
  | "website"
  | "logo";

type BranchTextField =
  | "name"
  | "code"
  | "contact_person"
  | "phone"
  | "address";

type BranchForm = Omit<
  CreateMasterAgentBranchPayload,
  "is_active" | "province_id" | "city_id"
> & {
  province_id: number | null;
  city_id: number | null;
};

type AgentForm = Omit<
  CreateMasterAgentPayload,
  "branches" | "is_active" | "province_id" | "city_id"
> & {
  province_id: number | null;
  city_id: number | null;
};

type ValidationErrors = Record<string, string>;

const initialBranch: BranchForm = {
  name: "",
  province_id: null,
  city_id: null,
  code: "",
  contact_person: "",
  phone: "",
  address: "",
};

const initialForm: AgentForm = {
  code: "",
  name: "",
  association_name: "",
  type: "",
  company_name: "",
  contact_person: "",
  phone: "",
  address: "",
  province_id: null,
  city_id: null,
  website: "",
  logo: "",
};

type ProvinceCityFieldsProps = {
  provinces: Province[];
  provinceId: number | null;
  cityId: number | null;
  onProvinceChange: (id: number | null) => void;
  onCityChange: (id: number | null) => void;
  provinceLoading: boolean;
  provinceError: string | null;
  provinceValidationError?: string;
  cityValidationError?: string;
};

const ProvinceCityFields = ({
  provinces,
  provinceId,
  cityId,
  onProvinceChange,
  onCityChange,
  provinceLoading,
  provinceError,
  provinceValidationError,
  cityValidationError,
}: ProvinceCityFieldsProps) => {
  const {
    cities,
    loading: citiesLoading,
    error: citiesError,
  } = useCities(provinceId);

  const selectClassName =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <>
      <Field>
        <FieldLabel>Provinsi</FieldLabel>

        <select
          value={provinceId ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            onProvinceChange(value ? Number(value) : null);
          }}
          disabled={provinceLoading}
          className={selectClassName}
        >
          <option value="">
            {provinceLoading ? "Memuat provinsi..." : "Pilih provinsi"}
          </option>

          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>

        {provinceError && (
          <p className="text-sm text-red-500">{provinceError}</p>
        )}

        {provinceValidationError && (
          <p className="text-sm text-red-500">
            {provinceValidationError}
          </p>
        )}
      </Field>

      <Field>
        <FieldLabel>Kota/Kabupaten</FieldLabel>

        <select
          value={cityId ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            onCityChange(value ? Number(value) : null);
          }}
          disabled={provinceId === null || citiesLoading}
          className={selectClassName}
        >
          <option value="">
            {provinceId === null
              ? "Pilih provinsi terlebih dahulu"
              : citiesLoading
                ? "Memuat kota..."
                : "Pilih kota/kabupaten"}
          </option>

          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>

        {citiesError && (
          <p className="text-sm text-red-500">{citiesError}</p>
        )}

        {cityValidationError && (
          <p className="text-sm text-red-500">
            {cityValidationError}
          </p>
        )}
      </Field>
    </>
  );
};

const CreateMasterAgen = ({
  open,
  onClose,
  onSubmit,
}: CreateMasterProps) => {
  const [form, setForm] = useState<AgentForm>({ ...initialForm });
  const [branches, setBranches] = useState<BranchForm[]>([
    { ...initialBranch },
  ]);
  const [validationErrors, setValidationErrors] =
    useState<ValidationErrors>({});

  const {
    provinces,
    loading: provincesLoading,
    error: provincesError,
  } = useProvinces();

  useEffect(() => {
    if (open) {
      setForm({ ...initialForm });
      setBranches([{ ...initialBranch }]);
      setValidationErrors({});
    }
  }, [open]);

  const getError = (field: string) => validationErrors[field];

  const clearError = (field: string) => {
    setValidationErrors((previous) => {
      if (!(field in previous)) return previous;

      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const handleChange = (field: AgentTextField, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    clearError(field);
  };

  const handleBranchChange = (
    index: number,
    field: BranchTextField,
    value: string,
  ) => {
    setBranches((previous) =>
      previous.map((branch, branchIndex) =>
        branchIndex === index
          ? {
            ...branch,
            [field]: value,
          }
          : branch,
      ),
    );

    clearError(`branches.${index}.${field}`);
  };

  const handleAgentProvinceChange = (id: number | null) => {
    setForm((previous) => ({
      ...previous,
      province_id: id,
      city_id: null,
    }));

    clearError("province_id");
    clearError("city_id");
  };

  const handleAgentCityChange = (id: number | null) => {
    setForm((previous) => ({
      ...previous,
      city_id: id,
    }));

    clearError("city_id");
  };

  const handleBranchProvinceChange = (
    index: number,
    id: number | null,
  ) => {
    setBranches((previous) =>
      previous.map((branch, branchIndex) =>
        branchIndex === index
          ? {
            ...branch,
            province_id: id,
            city_id: null,
          }
          : branch,
      ),
    );

    clearError(`branches.${index}.province_id`);
    clearError(`branches.${index}.city_id`);
  };

  const handleBranchCityChange = (
    index: number,
    id: number | null,
  ) => {
    setBranches((previous) =>
      previous.map((branch, branchIndex) =>
        branchIndex === index
          ? {
            ...branch,
            city_id: id,
          }
          : branch,
      ),
    );

    clearError(`branches.${index}.city_id`);
  };

  const handleAddBranch = () => {
    setBranches((previous) => [...previous, { ...initialBranch }]);
    clearError("branches");
  };

  const handleRemoveBranch = (index: number) => {
    setBranches((previous) =>
      previous.filter((_, branchIndex) => branchIndex !== index),
    );

    setValidationErrors((previous) => {
      const next: ValidationErrors = {};

      Object.entries(previous).forEach(([key, message]) => {
        if (!key.startsWith("branches.")) {
          next[key] = message;
          return;
        }

        const match = key.match(/^branches\.(\d+)\.(.+)$/);

        if (!match) {
          next[key] = message;
          return;
        }

        const oldIndex = Number(match[1]);
        const field = match[2];

        if (oldIndex < index) {
          next[key] = message;
        } else if (oldIndex > index) {
          next[`branches.${oldIndex - 1}.${field}`] = message;
        }
      });

      return next;
    });
  };

  const handleSubmit = () => {
    console.log("[CREATE AGEN] Tombol Simpan diklik");

    const payload = {
      ...form,
      is_active: true,
      branches: branches.map((branch) => ({
        ...branch,
        is_active: true,
      })),
    };

    const result = createMasterAgentSchema.safeParse(payload);

    if (!result.success) {
      console.error(
        "[CREATE AGEN] Validasi gagal:",
        result.error.issues,
      );

      const errors: ValidationErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path.join(".");

        if (!errors[field]) {
          errors[field] = issue.message;
        }
      });

      setValidationErrors(errors);
      return;
    }

    console.log("[CREATE AGEN] Validasi berhasil");
    console.log("[CREATE AGEN] Memanggil onSubmit");

    setValidationErrors({});
    onSubmit(result.data as CreateMasterAgentPayload);
  };


  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Tambah Master Agen"
      icon={<FaPlus />}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="destructive" onClick={onClose}>
            Batal
          </Button>

          <Button variant="primer" onClick={handleSubmit}>
            <FaSave size={14} />
            Simpan
          </Button>
        </div>
      }
    >
      <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
        <AppModal.Section title="Informasi Agen">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* <Field>
              <FieldLabel>Kode Agen</FieldLabel>
              <Input
                value={form.code}
                onChange={(event) =>
                  handleChange("code", event.target.value)
                }
                placeholder="Contoh: CMP-0003"
              />
              {getError("code") && (
                <p className="text-sm text-red-500">{getError("code")}</p>
              )}
            </Field> */}

            <Field>
              <FieldLabel>Nama Travel</FieldLabel>
              <Input
                value={form.name}
                onChange={(event) =>
                  handleChange("name", event.target.value)
                }
                placeholder="Masukkan nama travel"
              />
              {getError("name") && (
                <p className="text-sm text-red-500">{getError("name")}</p>
              )}
            </Field>

            <Field>
              <FieldLabel>Nama Asosiasi</FieldLabel>
              <Input
                value={form.association_name}
                onChange={(event) =>
                  handleChange("association_name", event.target.value)
                }
                placeholder="Contoh: ASITA"
              />
              {getError("association_name") && (
                <p className="text-sm text-red-500">
                  {getError("association_name")}
                </p>
              )}
            </Field>

            {/* <Field>
              <FieldLabel>Tipe Agen</FieldLabel>
              <Input
                value={form.type}
                onChange={(event) =>
                  handleChange("type", event.target.value)
                }
                placeholder="Contoh: corporate"
              />
              {getError("type") && (
                <p className="text-sm text-red-500">{getError("type")}</p>
              )}
            </Field> */}

            {/* <Field>
              <FieldLabel>Nama Perusahaan</FieldLabel>
              <Input
                value={form.company_name}
                onChange={(event) =>
                  handleChange("company_name", event.target.value)
                }
                placeholder="Masukkan nama perusahaan"
              />
              {getError("company_name") && (
                <p className="text-sm text-red-500">
                  {getError("company_name")}
                </p>
              )}
            </Field> */}

            <Field>
              <FieldLabel>Nama PIC</FieldLabel>
              <Input
                value={form.contact_person}
                onChange={(event) =>
                  handleChange("contact_person", event.target.value)
                }
                placeholder="Nama PIC"
              />
              {getError("contact_person") && (
                <p className="text-sm text-red-500">
                  {getError("contact_person")}
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel>WhatsApp</FieldLabel>
              <Input
                value={form.phone}
                onChange={(event) =>
                  handleChange("phone", event.target.value)
                }
                placeholder="Contoh: 6281234567890"
              />
              {getError("phone") && (
                <p className="text-sm text-red-500">{getError("phone")}</p>
              )}
            </Field>

            <ProvinceCityFields
              provinces={provinces}
              provinceId={form.province_id}
              cityId={form.city_id}
              onProvinceChange={handleAgentProvinceChange}
              onCityChange={handleAgentCityChange}
              provinceLoading={provincesLoading}
              provinceError={provincesError}
              provinceValidationError={getError("province_id")}
              cityValidationError={getError("city_id")}
            />

            {/* <Field>
              <FieldLabel>Website</FieldLabel>
              <Input
                value={form.website}
                onChange={(event) =>
                  handleChange("website", event.target.value)
                }
                placeholder="https://contoh.co.id (opsional)"
              />
              {getError("website") && (
                <p className="text-sm text-red-500">{getError("website")}</p>
              )}
            </Field> */}

            {/* <Field>
              <FieldLabel>Logo URL</FieldLabel>
              <Input
                value={form.logo}
                onChange={(event) =>
                  handleChange("logo", event.target.value)
                }
                placeholder="https://contoh.co.id/logo.png (opsional)"
              />
              {getError("logo") && (
                <p className="text-sm text-red-500">{getError("logo")}</p>
              )}
            </Field> */}

            {/* <div className="md:col-span-2">
              <Field>
                <FieldLabel>Alamat Agen</FieldLabel>
                <Textarea
                  value={form.address}
                  onChange={(event) =>
                    handleChange("address", event.target.value)
                  }
                  placeholder="Masukkan alamat agen"
                />
                {getError("address") && (
                  <p className="text-sm text-red-500">
                    {getError("address")}
                  </p>
                )}
              </Field>
            </div> */}
          </div>
        </AppModal.Section>

        <AppModal.Section title="Cabang Agen">
          {getError("branches") && (
            <p className="mb-3 text-sm text-red-500">
              {getError("branches")}
            </p>
          )}

          <div className="space-y-4">
            {branches.map((branch, index) => (
              <div
                key={index}
                className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Cabang {index + 1}</h3>

                  {branches.length > 1 && (
                    <Button
                      variant="destructive"
                      onClick={() => handleRemoveBranch(index)}
                    >
                      <FaTrash size={13} />
                      Hapus
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel>Nama Cabang</FieldLabel>
                    <Input
                      value={branch.name}
                      onChange={(event) =>
                        handleBranchChange(
                          index,
                          "name",
                          event.target.value,
                        )
                      }
                      placeholder="Nama cabang"
                    />
                    {getError(`branches.${index}.name`) && (
                      <p className="text-sm text-red-500">
                        {getError(`branches.${index}.name`)}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel>Kode Cabang</FieldLabel>
                    <Input
                      value={branch.code}
                      onChange={(event) =>
                        handleBranchChange(
                          index,
                          "code",
                          event.target.value,
                        )
                      }
                      placeholder="Contoh: BR-JKT-001"
                    />
                    {getError(`branches.${index}.code`) && (
                      <p className="text-sm text-red-500">
                        {getError(`branches.${index}.code`)}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel>Nama PIC</FieldLabel>
                    <Input
                      value={branch.contact_person}
                      onChange={(event) =>
                        handleBranchChange(
                          index,
                          "contact_person",
                          event.target.value,
                        )
                      }
                      placeholder="Nama PIC"
                    />
                    {getError(`branches.${index}.contact_person`) && (
                      <p className="text-sm text-red-500">
                        {getError(`branches.${index}.contact_person`)}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel>WhatsApp</FieldLabel>
                    <Input
                      value={branch.phone}
                      onChange={(event) =>
                        handleBranchChange(
                          index,
                          "phone",
                          event.target.value,
                        )
                      }
                      placeholder="Nomor telepon"
                    />
                    {getError(`branches.${index}.phone`) && (
                      <p className="text-sm text-red-500">
                        {getError(`branches.${index}.phone`)}
                      </p>
                    )}
                  </Field>

                  <ProvinceCityFields
                    provinces={provinces}
                    provinceId={branch.province_id}
                    cityId={branch.city_id}
                    onProvinceChange={(id) =>
                      handleBranchProvinceChange(index, id)
                    }
                    onCityChange={(id) =>
                      handleBranchCityChange(index, id)
                    }
                    provinceLoading={provincesLoading}
                    provinceError={provincesError}
                    provinceValidationError={getError(
                      `branches.${index}.province_id`,
                    )}
                    cityValidationError={getError(
                      `branches.${index}.city_id`,
                    )}
                  />

                  <div className="md:col-span-2">
                    <Field>
                      <FieldLabel>Alamat Cabang</FieldLabel>
                      <Textarea
                        value={branch.address}
                        onChange={(event) =>
                          handleBranchChange(
                            index,
                            "address",
                            event.target.value,
                          )
                        }
                        placeholder="Alamat cabang"
                      />
                      {getError(`branches.${index}.address`) && (
                        <p className="text-sm text-red-500">
                          {getError(`branches.${index}.address`)}
                        </p>
                      )}
                    </Field>
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={handleAddBranch}>
              <FaPlus size={13} />
              Tambah Cabang
            </Button>
          </div>
        </AppModal.Section>
      </div>
    </AppModal>
  );
};

export default CreateMasterAgen;
