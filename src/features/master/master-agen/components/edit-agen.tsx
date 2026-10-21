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
import type { Province } from "@/features/wilayah/types/wilayah";

import { useEffect, useState } from "react";
import { FaSave, FaPlus, FaTrash } from "react-icons/fa";
import { Building2, GitBranch } from "lucide-react";

import { createMasterAgentSchema } from "../schemas/master-agen-schema";
import type {
  AgentDetail,
  CreateMasterAgentPayload,
  CreateMasterAgentBranchPayload,
} from "../types/master-agen";

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

type EditMasterAgentBranchPayload =
  CreateMasterAgentBranchPayload & {
    id?: number;
  };

type EditMasterAgentPayload = Omit<
  CreateMasterAgentPayload,
  "branches"
> & {
  branches: EditMasterAgentBranchPayload[];
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

type BranchForm = Omit<
  EditMasterAgentBranchPayload,
  "is_active" | "province_id" | "city_id"
> & {
  province_id: number | null;
  city_id: number | null;
  is_active: boolean;
};

type AgentForm = Omit<
  CreateMasterAgentPayload,
  | "branches"
  | "is_active"
  | "province_id"
  | "city_id"
> & {
  province_id: number | null;
  city_id: number | null;
  is_active: boolean;
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
  province_id: null,
  city_id: null,
  website: "",
  logo: "",
  is_active: true,
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
  const [openProvince, setOpenProvince] = useState(false);
  const [openCity, setOpenCity] = useState(false);

  const [searchProvince, setSearchProvince] = useState("");
  const [searchCity, setSearchCity] = useState("");

  const {
    cities,
    loading: citiesLoading,
    error: citiesError,
  } = useCities(provinceId);

  const selectedProvince = provinces.find(
    (province) => province.id === provinceId,
  );

  const selectedCity = cities.find(
    (city) => city.id === cityId,
  );

  const filteredProvinces = provinces.filter((province) =>
    province.name
      .toLowerCase()
      .includes(searchProvince.toLowerCase().trim()),
  );

  const filteredCities = cities.filter((city) =>
    city.name
      .toLowerCase()
      .includes(searchCity.toLowerCase().trim()),
  );

  const handleProvinceChange = (id: number | null) => {
    if (id !== provinceId) {
      onProvinceChange(id);
      onCityChange(null);
    }

    setSearchProvince("");
    setSearchCity("");
    setOpenProvince(false);
    setOpenCity(false);
  };

  const handleCityChange = (id: number | null) => {
    onCityChange(id);
    setSearchCity("");
    setOpenCity(false);
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
          selectedLabel={selectedProvince?.name ?? null}
          selectedKey={
            provinceId !== null ? String(provinceId) : null
          }
          items={filteredProvinces}
          getKey={(province) => String(province.id)}
          renderItem={(province) => province.name}
          onSelect={(province) =>
            handleProvinceChange(province.id)
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

        <SearchablePopover
          open={openCity}
          onOpenChange={setOpenCity}
          search={searchCity}
          onSearchChange={setSearchCity}
          placeholder={
            provinceId === null
              ? "Pilih provinsi terlebih dahulu"
              : citiesLoading
                ? "Memuat kota..."
                : "Pilih kota/kabupaten"
          }
          selectedLabel={selectedCity?.name ?? null}
          selectedKey={
            cityId !== null ? String(cityId) : null
          }
          items={filteredCities}
          getKey={(city) => String(city.id)}
          renderItem={(city) => city.name}
          onSelect={(city) => handleCityChange(city.id)}
          disabled={
            provinceId === null ||
            citiesLoading ||
            provinceLoading
          }
          emptyText={
            citiesError
              ? "Kota gagal dimuat."
              : "Kota/kabupaten tidak ditemukan."
          }
          debounceDelay={500}
        />

        {citiesError && (
          <p className="text-sm text-red-500">
            {citiesError}
          </p>
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
}: StatusFieldProps) => {
  return (
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
};

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

  useEffect(() => {
    if (!open || !agent) return;

    setForm({
      code: agent.code ?? "",
      name: agent.name ?? "",
      association_name: agent.association_name ?? "",
      type: agent.type ?? "",
      company_name: "",
      contact_person: agent.contact_person ?? "",
      phone: agent.phone ?? "",
      address: agent.address ?? "",
      province_id:
        agent.province?.id ?? agent.province_id ?? null,
      city_id:
        agent.city?.id ?? agent.city_id ?? null,
      website: agent.website ?? "",
      logo: agent.logo_url ?? "",
      is_active: agent.is_active ?? true,
    });

    setBranches(
      (agent.branches ?? []).map((branch) => ({
        id: branch.id,
        name: branch.name ?? "",
        province_id: branch.province?.id ?? null,
        city_id: branch.city?.id ?? null,
        code: branch.code ?? "",
        contact_person: branch.contact_person ?? "",
        phone: branch.phone ?? "",
        address: branch.address ?? "",
        is_active: branch.is_active ?? true,
      })),
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

  const handleAgentProvinceChange = (
    id: number | null,
  ) => {
    setForm((previous) => ({
      ...previous,
      province_id: id,
      city_id: null,
    }));

    clearError("province_id");
    clearError("city_id");
  };

  const handleAgentCityChange = (
    id: number | null,
  ) => {
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
          ? { ...branch, city_id: id }
          : branch,
      ),
    );

    clearError(`branches.${index}.city_id`);
  };

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

        const match = key.match(
          /^branches\.(\d+)\.(.+)$/,
        );

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
      branches: result.data.branches.map(
        (branch, index) => ({
          ...branch,
          ...(branches[index]?.id !== undefined
            ? { id: branches[index].id }
            : {}),
        }),
      ),
    };

    try {
      await onSubmit(agent.id, validatedPayload);
    } catch (error) {
      console.error(
        "[Master Agen] Update gagal:",
        error,
      );
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
        {/* INFORMASI AGEN */}
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
              provinceId={form.province_id}
              cityId={form.city_id}
              onProvinceChange={
                handleAgentProvinceChange
              }
              onCityChange={handleAgentCityChange}
              provinceLoading={provincesLoading}
              provinceError={provincesError}
              provinceValidationError={getError(
                "province_id",
              )}
              cityValidationError={getError("city_id")}
            />
          </div>
        </AppModal.Section>

        {/* CABANG AGEN */}
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
                    onClick={() =>
                      handleRemoveBranch(index)
                    }
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
                    {getError(
                      `branches.${index}.name`,
                    ) && (
                        <p className="text-sm text-red-500">
                          {getError(
                            `branches.${index}.name`,
                          )}
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
                    {getError(
                      `branches.${index}.phone`,
                    ) && (
                        <p className="text-sm text-red-500">
                          {getError(
                            `branches.${index}.phone`,
                          )}
                        </p>
                      )}
                  </Field>

                  <StatusField
                    label={`Status Cabang ${index + 1}`}
                    active={branch.is_active}
                    onValueChange={(active) =>
                      setBranches((previous) =>
                        previous.map(
                          (item, branchIndex) =>
                            branchIndex === index
                              ? {
                                ...item,
                                is_active: active,
                              }
                              : item,
                        ),
                      )
                    }
                    disabled={submitting}
                  />

                  <ProvinceCityFields
                    provinces={provinces}
                    provinceId={branch.province_id}
                    cityId={branch.city_id}
                    onProvinceChange={(id) =>
                      handleBranchProvinceChange(
                        index,
                        id,
                      )
                    }
                    onCityChange={(id) =>
                      handleBranchCityChange(
                        index,
                        id,
                      )
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
