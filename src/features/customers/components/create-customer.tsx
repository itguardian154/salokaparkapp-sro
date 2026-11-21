import AppModal from "@/components/base-modal";
import SearchablePopover from "@/components/searchable-popover";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import CustomerSuggestionField from "@/features/invoice/components/customer-suggestion-field";
import { customerGroupNumberOptions } from "../utils/customer-group-number-options";

import { useProvinces } from "@/features/wilayah/hooks/use-provinces";
import { useCities } from "@/features/wilayah/hooks/use-cities";
import type { Province, City } from "@/features/wilayah/types/wilayah";

import { useSegments } from "@/features/master/master-segment/hooks/use-master-segment";
import { useSegmentDetails } from "@/features/master/master-segment/hooks/use-master-segment-detail";
import type { Segment } from "@/features/master/master-segment/types/master-segment";

import { useEffect, useState } from "react";
import { FaSave } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";

import type { CreateCustomerPayload } from "../types/customer";
import {
  createCustomerFormSchema,
  type CreateCustomerFormValues,
} from "../schemas/customer-schema";

type ValidationErrors = Partial<Record<keyof CreateCustomerFormValues, string>>;

type CustomerFormData = {
  name: string;
  email: string;
  contact_person: string;
  phone: string;
  segment_id: string;
  segment_detail_id: string;
  sub_segment_detail_id: string;
  segment_option_id: string;
  group_number: string;
  province_id: string;
  city_id: string;
};

type CreateCustomerProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCustomerPayload) => Promise<void>;
  submitting?: boolean;
  submitError?: string | null;
};

type ProvinceCityFieldsProps = {
  provinces: Province[];
  provinceId: number | null;
  cityId: number | null;
  onProvinceChange: (id: number | null) => void;
  onCityChange: (id: number | null, name: string) => void;
  provinceLoading: boolean;
  provinceError: string | null;
  provinceValidationError?: string;
  cityValidationError?: string;
};

type SegmentOption = {
  id: number;
  name: string;
  is_active: boolean;
};

type CustomerGroupNumberOption = {
    value: string;
    label: string;
};

type SegmentFieldsProps = {
  segments: Segment[];
  segmentsLoading: boolean;
  segmentsError: string | null;
  segmentId: number | null;
  segmentDetailId: number | null;
  subSegmentDetailId: number | null;
  segmentOptionId: number | null;
  groupNumber: string;
  name: string;
  onSegmentChange: (id: number | null) => void;
  onSegmentDetailChange: (id: number | null, isNonFormal?: boolean) => void;
  onSubSegmentDetailChange: (id: number | null) => void;
  onSegmentOptionChange: (id: number | null) => void;
  onGroupNumberChange: (number: string) => void;
  onNameChange: (name: string) => void;
  segmentValidationError?: string;
  segmentDetailValidationError?: string;
  subSegmentDetailValidationError?: string;
  segmentOptionValidationError?: string;
  groupNumberValidationError?: string;
  nameValidationError?: string;
};

const initialFormData: CustomerFormData = {
  name: "",
  email: "",
  contact_person: "",
  phone: "",
  segment_id: "",
  segment_detail_id: "",
  sub_segment_detail_id: "",
  segment_option_id: "",
  group_number: "",
  province_id: "",
  city_id: "",
};

/* =========================
   FIELD SEGMENT & SEGMENT DETAIL
========================= */

const SegmentFields = (props: SegmentFieldsProps) => {
  const {
    segmentsLoading,
    segmentsError,
    segmentId,
    segmentDetailId,
    subSegmentDetailId,
    segmentOptionId,
    groupNumber,
    name,
    onSegmentChange,
    onSegmentDetailChange,
    onSubSegmentDetailChange,
    onSegmentOptionChange,
    onGroupNumberChange,
    onNameChange,
    segmentValidationError,
    segmentDetailValidationError,
    subSegmentDetailValidationError,
    segmentOptionValidationError,
    groupNumberValidationError,
    nameValidationError,
  } = props;
  const segments = props.segments ?? [];
  const [openSegment, setOpenSegment] = useState(false);
  const [openSegmentDetail, setOpenSegmentDetail] = useState(false);
  const [openSubDetail, setOpenSubDetail] = useState(false);
  const [openOption, setOpenOption] = useState(false);
  const [searchSegment, setSearchSegment] = useState("");
  const [searchSegmentDetail, setSearchSegmentDetail] = useState("");
  const [searchSubDetail, setSearchSubDetail] = useState("");
  const [searchOption, setSearchOption] = useState("");
  const [customNameParts, setCustomNameParts] = useState<string[]>([]);
  const [namePartInput, setNamePartInput] = useState("");
  const [nameTagOrder, setNameTagOrder] = useState<string[]>([]);
    const [searchGroupNumber, setSearchGroupNumber] = useState("");
    const [openGroupNumber, setOpenGroupNumber] = useState(false);

  useEffect(() => {
    if (segmentId === null) {
      setCustomNameParts([]);
      setNamePartInput("");
    }
  }, [segmentId]);

  const {
    segmentDetails,
    loading: segmentDetailsLoading,
    error: segmentDetailsError,
  } = useSegmentDetails(segmentId);

  const activeSegments = (segments ?? []).filter((item) => item.is_active);

  const activeSegmentDetails = (segmentDetails ?? []).filter(
    (item) => item.is_active,
  );

  const filteredSegments = activeSegments.filter((item) =>
    item.name.toLowerCase().includes(searchSegment.toLowerCase().trim()),
  );

  const filteredSegmentDetails = activeSegmentDetails.filter((item) =>
    (item.name ?? "")
      .toLowerCase()
      .includes(searchSegmentDetail.toLowerCase().trim()),
  );

  const selectedSegment = activeSegments.find((item) => item.id === segmentId);

  const selectedSegmentDetail = activeSegmentDetails.find(
    (item) => item.id === segmentDetailId,
  );
  const selectedSubDetails = (selectedSegmentDetail?.sub_details ?? []).filter(
    (item) => item.is_active && item.name,
  );
  const selectedSubDetail = selectedSubDetails.find(
    (item) => item.id === subSegmentDetailId,
  );
  const activeOptions = (selectedSubDetail?.options ?? []).filter(
    (item) => item.is_active && item.name,
  );
  const selectedOption = activeOptions.find(
    (item) => item.id === segmentOptionId,
  );
  const segmentName = selectedSegment?.name.toLowerCase() ?? "";
  const isEducation = segmentName.includes("edukasi");
  const isCorporate = segmentName.includes("corporate");
  const isStructuredName = isEducation;
  const isNonFormal = (selectedSegmentDetail?.name ?? "")
    .toLowerCase()
    .replace(/[\s-]/g, "")
    .includes("nonformal");
  const isEducationNameReady = Boolean(
    segmentDetailId &&
      subSegmentDetailId &&
      (isNonFormal || (segmentOptionId && groupNumber)),
  );
  const composeName = (
    parts: (string | null | undefined)[],
    customParts = customNameParts,
  ) => {
    const structuredIds = ["jenjang", "status", "nomor"];
    const entries = [
      ...parts.map((label, index) => ({
        id: structuredIds[index] ?? `structured-${index}`,
        label:
          index === 1 && label?.trim().toLowerCase().startsWith("swast")
            ? undefined
            : label,
      })),
      ...customParts.map((label, index) => ({
        id: `custom-${index}`,
        label,
      })),
    ].filter((entry): entry is { id: string; label: string } =>
      Boolean(entry.label?.trim()),
    );
    const defaultOrder = [
      ...structuredIds,
      ...customParts.map((_, index) => `custom-${index}`),
    ];

    return entries
      .sort((left, right) => {
        const leftIndex = nameTagOrder.indexOf(left.id);
        const rightIndex = nameTagOrder.indexOf(right.id);
        return (
          (leftIndex < 0 ? defaultOrder.indexOf(left.id) : leftIndex) -
          (rightIndex < 0 ? defaultOrder.indexOf(right.id) : rightIndex)
        );
      })
      .map((entry) => entry.label)
      .join(" ");
  };
  const nameTagItems = [
    selectedSubDetail?.name
      ? {
          id: "jenjang",
          label: selectedSubDetail.name,
          onRemove: () => {
            onSubSegmentDetailChange(null);
            onSegmentOptionChange(null);
            onGroupNumberChange("");
            onNameChange(composeName([]));
          },
        }
      : null,
    isEducation &&
    !isNonFormal &&
    selectedOption?.name &&
    !selectedOption.name.trim().toLowerCase().startsWith("swast")
      ? {
          id: "status",
          label: selectedOption.name,
          onRemove: () => {
            onSegmentOptionChange(null);
            onNameChange(
              composeName([selectedSubDetail?.name, undefined, groupNumber]),
            );
          },
        }
      : null,
    !isNonFormal &&
    groupNumber
      ? {
          id: "nomor",
          label: groupNumber,
          onRemove: () => {
            onGroupNumberChange("");
            onNameChange(
              composeName([
                selectedSubDetail?.name,
                selectedOption?.name,
                "",
              ]),
            );
          },
        }
      : null,
    ...customNameParts.map((part, index) => ({
      id: `custom-${index}`,
      label: part,
      onRemove: () => {
        const nextParts = customNameParts.filter(
          (_, partIndex) => partIndex !== index,
        );
        setCustomNameParts(nextParts);
        onNameChange(
          composeName(
            [
              selectedSubDetail?.name,
              selectedOption?.name,
              groupNumber,
            ],
            nextParts,
          ),
        );
      },
    })),
  ].filter((tag): tag is NonNullable<typeof tag> => Boolean(tag));
  const defaultNameTagOrder = nameTagItems.map((tag) => tag.id);
  const orderedNameTagItems = [...nameTagItems].sort((left, right) => {
    const leftIndex = nameTagOrder.indexOf(left.id);
    const rightIndex = nameTagOrder.indexOf(right.id);
    return (
      (leftIndex < 0 ? defaultNameTagOrder.indexOf(left.id) : leftIndex) -
      (rightIndex < 0 ? defaultNameTagOrder.indexOf(right.id) : rightIndex)
    );
  });

  const handleSegmentChange = (id: number | null) => {
    if (id !== segmentId) {
      onSegmentChange(id);
      onSegmentDetailChange(null);
      onSubSegmentDetailChange(null);
      onSegmentOptionChange(null);
      onNameChange("");
      setCustomNameParts([]);
      setNamePartInput("");
      setNameTagOrder([]);
      onGroupNumberChange("");
    }

    setSearchSegment("");
    setSearchSegmentDetail("");
    setOpenSegment(false);
    setOpenSegmentDetail(false);
    setOpenSubDetail(false);
    setOpenOption(false);
  };

  const handleSegmentDetailChange = (id: number | null) => {
    const detail = activeSegmentDetails.find((item) => item.id === id);
    onSegmentDetailChange(
      id,
      (detail?.name ?? "")
        .toLowerCase()
        .replace(/[\s-]/g, "")
        .includes("nonformal"),
    );
    onSubSegmentDetailChange(null);
    onSegmentOptionChange(null);
    setCustomNameParts([]);
    setNamePartInput("");
    setNameTagOrder([]);
    onGroupNumberChange("");
    if (isEducation) onNameChange("");
    setSearchSegmentDetail("");
    setOpenSegmentDetail(false);
  };

  const addNamePart = (inputValue = namePartInput) => {
    const value = inputValue.trim();
    if (!value) return;
    const nextParts = [...customNameParts, value];
    setCustomNameParts(nextParts);
    onNameChange(
      composeName(
        [selectedSubDetail?.name, selectedOption?.name, groupNumber],
        nextParts,
      ),
    );
    setNamePartInput("");
  };

  return (
    <>
      <Field>
        <FieldLabel>Segment <span className="text-xs text-red-500">*</span></FieldLabel>

        <SearchablePopover<SegmentOption>
          open={openSegment}
          onOpenChange={setOpenSegment}
          search={searchSegment}
          onSearchChange={setSearchSegment}
          placeholder={segmentsLoading ? "Memuat segment..." : "Pilih segment"}
          selectedLabel={selectedSegment?.name ?? null}
          selectedKey={segmentId !== null ? String(segmentId) : null}
          items={filteredSegments}
          getKey={(item) => String(item.id)}
          renderItem={(item) => item.name}
          onSelect={(item) => handleSegmentChange(item.id)}
          disabled={segmentsLoading}
          emptyText={
            segmentsError ? "Segment gagal dimuat." : "Segment tidak ditemukan."
          }
          debounceDelay={500}
        />

        {segmentsError && (
          <p className="text-sm text-red-500">{segmentsError}</p>
        )}

        {segmentValidationError && (
          <p role="alert" className="text-sm text-red-500">
            {segmentValidationError}
          </p>
        )}
      </Field>
      {(isEducation || isCorporate) && (
        <>
          <Field>
            <FieldLabel>
              {isEducation
                ? "Jenis"
                : isCorporate
                  ? "Bidang Usaha"
                : "Bidang Usaha"} <span className="text-xs text-red-500">*</span>
            </FieldLabel>

            <SearchablePopover
              open={openSegmentDetail}
              onOpenChange={setOpenSegmentDetail}
              search={searchSegmentDetail}
              onSearchChange={setSearchSegmentDetail}
              placeholder={
                segmentId === null
                  ? "Pilih segment terlebih dahulu"
                  : segmentDetailsLoading
                    ? "Memuat segment detail..."
                    : "Pilih segment detail"
              }
              selectedLabel={selectedSegmentDetail?.name ?? null}
              selectedKey={
                segmentDetailId !== null ? String(segmentDetailId) : null
              }
              items={filteredSegmentDetails}
              getKey={(item) => String(item.id)}
              renderItem={(item) => item.name}
              onSelect={(item) => handleSegmentDetailChange(item.id)}
              disabled={segmentId === null || segmentDetailsLoading}
              emptyText={
                segmentDetailsError
                  ? "Segment detail gagal dimuat."
                  : "Segment detail tidak ditemukan."
              }
              debounceDelay={500}
            />

            {segmentDetailsError && (
              <p className="text-sm text-red-500">{segmentDetailsError}</p>
            )}

            {segmentDetailValidationError && (
              <p role="alert" className="text-sm text-red-500">
                {segmentDetailValidationError}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel>{isEducation ? "Jenjang" : "Jenis Usaha"} <span className="text-xs text-red-500">*</span></FieldLabel>
            <SearchablePopover
              open={openSubDetail}
              onOpenChange={setOpenSubDetail}
              search={searchSubDetail}
              onSearchChange={setSearchSubDetail}
              placeholder={
                !segmentDetailId
                  ? `Pilih ${isEducation ? "jenis" : "bidang usaha"} terlebih dahulu`
                  : "Pilih jenjang/jenis usaha"
              }
              selectedLabel={selectedSubDetail?.name ?? null}
              selectedKey={
                subSegmentDetailId !== null ? String(subSegmentDetailId) : null
              }
              items={selectedSubDetails.filter((item) =>
                (item.name ?? "")
                  .toLowerCase()
                  .includes(searchSubDetail.toLowerCase().trim()),
              )}
              getKey={(item) => String(item.id)}
              renderItem={(item) => item.name ?? ""}
              onSelect={(item) => {
                onSubSegmentDetailChange(item.id);
                onSegmentOptionChange(null);
                if (isEducation) {
                  onNameChange(composeName([item.name, undefined, groupNumber]));
                }
                setSearchSubDetail("");
                setOpenSubDetail(false);
              }}
              disabled={!segmentDetailId}
              emptyText="Pilihan tidak ditemukan."
              debounceDelay={0}
            />
            {subSegmentDetailValidationError && (
              <p role="alert" className="text-sm text-red-500">
                {subSegmentDetailValidationError}
              </p>
            )}
          </Field>
        </>
      )}

      {isEducation && !isNonFormal && (
        <Field>
          <FieldLabel>
            Status{" "}
            {!isNonFormal && <span className="text-xs text-red-500">*</span>}
          </FieldLabel>
          <SearchablePopover
            open={openOption}
            onOpenChange={setOpenOption}
            search={searchOption}
            onSearchChange={setSearchOption}
            placeholder={
              !subSegmentDetailId
                ? "Pilih jenjang terlebih dahulu"
                : "Pilih status"
            }
            selectedLabel={selectedOption?.name ?? null}
            selectedKey={
              segmentOptionId !== null ? String(segmentOptionId) : null
            }
            items={activeOptions.filter((item) =>
              (item.name ?? "")
                .toLowerCase()
                .includes(searchOption.toLowerCase().trim()),
            )}
            getKey={(item) => String(item.id)}
            renderItem={(item) => item.name ?? ""}
            onSelect={(item) => {
              onSegmentOptionChange(item.id);
              onNameChange(
                composeName([
                  selectedSubDetail?.name,
                  item.name,
                  groupNumber,
                ]),
              );
              setSearchOption("");
              setOpenOption(false);
            }}
            disabled={!subSegmentDetailId}
            emptyText="Status tidak ditemukan."
            debounceDelay={0}
          />
          {segmentOptionValidationError && (
            <p role="alert" className="text-sm text-red-500">
              {segmentOptionValidationError}
            </p>
          )}
        </Field>
      )}

      {isEducation && !isNonFormal && (
        <Field>
          <FieldLabel>
            Nomor {!isNonFormal && <span className="text-xs text-red-500">*</span>}
          </FieldLabel>
          <SearchablePopover<CustomerGroupNumberOption>
            open={openGroupNumber}
            onOpenChange={setOpenGroupNumber}
            search={searchGroupNumber}
            onSearchChange={setSearchGroupNumber}
            placeholder="Pilih nomor"
            selectedLabel={
              customerGroupNumberOptions.find(
                (option) => option.value === groupNumber,
              )?.label ?? null
            }
            selectedKey={groupNumber || null}
            items={customerGroupNumberOptions.filter((option) =>
              option.label.includes(searchGroupNumber.trim()),
            )}
            getKey={(option) => option.value}
            renderItem={(option) => option.label}
            onSelect={(option) => {
              onGroupNumberChange(option.value);
              onNameChange(
                composeName([
                  selectedSubDetail?.name,
                  selectedOption?.name,
                  option.value,
                ]),
              );
              setSearchGroupNumber("");
              setOpenGroupNumber(false);
            }}
            disabled={
              !segmentDetailId ||
              !subSegmentDetailId ||
              (!isNonFormal && !segmentOptionId)
            }
            emptyText="Nomor tidak ditemukan."
            debounceDelay={0}
          />
          {groupNumberValidationError && (
            <p role="alert" className="text-sm text-red-500">
              {groupNumberValidationError}
            </p>
          )}
        </Field>
      )}

      <Field className="md:col-span-2">
        <FieldLabel>Nama Customer <span className="text-xs text-red-500">*</span></FieldLabel>
        {isStructuredName ? (
          <CustomerSuggestionField
            value={namePartInput}
            tags={orderedNameTagItems}
            onAddTextTag={addNamePart}
            onSelect={() => undefined}
            manualEntry={false}
            searchEnabled={false}
            inputDisabled={!isEducationNameReady}
            placeholder="Ketik nama tambahan lalu tekan Enter"
            onPlainTextChange={setNamePartInput}
            onReorderTags={(ids) => {
              setNameTagOrder(ids);
              onNameChange(
                ids
                  .map((id) => nameTagItems.find((tag) => tag.id === id)?.label)
                  .filter((label): label is string => Boolean(label))
                  .join(" "),
              );
            }}
          />
        ) : (
          <CustomerSuggestionField
            value={name}
            tags={[]}
            onAddTextTag={() => undefined}
            onSelect={() => undefined}
            manualEntry
            searchEnabled={false}
            placeholder="Masukkan nama customer"
            onPlainTextChange={onNameChange}
          />
        )}
        {nameValidationError && (
          <p role="alert" className="text-sm text-red-500">
            {nameValidationError}
          </p>
        )}
      </Field>
    </>
  );
};

/* =========================
   FIELD PROVINSI & KOTA
========================= */

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

  const { cities, loading: citiesLoading } = useCities(provinceId);

  const selectedProvince = provinces.find(
    (province) => province.id === provinceId,
  );

  const selectedCity = cities.find((city) => city.id === cityId);

  const filteredProvinces = provinces.filter((province) =>
    province.name.toLowerCase().includes(searchProvince.toLowerCase().trim()),
  );

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(searchCity.toLowerCase().trim()),
  );

  const handleProvinceChange = (id: number | null) => {
    onProvinceChange(id);
    onCityChange(null, "");

    setSearchProvince("");
    setSearchCity("");
    setOpenProvince(false);
    setOpenCity(false);
  };

  const handleCityChange = (id: number | null, name: string) => {
    onCityChange(id, name);
    setSearchCity("");
    setOpenCity(false);
  };

  return (
    <>
      <Field>
        <FieldLabel>Provinsi <span className="text-xs text-red-500">*</span></FieldLabel>

        <SearchablePopover<Province>
          open={openProvince}
          onOpenChange={setOpenProvince}
          search={searchProvince}
          onSearchChange={setSearchProvince}
          placeholder={
            provinceLoading ? "Memuat provinsi..." : "Pilih provinsi"
          }
          selectedLabel={selectedProvince?.name ?? null}
          selectedKey={provinceId !== null ? String(provinceId) : null}
          items={filteredProvinces}
          getKey={(province) => String(province.id)}
          renderItem={(province) => province.name}
          onSelect={(province) => handleProvinceChange(province.id)}
          disabled={provinceLoading}
          emptyText={
            provinceError
              ? "Provinsi gagal dimuat."
              : "Provinsi tidak ditemukan."
          }
          debounceDelay={500}
        />

        {provinceError && (
          <p className="text-sm text-red-500">{provinceError}</p>
        )}

        {provinceValidationError && (
          <p role="alert" className="text-sm text-red-500">
            {provinceValidationError}
          </p>
        )}
      </Field>

      <Field>
        <FieldLabel>Kota/Kabupaten <span className="text-xs text-red-500">*</span> </FieldLabel>
        <SearchablePopover<City>
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
          selectedKey={cityId !== null ? String(cityId) : null}
          items={filteredCities}
          getKey={(city) => String(city.id)}
          renderItem={(city) => city.name}
          onSelect={(city) => handleCityChange(city.id, city.name)}
          disabled={provinceId === null || citiesLoading || provinceLoading}
          emptyText="Kota/kabupaten tidak ditemukan."
          debounceDelay={500}
        />

        {cityValidationError && (
          <p role="alert" className="text-sm text-red-500">
            {cityValidationError}
          </p>
        )}
      </Field>
    </>
  );
};

/* =========================
   CREATE CUSTOMER
========================= */

const CreateCustomer = ({
  open,
  onClose,
  onSubmit,
  submitting = false,
  submitError,
}: CreateCustomerProps) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    ...initialFormData,
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );

  // Nama provinsi dan kota untuk payload API.
  const [provinceName, setProvinceName] = useState("");
  const [cityName, setCityName] = useState("");
  const [isNonFormalEducation, setIsNonFormalEducation] = useState(false);

  const {
    segments: segmentsForValidation,
    loading: segmentsLoading,
    error: segmentsError,
  } = useSegments();
  const selectedSegmentForValidation = segmentsForValidation.find(
    (segment) => String(segment.id) === formData.segment_id,
  );
  const {
    provinces,
    loading: provincesLoading,
    error: provincesError,
  } = useProvinces();

  const clearForm = () => {
    setFormData({ ...initialFormData });
    setValidationErrors({});
    setProvinceName("");
    setCityName("");
    setIsNonFormalEducation(false);
  };

  const handleClose = () => {
    if (submitting) return;

    clearForm();
    onClose();
  };

  const updateField = <K extends keyof CustomerFormData>(
    field: K,
    value: CustomerFormData[K],
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setValidationErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const handleProvinceChange = (id: number | null) => {
    updateField("province_id", id === null ? "" : String(id));

    // Setiap kali provinsi berubah, kota sebelumnya direset.
    updateField("city_id", "");

    const selectedProvince = provinces.find((province) => province.id === id);

    setProvinceName(selectedProvince?.name ?? "");
    setCityName("");
  };

  const handleCityChange = (id: number | null, name: string) => {
    updateField("city_id", id === null ? "" : String(id));

    setCityName(name);
  };

  const handleSegmentChange = (id: number | null) => {
    updateField("segment_id", id === null ? "" : String(id));
    setIsNonFormalEducation(false);

    updateField("segment_detail_id", "");
    updateField("sub_segment_detail_id", "");
    updateField("segment_option_id", "");
    updateField("group_number", "");
    updateField("name", "");
  };

  const handleSegmentDetailChange = (
    id: number | null,
    isNonFormal = false,
  ) => {
    updateField("segment_detail_id", id === null ? "" : String(id));
    setIsNonFormalEducation(id !== null && isNonFormal);
    updateField("sub_segment_detail_id", "");
    updateField("segment_option_id", "");
    updateField("group_number", "");
  };

  const handleSubSegmentDetailChange = (id: number | null) => {
    updateField("sub_segment_detail_id", id === null ? "" : String(id));
    updateField("segment_option_id", "");
  };

  const handleSegmentOptionChange = (id: number | null) => {
    updateField("segment_option_id", id === null ? "" : String(id));
  };

  const getError = (field: keyof CreateCustomerFormValues) =>
    validationErrors[field];

  const handleSubmit = async () => {
    if (submitting) return;

    const segmentNameForValidation =
      selectedSegmentForValidation?.name.toLowerCase() ?? "";
    const validation = createCustomerFormSchema.safeParse({
      name: formData.name,
      email: formData.email,
      contact_person: formData.contact_person,
      phone: formData.phone,
      segment_id: formData.segment_id,
      segment_detail_id: formData.segment_detail_id,
      sub_segment_detail_id: formData.sub_segment_detail_id,
      segment_option_id: formData.segment_option_id,
      group_number: formData.group_number,
      segment_type: segmentNameForValidation.includes("edukasi")
        ? "education"
        : segmentNameForValidation.includes("corporate")
          ? "corporate"
          : segmentNameForValidation.includes("individu")
            ? "individual"
            : "other",
      is_non_formal: isNonFormalEducation,
      province_id: formData.province_id,
      city_id: formData.city_id,
    });

    if (!validation.success) {
      const nextErrors: ValidationErrors = {};

      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof CreateCustomerFormValues;

        nextErrors[field] ??= issue.message;
      });

      console.error("[Customer] Validasi gagal:", validation.error.issues);

      console.table(
        validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      );

      setValidationErrors(nextErrors);
      return;
    }

    if (!provinceName || !cityName) {
      setValidationErrors((current) => ({
        ...current,
        ...(!provinceName ? { province_id: "Provinsi wajib dipilih" } : {}),
        ...(!cityName ? { city_id: "Kota/kabupaten wajib dipilih" } : {}),
      }));

      return;
    }

    setValidationErrors({});

    const payload = {
      name: validation.data.name,
      email: validation.data.email,
      contact_person: validation.data.contact_person,
      phone: validation.data.phone,
      segment_id: Number(validation.data.segment_id),
      ...(validation.data.segment_detail_id && {
        segment_detail_id: Number(validation.data.segment_detail_id),
      }),
      ...(formData.sub_segment_detail_id && {
        sub_segment_detail_id: Number(formData.sub_segment_detail_id),
      }),
      ...(formData.segment_option_id && {
        segment_option_id: Number(formData.segment_option_id),
      }),
      province_name: provinceName,
      city_name: cityName,
    } satisfies CreateCustomerPayload;

    try {
      await onSubmit(payload);
      clearForm();
      onClose();
    } catch (error) {
      console.error("[Customer] Gagal menyimpan customer:", error);
    }
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="Tambah Customer"
      icon={<FaPlus />}
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
            disabled={submitting}
          >
            <FaSave size={14} />
            {submitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      }
    >
      <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
        {submitError && (
          <p role="alert" className="text-sm text-red-500">
            {submitError}
          </p>
        )}

        {/* INFORMASI CUSTOMER */}
        <AppModal.Section title="Customer" showHeader={false}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SegmentFields
              segments={segmentsForValidation}
              segmentsLoading={segmentsLoading}
              segmentsError={segmentsError}
              segmentId={
                formData.segment_id ? Number(formData.segment_id) : null
              }
              segmentDetailId={
                formData.segment_detail_id
                  ? Number(formData.segment_detail_id)
                  : null
              }
              subSegmentDetailId={
                formData.sub_segment_detail_id
                  ? Number(formData.sub_segment_detail_id)
                  : null
              }
              segmentOptionId={
                formData.segment_option_id
                  ? Number(formData.segment_option_id)
                  : null
              }
              groupNumber={formData.group_number}
              name={formData.name}
              onSegmentChange={handleSegmentChange}
              onSegmentDetailChange={handleSegmentDetailChange}
              onSubSegmentDetailChange={handleSubSegmentDetailChange}
              onSegmentOptionChange={handleSegmentOptionChange}
              onGroupNumberChange={(value) => updateField("group_number", value)}
              onNameChange={(value) => updateField("name", value)}
              segmentValidationError={getError("segment_id")}
              segmentDetailValidationError={getError("segment_detail_id")}
              subSegmentDetailValidationError={getError(
                "sub_segment_detail_id",
              )}
              segmentOptionValidationError={getError("segment_option_id")}
              groupNumberValidationError={getError("group_number")}
              nameValidationError={getError("name")}
            />

            <Field>
              <FieldLabel>WhatsApp Customer <span className="text-xs text-red-500">*</span></FieldLabel>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="Contoh: 081234567890"
              />
              {getError("phone") && (
                <p className="text-sm text-red-500">{getError("phone")}</p>
              )}
            </Field>

            <Field>
              <FieldLabel>Email Customer <span className="text-xs text-red-500">*</span></FieldLabel>
              <Input
                type="email"
                value={formData.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="Masukkan email customer"
              />
              {getError("email") && (
                <p className="text-sm text-red-500">{getError("email")}</p>
              )}
            </Field>
            <Field>
              <FieldLabel>Nama PIC <span className="text-xs text-red-500">*</span></FieldLabel>
              <Input
                value={formData.contact_person}
                onChange={(event) =>
                  updateField("contact_person", event.target.value)
                }
                placeholder="Masukkan nama PIC"
              />
              {getError("contact_person") && (
                <p className="text-sm text-red-500">
                  {getError("contact_person")}
                </p>
              )}
            </Field>

            <ProvinceCityFields
              provinces={provinces}
              provinceId={
                formData.province_id ? Number(formData.province_id) : null
              }
              cityId={formData.city_id ? Number(formData.city_id) : null}
              onProvinceChange={handleProvinceChange}
              onCityChange={handleCityChange}
              provinceLoading={provincesLoading}
              provinceError={provincesError}
              provinceValidationError={getError("province_id")}
              cityValidationError={getError("city_id")}
            />
          </div>
        </AppModal.Section>
      </div>
    </AppModal>
  );
};

export default CreateCustomer;
