import AppModal from "@/components/base-modal";
import SearchablePopover from "@/components/searchable-popover";

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

import { useProvinces } from "@/features/wilayah/hooks/use-provinces";
import { useCities } from "@/features/wilayah/hooks/use-cities";
import type {
  Province,
  City,
} from "@/features/wilayah/types/wilayah";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { FaSave, FaPlus, FaTrash } from "react-icons/fa";
import { Building2, GitBranch } from "lucide-react";

import { createMasterAgentSchema } from "../schemas/master-agen-schema";

import type {
  AgentDetail,
  CreateMasterAgentPayload,
  CreateMasterAgentBranchPayload,
} from "../types/master-agen";

type EditMasterAgentBranchPayload = Omit<
  CreateMasterAgentBranchPayload,
  "province_id" | "city_id"
> & {
  id?: number;
  province_name: string;
  city_name: string;
};

type EditMasterAgentPayload = Omit<
  CreateMasterAgentPayload,
  "branches" | "province_id" | "city_id"
> & {
  province_name: string;
  city_name: string;
  branches: EditMasterAgentBranchPayload[];
};

type EditMasterProps = {
  open: boolean;
  onClose: () => void;
  agent: AgentDetail | null;
  onSubmit: (
    id: number,
    payload: EditMasterAgentPayload,
  ) => Promise<void>;
  submitting?: boolean;
};

type AgentTextField =
  | "name"
  | "association_name"
  | "company_name"
  | "contact_person"
  | "phone";

type BranchTextField =
  | "name"
  | "contact_person"
  | "phone"
  | "address";

type BranchForm = {
  id?: number;
  name: string;
  province_name: string;
  city_name: string;
  code: string;
  contact_person: string;
  phone: string;
  address: string;
  is_active: boolean;
};

type AgentForm = {
  code: string;
  name: string;
  association_name: string;
  type: string;
  company_name: string;
  contact_person: string;
  phone: string;
  address: string;
  province_name: string;
  city_name: string;
  website: string;
  logo: string;
  is_active: boolean;
};

type ValidationErrors = Record<string, string>;

const initialBranch: BranchForm = {
  name: "",
  province_name: "",
  city_name: "",
  code: "",
  contact_person: "",
  phone: "",
  address: "",
  is_active: true,
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
  province_name: "",
  city_name: "",
  website: "",
  logo: "",
  is_active: true,
};

const normalizeName = (
  value: string | null | undefined,
) =>
  (value ?? "")
    .trim()
    .toLocaleLowerCase("id-ID")
    .replace(/\s+/g, " ");

type ProvinceCityFieldsProps = {
  provinces: Province[];
  provinceName: string;
  cityName: string;
  onProvinceChange: (name: string) => void;
  onCityChange: (name: string) => void;
  provinceLoading: boolean;
  provinceError: string | null;
  provinceValidationError?: string;
  cityValidationError?: string;
};

const ProvinceCityFields = ({
  provinces,
  provinceName,
  cityName,
  onProvinceChange,
  onCityChange,
  provinceLoading,
  provinceError,
  provinceValidationError,
  cityValidationError,
}: ProvinceCityFieldsProps) => {
  const [openProvince, setOpenProvince] = useState(false);
  const [openCity, setOpenCity] = useState(false);

  const [searchProvince, setSearchProvince] = useState("");
  const [searchCity, setSearchCity] = useState("");

  // Cari ID provinsi berdasarkan provinceName yang dipilih untuk meload daftar kota
  const selectedProvinceObj = provinces.find(
    (p) => normalizeName(p.name) === normalizeName(provinceName)
  );

  const {
    cities,
    loading: citiesLoading,
  } = useCities(selectedProvinceObj ? Number(selectedProvinceObj.id) : null);

  const filteredProvinces = provinces.filter((province) =>
    normalizeName(province.name).includes(
      normalizeName(searchProvince),
    ),
  );

  const filteredCities = cities.filter((city) =>
    normalizeName(city.name).includes(
      normalizeName(searchCity),
    ),
  );

  const handleProvinceSelect = (provinceNameVal: string) => {
    if (normalizeName(provinceNameVal) !== normalizeName(provinceName)) {
      onProvinceChange(provinceNameVal);
      onCityNameChange(""); // Reset kota jika provinsi berubah
    }
    setOpenProvince(false);
    setSearchProvince("");
  };

  const handleCitySelect = (cityNameVal: string) => {
    onCityChange(cityNameVal);
    setOpenCity(false);
    setSearchCity("");
  };

  const onCityNameChange = (name: string) => {
    onCityChange(name);
  };

  return (
    <>
      <Field>
        <FieldLabel>Provinsi</FieldLabel>

        <SearchablePopover<Province>
          open={openProvince}
          onOpenChange={setOpenProvince}
          search={searchProvince}
          onSearchChange={setSearchProvince}
          placeholder={
            provinceLoading
              ? "Memuat provinsi..."
              : "Pilih provinsi"
          }
          selectedLabel={provinceName || null}
          selectedKey={provinceName || null}
          items={filteredProvinces}
          getKey={(province) => province.name}
          renderItem={(province) => province.name}
          onSelect={(province) =>
            handleProvinceSelect(province.name)
          }
          disabled={provinceLoading}
          emptyText={
            provinceError
              ? "Provinsi gagal dimuat."
              : "Provinsi tidak ditemukan."
          }
          debounceDelay={500}
        />

        {provinceError && (
          <p className="text-sm text-red-500">
            {provinceError}
          </p>
        )}

        {provinceValidationError && (
          <p className="text-sm text-red-500">
            {provinceValidationError}
          </p>
        )}
      </Field>

      <Field>
        <FieldLabel>Kota/Kabupaten</FieldLabel>

        <SearchablePopover<City>
          open={openCity}
          onOpenChange={setOpenCity}
          search={searchCity}
          onSearchChange={setSearchCity}
          placeholder={
            !provinceName
              ? "Pilih provinsi terlebih dahulu"
              : citiesLoading
                ? "Memuat kota..."
                : "Pilih kota/kabupaten"
          }
          selectedLabel={cityName || null}
          selectedKey={cityName || null}
          items={filteredCities}
          getKey={(city) => city.name}
          renderItem={(city) => city.name}
          onSelect={(city) =>
            handleCitySelect(city.name)
          }
          disabled={
            !provinceName ||
            citiesLoading ||
            provinceLoading
          }
          emptyText="Kota/kabupaten tidak ditemukan."
          debounceDelay={500}
        />

        {cityValidationError && (
          <p className="text-sm text-red-500">
            {cityValidationError}
          </p>
        )}
      </Field>
    </>
  );
};

type StatusFieldProps = {
  label: string;
  active: boolean;
  onValueChange: (active: boolean) => void;
  disabled?: boolean;
};

const StatusField = ({
  label,
  active,
  onValueChange,
  disabled = false,
}: StatusFieldProps) => (
  <Field>
    <FieldLabel>{label}</FieldLabel>

    <Select
      value={String(active)}
      onValueChange={(value) =>
        onValueChange(value === "true")
      }
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue>
          {active ? "Aktif" : "Nonaktif"}
        </SelectValue>
      </SelectTrigger>

      <SelectContent
        align="start"
        alignItemWithTrigger={false}
      >
        <SelectItem value="true">Aktif</SelectItem>
        <SelectItem value="false">Nonaktif</SelectItem>
      </SelectContent>
    </Select>
  </Field>
);

const EditMasterAgen = ({
  open,
  onClose,
  agent,
  onSubmit,
  submitting = false,
}: EditMasterProps) => {
  const [form, setForm] = useState<AgentForm>({
    ...initialForm,
  });

  const [branches, setBranches] = useState<BranchForm[]>([]);
  const [validationErrors, setValidationErrors] =
    useState<ValidationErrors>({});

  const {
    provinces,
    loading: provincesLoading,
    error: provincesError,
  } = useProvinces();

  // Memuat ulang nilai form dari API setiap kali modal dibuka.
  useEffect(() => {
    if (!open || !agent) return;

    setForm({
      code: agent.code ?? "",
      name: agent.name ?? "",
      association_name: agent.association_name ?? "",
      type: agent.type ?? "",
      company_name: agent.company_name ?? "",
      contact_person: agent.contact_person ?? "",
      phone: agent.phone ?? "",
      address: agent.address ?? "",

      province_name:
        agent.province?.name ?? agent.province_name ?? "",
      city_name:
        agent.city?.name ?? agent.city_name ?? "",

      website: agent.website ?? "",
      logo: agent.logo_url ?? "",
      is_active: agent.is_active ?? true,
    });

    setBranches(
      (agent.branches ?? []).map((branch) => {
        const item = branch as typeof branch & {
          province?: Province | null;
          city?: City | null;
        };

        return {
          id: item.id,
          name: item.name ?? "",
          province_name:
            item.province?.name ??
            item.province_name ??
            "",
          city_name:
            item.city?.name ??
            item.city_name ??
            "",
          code: item.code ?? "",
          contact_person: item.contact_person ?? "",
          phone: item.phone ?? "",
          address: item.address ?? "",
          is_active: item.is_active ?? true,
        };
      }),
    );

    setValidationErrors({});
  }, [open, agent]);

  const getError = (field: string) =>
    validationErrors[field];

  const clearError = (field: string) => {
    setValidationErrors((previous) => {
      if (!(field in previous)) return previous;

      const next = { ...previous };
      delete next[field];

      return next;
    });
  };

  const handleChange = (
    field: AgentTextField,
    value: string,
  ) => {
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
          ? { ...branch, [field]: value }
          : branch,
      ),
    );

    clearError(`branches.${index}.${field}`);
  };

  const handleAgentProvinceChange = useCallback(
    (name: string) => {
      setForm((previous) => {
        if (previous.province_name === name) {
          return previous;
        }

        return {
          ...previous,
          province_name: name,
          city_name: "",
        };
      });

      clearError("province_name");
      clearError("city_name");
    },
    [],
  );

  const handleAgentCityChange = useCallback(
    (name: string) => {
      setForm((previous) => ({
        ...previous,
        city_name: name,
      }));

      clearError("city_name");
    },
    [],
  );

  const handleBranchProvinceChange = useCallback(
    (index: number, name: string) => {
      setBranches((previous) =>
        previous.map((branch, branchIndex) => {
          if (branchIndex !== index) return branch;

          if (branch.province_name === name) return branch;

          return {
            ...branch,
            province_name: name,
            city_name: "",
          };
        }),
      );

      clearError(`branches.${index}.province_name`);
      clearError(`branches.${index}.city_name`);
    },
    [],
  );

  const handleBranchCityChange = useCallback(
    (index: number, name: string) => {
      setBranches((previous) =>
        previous.map((branch, branchIndex) =>
          branchIndex === index
            ? {
                ...branch,
                city_name: name,
              }
            : branch,
        ),
      );

      clearError(`branches.${index}.city_name`);
    },
    [],
  );

  const handleAddBranch = () => {
    setBranches((previous) => [
      { ...initialBranch },
      ...previous,
    ]);

    clearError("branches");
  };

  const handleRemoveBranch = (index: number) => {
    setBranches((previous) =>
      previous.filter(
        (_, branchIndex) => branchIndex !== index,
      ),
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
          next[`branches.${oldIndex - 1}.${field}`] =
            message;
        }
      });

      return next;
    });
  };

  const handleSubmit = async () => {
    if (submitting || !agent) return;

    const payload = {
      ...form,
      branches: branches.map((branch) => ({
        ...branch,
        is_active: branch.is_active,
      })),
    };

    const result =
      createMasterAgentSchema.safeParse(payload);

    if (!result.success) {
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

    setValidationErrors({});

    const validatedPayload: EditMasterAgentPayload = {
      ...result.data,
      province_name: form.province_name,
      city_name: form.city_name,
      branches: result.data.branches.map((branch, index) => ({
        ...branch,
        province_name: branches[index]?.province_name ?? "",
        city_name: branches[index]?.city_name ?? "",
        ...(branches[index]?.id !== undefined
          ? { id: branches[index].id }
          : {}),
      })),
    };

    try {
      await onSubmit(agent.id, validatedPayload);
    } catch (error) {
      console.error("[Master Agen] Update gagal:", error);
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Edit Master Agen"
      icon={<Building2 size={18} />}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="destructive"
            onClick={onClose}
            disabled={submitting}
          >
            Batal
          </Button>

          <Button
            type="button"
            variant="primer"
            onClick={() => void handleSubmit()}
            disabled={submitting || !agent}
          >
            <FaSave size={14} />
            {submitting
              ? "Menyimpan..."
              : "Simpan Perubahan"}
          </Button>
        </div>
      }
    >
      <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
        <AppModal.Section
          title="Informasi Agen"
          icon={<Building2 size={18} />}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                <p className="text-sm text-red-500">
                  {getError("name")}
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel>Nama Asosiasi</FieldLabel>
              <Input
                value={form.association_name}
                onChange={(event) =>
                  handleChange(
                    "association_name",
                    event.target.value,
                  )
                }
                placeholder="Contoh: ASITA"
              />
              {getError("association_name") && (
                <p className="text-sm text-red-500">
                  {getError("association_name")}
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel>Nama PIC</FieldLabel>
              <Input
                value={form.contact_person}
                onChange={(event) =>
                  handleChange(
                    "contact_person",
                    event.target.value,
                  )
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
                <p className="text-sm text-red-500">
                  {getError("phone")}
                </p>
              )}
            </Field>

            <StatusField
              label="Status Agen"
              active={form.is_active}
              onValueChange={(active) =>
                setForm((previous) => ({
                  ...previous,
                  is_active: active,
                }))
              }
              disabled={submitting}
            />

            <ProvinceCityFields
              provinces={provinces}
              provinceName={form.province_name}
              cityName={form.city_name}
              onProvinceChange={handleAgentProvinceChange}
              onCityChange={handleAgentCityChange}
              provinceLoading={provincesLoading}
              provinceError={provincesError}
              provinceValidationError={getError("province_name")}
              cityValidationError={getError("city_name")}
            />
          </div>
        </AppModal.Section>

        <AppModal.Section
          title="Cabang Agen"
          icon={<GitBranch size={18} />}
          headerAction={
            <Button
              type="button"
              variant="blue"
              onClick={handleAddBranch}
              disabled={submitting}
              className="shrink-0 whitespace-nowrap"
            >
              <FaPlus size={13} />
              Tambah Cabang
            </Button>
          }
        >
          {getError("branches") && (
            <p className="mb-3 text-sm text-red-500">
              {getError("branches")}
            </p>
          )}

          <div className="space-y-4">
            {branches.map((branch, index) => (
              <div
                key={branch.id ?? `new-${index}`}
                className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-medium">
                    Cabang {index + 1}
                  </h3>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleRemoveBranch(index)}
                    disabled={submitting}
                  >
                    <FaTrash size={12} />
                    Hapus
                  </Button>
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
                    {getError(
                      `branches.${index}.contact_person`,
                    ) && (
                      <p className="text-sm text-red-500">
                        {getError(
                          `branches.${index}.contact_person`,
                        )}
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

                  <StatusField
                    label={`Status Cabang ${index + 1}`}
                    active={branch.is_active}
                    onValueChange={(active) =>
                      setBranches((previous) =>
                        previous.map((item, branchIndex) =>
                          branchIndex === index
                            ? { ...item, is_active: active }
                            : item,
                        ),
                      )
                    }
                    disabled={submitting}
                  />

                  <ProvinceCityFields
                    provinces={provinces}
                    provinceName={branch.province_name}
                    cityName={branch.city_name}
                    onProvinceChange={(name) =>
                      handleBranchProvinceChange(
                        index,
                        name,
                      )
                    }
                    onCityChange={(name) =>
                      handleBranchCityChange(
                        index,
                        name,
                      )
                    }
                    provinceLoading={provincesLoading}
                    provinceError={provincesError}
                    provinceValidationError={getError(
                      `branches.${index}.province_name`,
                    )}
                    cityValidationError={getError(
                      `branches.${index}.city_name`,
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </AppModal.Section>
      </div>
    </AppModal>
  );
};

export default EditMasterAgen;