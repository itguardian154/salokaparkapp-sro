import AppModal from "@/components/base-modal";
import SearchablePopover from "@/components/searchable-popover";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import CustomerSuggestionField from "@/features/invoice/components/customer-suggestion-field";
import { customerGroupNumberOptions } from "../utils/customer-group-number-options";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useProvinces } from "@/features/wilayah/hooks/use-provinces";
import { useCities } from "@/features/wilayah/hooks/use-cities";
import type { Province, City } from "@/features/wilayah/types/wilayah";

import { useSegments } from "@/features/master/master-segment/hooks/use-master-segment";
import { useSegmentDetails } from "@/features/master/master-segment/hooks/use-master-segment-detail";

import { useEffect, useState } from "react";
import { FaSave } from "react-icons/fa";
import { FaPen } from "react-icons/fa6";

import type { CustomerRecord, UpdateCustomerPayload } from "../types/customer";

import {
  UpdateCustomerFormSchema,
  type UpdateCustomerFormValues,
} from "../schemas/customer-schema";

type ValidationErrors = Partial<Record<keyof UpdateCustomerFormValues, string>>;

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
  segment_type: "education" | "corporate" | "individual" | "other";
  is_non_formal: boolean;
  province_id: string;
  city_id: string;
  is_active: boolean;
};

type UpdateCustomerProps = {
  open: boolean;
  onClose: () => void;
  customer: CustomerRecord | null;
  onSubmit: (id: number, payload: UpdateCustomerPayload) => Promise<void>;
  submitting?: boolean;
  submitError?: string | null;
};

type ProvinceCityFieldsProps = {
  provinces: Province[];
  provinceId: number | null;
  cityId: number | null;
  cityName: string;
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

type SegmentFieldsProps = {
  segmentId: number | null;
  segmentDetailId: number | null;
  subSegmentDetailId: number | null;
  segmentOptionId: number | null;
  groupNumber: string;
  name: string;
  customNameParts: string[];
  nameTagOrder: string[];
  onSegmentChange: (
    id: number | null,
    type: CustomerFormData["segment_type"],
  ) => void;
  onSegmentDetailChange: (id: number | null, isNonFormal?: boolean) => void;
  onSubSegmentDetailChange: (id: number | null) => void;
  onSegmentOptionChange: (id: number | null) => void;
  onGroupNumberChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onCustomNamePartsChange: (value: string[]) => void;
  onNameTagOrderChange: (value: string[]) => void;
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
  segment_type: "other",
  is_non_formal: false,
  province_id: "",
  city_id: "",
  is_active: true,
};

/* =========================
   FIELD SEGMENT & SEGMENT DETAIL
========================= */

const SegmentFields = ({
  segmentId,
  segmentDetailId,
  subSegmentDetailId,
  segmentOptionId,
  groupNumber,
  name,
  customNameParts,
  nameTagOrder,
  onSegmentChange,
  onSegmentDetailChange,
  onSubSegmentDetailChange,
  onSegmentOptionChange,
  onGroupNumberChange,
  onNameChange,
  onCustomNamePartsChange,
  onNameTagOrderChange,
  segmentValidationError,
  segmentDetailValidationError,
  subSegmentDetailValidationError,
  segmentOptionValidationError,
  groupNumberValidationError,
  nameValidationError,
}: SegmentFieldsProps) => {
  const [openSegment, setOpenSegment] = useState(false);
  const [openSegmentDetail, setOpenSegmentDetail] = useState(false);
  const [openSubDetail, setOpenSubDetail] = useState(false);
  const [openOption, setOpenOption] = useState(false);
  const [openGroupNumber, setOpenGroupNumber] = useState(false);
  const [searchSegment, setSearchSegment] = useState("");
  const [searchSegmentDetail, setSearchSegmentDetail] = useState("");
  const [searchSubDetail, setSearchSubDetail] = useState("");
  const [searchOption, setSearchOption] = useState("");
  const [searchGroupNumber, setSearchGroupNumber] = useState("");
  const [namePartInput, setNamePartInput] = useState("");

  const {
    segments,
    loading: segmentsLoading,
    error: segmentsError,
  } = useSegments();

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
  const segmentName = selectedSegment?.name.toLowerCase() ?? "";
  const isEducation = segmentName.includes("edukasi");
  const isCorporate = segmentName.includes("corporate");
  const isNonFormal = (selectedSegmentDetail?.name ?? "")
    .toLowerCase()
    .replace(/[\s-]/g, "")
    .includes("nonformal");
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
  const isEducationNameReady = Boolean(
    segmentDetailId &&
    subSegmentDetailId &&
    (isNonFormal || (segmentOptionId && groupNumber)),
  );
  const composeName = (
    levelName: string | null | undefined = selectedSubDetail?.name,
    statusName: string | null | undefined = selectedOption?.name,
    number = groupNumber,
    customParts = customNameParts,
    order = nameTagOrder,
  ) => {
    const parts = [
      { id: "jenjang", label: levelName },
      {
        id: "status",
        label: statusName?.trim().toLowerCase().startsWith("swast")
          ? undefined
          : statusName,
      },
      { id: "nomor", label: number },
      ...customParts.map((label, index) => ({
        id: `custom-${index}`,
        label,
      })),
    ].filter((part): part is { id: string; label: string } =>
      Boolean(part.label?.trim()),
    );
    const defaultOrder = [
      "jenjang",
      "status",
      "nomor",
      ...customParts.map((_, index) => `custom-${index}`),
    ];
    return parts
      .sort((left, right) => {
        const leftIndex = order.indexOf(left.id);
        const rightIndex = order.indexOf(right.id);
        return (
          (leftIndex < 0 ? defaultOrder.indexOf(left.id) : leftIndex) -
          (rightIndex < 0 ? defaultOrder.indexOf(right.id) : rightIndex)
        );
      })
      .map((part) => part.label)
      .join(" ");
  };
  const nameTags = [
    selectedSubDetail?.name
      ? {
          id: "jenjang",
          label: selectedSubDetail.name,
          onRemove: () => {
            onSubSegmentDetailChange(null);
            onSegmentOptionChange(null);
            onGroupNumberChange("");
            const nextName = composeName("", "", "", customNameParts);
            onNameChange(nextName);
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
            onNameChange(composeName(selectedSubDetail?.name, ""));
          },
        }
      : null,
    isEducation && !isNonFormal && groupNumber
      ? {
          id: "nomor",
          label: groupNumber,
          onRemove: () => {
            onGroupNumberChange("");
            onNameChange(
              composeName(selectedSubDetail?.name, selectedOption?.name, ""),
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
        onCustomNamePartsChange(nextParts);
        onNameChange(composeName(undefined, undefined, groupNumber, nextParts));
      },
    })),
  ].filter((tag): tag is NonNullable<typeof tag> => Boolean(tag));
  const addNamePart = (value: string) => {
    const nextParts = [...customNameParts, value];
    onCustomNamePartsChange(nextParts);
    onNameChange(composeName(undefined, undefined, groupNumber, nextParts));
    setNamePartInput("");
  };

  const handleSegmentChange = (id: number | null) => {
    if (id !== segmentId) {
      const segment = activeSegments.find((item) => item.id === id);
      const name = segment?.name.toLowerCase() ?? "";
      onSegmentChange(
        id,
        name.includes("edukasi")
          ? "education"
          : name.includes("corporate")
            ? "corporate"
            : name.includes("individu")
              ? "individual"
              : "other",
      );
      onSegmentDetailChange(null);
      onSubSegmentDetailChange(null);
      onSegmentOptionChange(null);
      onGroupNumberChange("");
      onCustomNamePartsChange([]);
      onNameTagOrderChange([]);
      onNameChange("");
    }

    setSearchSegment("");
    setSearchSegmentDetail("");
    setOpenSegment(false);
    setOpenSegmentDetail(false);
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
    onGroupNumberChange("");
    onCustomNamePartsChange([]);
    onNameTagOrderChange([]);
    if (isEducation) onNameChange("");
    setSearchSegmentDetail("");
    setOpenSegmentDetail(false);
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
        <Field>
          <FieldLabel>{isEducation ? "Jenis" : "Bidang Usaha"} <span className="text-xs text-red-500">*</span></FieldLabel>

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
      )}

      {(isEducation || isCorporate) && (
        <Field>
          <FieldLabel>{isEducation ? "Jenjang" : "Jenis Usaha"} <span className="text-xs text-red-500">*</span></FieldLabel>
          <SearchablePopover
            open={openSubDetail}
            onOpenChange={setOpenSubDetail}
            search={searchSubDetail}
            onSearchChange={setSearchSubDetail}
            placeholder={
              !segmentDetailId
                ? "Pilih segment detail terlebih dahulu"
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
              if (isEducation)
                onNameChange(composeName(item.name, "", groupNumber));
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
      )}

      {isEducation && !isNonFormal && (
        <>
          <Field>
            <FieldLabel>
              Status <span className="text-xs text-red-500">*</span>
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
                onNameChange(composeName(selectedSubDetail?.name, item.name));
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
          <Field>
            <FieldLabel>
              Nomor <span className="text-xs text-red-500">*</span>
            </FieldLabel>
            <SearchablePopover
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
                  composeName(
                    selectedSubDetail?.name,
                    selectedOption?.name,
                    option.value,
                  ),
                );
                setSearchGroupNumber("");
                setOpenGroupNumber(false);
              }}
              disabled={
                !segmentDetailId || !subSegmentDetailId || !segmentOptionId
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
        </>
      )}

      <Field className="md:col-span-2">
        <FieldLabel>Nama Customer <span className="text-xs text-red-500">*</span></FieldLabel>
        {isEducation ? (
          <CustomerSuggestionField
            value={namePartInput}
            tags={nameTags}
            onAddTextTag={addNamePart}
            onSelect={() => undefined}
            searchEnabled={false}
            inputDisabled={!isEducationNameReady}
            placeholder="Ketik nama tambahan lalu tekan Enter"
            onReorderTags={(ids) => {
              onNameTagOrderChange(ids);
              onNameChange(
                ids
                  .map((id) => nameTags.find((tag) => tag.id === id)?.label)
                  .filter((label): label is string => Boolean(label))
                  .join(" "),
              );
            }}
          />
        ) : (
          <Input
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Masukkan nama customer"
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

  const { cities, loading: citiesLoading } = useCities(provinceId);

  // Cocokkan nama kota dari data customer dengan data kota dari API.
  useEffect(() => {
    if (provinceId === null || !cityName || cities.length === 0) {
      return;
    }

    const matchedCity = cities.find(
      (city) =>
        city.name.trim().toLowerCase() === cityName.trim().toLowerCase(),
    );

    if (matchedCity && matchedCity.id !== cityId) {
      onCityChange(matchedCity.id, matchedCity.name);
    }
  }, [provinceId, cities, cityName, cityId, onCityChange]);

  const selectedProvince = provinces.find(
    (province) => province.id === provinceId,
  );

  const selectedCity =
    cities.find((city) => city.id === cityId) ??
    cities.find(
      (city) =>
        city.name.trim().toLowerCase() === cityName.trim().toLowerCase(),
    );

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
        <FieldLabel>Kota/Kabupaten <span className="text-xs text-red-500">*</span></FieldLabel>

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
          selectedKey={selectedCity ? String(selectedCity.id) : null}
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
   UPDATE CUSTOMER
========================= */

const getCustomerEducationNameParts = (customer: CustomerRecord) => {
  let remainder = customer.name?.trim() ?? "";
  const removeLabel = (label?: string | null) => {
    if (!label) return;
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    remainder = remainder
      .replace(new RegExp(`(^|\\s)${escapedLabel}(?=\\s|$)`, "i"), " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  removeLabel(customer.segment_detail?.name);
  removeLabel(customer.sub_segment_detail?.name);
  removeLabel(customer.segment_option?.name);

  const numberMatch = remainder.match(/(?:^|\s)(\d{1,3})(?=\s|$)/);
  const groupNumber = numberMatch?.[1] ?? "";
  if (numberMatch) {
    remainder = `${remainder.slice(0, numberMatch.index)} ${remainder.slice(
      numberMatch.index! + numberMatch[0].length,
    )}`
      .replace(/\s+/g, " ")
      .trim();
  }

  return {
    groupNumber,
    customNameParts: remainder ? [remainder] : [],
  };
};

const UpdateCustomer = ({
  open,
  onClose,
  customer,
  onSubmit,
  submitting = false,
  submitError,
}: UpdateCustomerProps) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    ...initialFormData,
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [customNameParts, setCustomNameParts] = useState<string[]>([]);
  const [nameTagOrder, setNameTagOrder] = useState<string[]>([]);

  const [provinceName, setProvinceName] = useState("");
  const [cityName, setCityName] = useState("");

  const {
    provinces,
    loading: provincesLoading,
    error: provincesError,
  } = useProvinces();

  // Isi form berdasarkan customer yang dipilih untuk diedit.
  useEffect(() => {
    if (!open || !customer) return;

    const currentProvinceName = customer.province_name ?? "";
    const currentCityName = customer.city_name ?? "";

    const matchedProvince = provinces.find(
      (province) =>
        province.name.trim().toLowerCase() ===
        currentProvinceName.trim().toLowerCase(),
    );
    const segmentName = customer.segment?.name.toLowerCase() ?? "";
    const isEducation = segmentName.includes("edukasi");
    const isCorporate = segmentName.includes("corporate");
    const isNonFormal = (customer.segment_detail?.name ?? "")
      .toLowerCase()
      .replace(/[\s-]/g, "")
      .includes("nonformal");
    const parsedEducationName = getCustomerEducationNameParts(customer);

    setFormData({
      name: customer.name ?? "",
      email: customer.email ?? "",
      contact_person: customer.contact_person ?? "",
      phone: customer.phone ?? "",
      segment_id:
        customer.segment?.id != null ? String(customer.segment.id) : "",

      segment_detail_id:
        (isEducation || isCorporate) && customer.segment_detail?.id != null
          ? String(customer.segment_detail.id)
          : "",
      sub_segment_detail_id:
        customer.sub_segment_detail?.id != null
          ? String(customer.sub_segment_detail.id)
          : customer.sub_segment_detail_id != null
            ? String(customer.sub_segment_detail_id)
            : "",
      segment_option_id:
        customer.segment_option?.id != null
          ? String(customer.segment_option.id)
          : customer.segment_option_id != null
            ? String(customer.segment_option_id)
            : "",
      group_number: isEducation ? parsedEducationName.groupNumber : "",
      segment_type: isEducation
        ? "education"
        : isCorporate
          ? "corporate"
          : segmentName.includes("individu")
            ? "individual"
            : "other",
      is_non_formal: isEducation && isNonFormal,
      province_id: matchedProvince ? String(matchedProvince.id) : "",
      city_id: "",
      is_active: customer.is_active ?? true,
    });
    setCustomNameParts(isEducation ? parsedEducationName.customNameParts : []);
    setNameTagOrder([]);

    setProvinceName(matchedProvince?.name ?? currentProvinceName);
    setCityName(currentCityName);
    setValidationErrors({});
  }, [open, customer, provinces]);

  const clearForm = () => {
    setFormData({ ...initialFormData });
    setValidationErrors({});
    setProvinceName("");
    setCityName("");
    setCustomNameParts([]);
    setNameTagOrder([]);
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
    updateField("city_id", "");

    const selectedProvince = provinces.find((province) => province.id === id);

    setProvinceName(selectedProvince?.name ?? "");
    setCityName("");

    setValidationErrors((current) => ({
      ...current,
      province_id: undefined,
      city_id: undefined,
    }));
  };

  const handleCityChange = (id: number | null, name: string) => {
    updateField("city_id", id === null ? "" : String(id));
    setCityName(name);

    setValidationErrors((current) => ({
      ...current,
      city_id: undefined,
    }));
  };

  const handleSegmentChange = (
    id: number | null,
    type: CustomerFormData["segment_type"],
  ) => {
    updateField("segment_id", id === null ? "" : String(id));
    updateField("segment_detail_id", "");
    updateField("sub_segment_detail_id", "");
    updateField("segment_option_id", "");
    updateField("group_number", "");
    updateField("segment_type", type);
    updateField("is_non_formal", false);
    updateField("name", "");
    setCustomNameParts([]);
    setNameTagOrder([]);
  };

  const handleSegmentDetailChange = (
    id: number | null,
    isNonFormal = false,
  ) => {
    updateField("segment_detail_id", id === null ? "" : String(id));
    updateField("sub_segment_detail_id", "");
    updateField("segment_option_id", "");
    updateField("group_number", "");
    updateField("is_non_formal", id !== null && isNonFormal);
    updateField("name", "");
    setCustomNameParts([]);
    setNameTagOrder([]);
  };

  const handleSubSegmentDetailChange = (id: number | null) => {
    updateField("sub_segment_detail_id", id === null ? "" : String(id));
    updateField("segment_option_id", "");
  };

  const handleSegmentOptionChange = (id: number | null) => {
    updateField("segment_option_id", id === null ? "" : String(id));
  };

  const handleGroupNumberChange = (value: string) => {
    updateField("group_number", value);
  };

  const getError = (field: keyof UpdateCustomerFormValues) =>
    validationErrors[field];

  const handleSubmit = async () => {
    if (submitting || !customer) return;

    const validation = UpdateCustomerFormSchema.safeParse({
      name: formData.name,
      email: formData.email,
      contact_person: formData.contact_person,
      phone: formData.phone,
      segment_id: formData.segment_id,
      segment_detail_id: formData.segment_detail_id,
      sub_segment_detail_id: formData.sub_segment_detail_id,
      segment_option_id: formData.segment_option_id,
      group_number: formData.group_number,
      segment_type: formData.segment_type,
      is_non_formal: formData.is_non_formal,
      province_id: formData.province_id,
      city_id: formData.city_id,
    });

    if (!validation.success) {
      const nextErrors: ValidationErrors = {};

      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof UpdateCustomerFormValues;

        nextErrors[field] ??= issue.message;
      });

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

    const payload = {
      name: validation.data.name,
      email: validation.data.email,
      contact_person: validation.data.contact_person,
      phone: validation.data.phone,
      segment_id: Number(validation.data.segment_id),
      ...(validation.data.segment_detail_id && {
        segment_detail_id: Number(validation.data.segment_detail_id),
      }),
      ...(validation.data.sub_segment_detail_id && {
        sub_segment_detail_id: Number(validation.data.sub_segment_detail_id),
      }),
      ...(validation.data.segment_option_id && {
        segment_option_id: Number(validation.data.segment_option_id),
      }),
      province_name: provinceName,
      city_name: cityName,
      is_active: formData.is_active,
    } satisfies UpdateCustomerPayload;

    setValidationErrors({});

    try {
      await onSubmit(customer.id, payload);
      clearForm();
      onClose();
    } catch (error) {
      console.error("[Customer] Gagal memperbarui customer:", error);
    }
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="Edit Customer"
      icon={<FaPen />}
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
            disabled={submitting || !customer}
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

        <AppModal.Section title="Update Customer" showHeader={false}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SegmentFields
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
              customNameParts={customNameParts}
              nameTagOrder={nameTagOrder}
              onSegmentChange={handleSegmentChange}
              onSegmentDetailChange={handleSegmentDetailChange}
              onSubSegmentDetailChange={handleSubSegmentDetailChange}
              onSegmentOptionChange={handleSegmentOptionChange}
              onGroupNumberChange={handleGroupNumberChange}
              onNameChange={(value) => updateField("name", value)}
              onCustomNamePartsChange={setCustomNameParts}
              onNameTagOrderChange={setNameTagOrder}
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
              <FieldLabel>Nama PIC</FieldLabel>
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
              cityName={cityName}
              onProvinceChange={handleProvinceChange}
              onCityChange={handleCityChange}
              provinceLoading={provincesLoading}
              provinceError={provincesError}
              provinceValidationError={getError("province_id")}
              cityValidationError={getError("city_id")}
            />

            <Field>
              <FieldLabel>Status Customer <span className="text-xs text-red-500">*</span></FieldLabel>
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
          </div>
        </AppModal.Section>
      </div>
    </AppModal>
  );
};

export default UpdateCustomer;
