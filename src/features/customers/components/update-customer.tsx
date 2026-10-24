
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

import { useSegments } from "@/features/master/master-segment/hooks/use-master-segment";
import { useSegmentDetails } from "@/features/master/master-segment/hooks/use-master-segment-detail";

import { useEffect, useState } from "react";
import { FaSave } from "react-icons/fa";
import { FaPen } from "react-icons/fa6";

import type {
    CustomerRecord,
    UpdateCustomerPayload,
} from "../types/customer";

import {
    UpdateCustomerFormSchema,
    type UpdateCustomerFormValues,
} from "../schemas/customer-schema";

type ValidationErrors = Partial<
    Record<keyof UpdateCustomerFormValues, string>
>;

type CustomerFormData = {
    name: string;
    email: string;
    contact_person: string;
    phone: string;
    segment_id: string;
    segment_detail_id: string;
    province_id: string;
    city_id: string;
    is_active: boolean;
};

type UpdateCustomerProps = {
    open: boolean;
    onClose: () => void;
    customer: CustomerRecord | null;
    onSubmit: (
        id: number,
        payload: UpdateCustomerPayload,
    ) => Promise<void>;
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
    onSegmentChange: (id: number | null) => void;
    onSegmentDetailChange: (id: number | null) => void;
    segmentValidationError?: string;
    segmentDetailValidationError?: string;
};

const initialFormData: CustomerFormData = {
    name: "",
    email: "",
    contact_person: "",
    phone: "",
    segment_id: "",
    segment_detail_id: "",
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
    onSegmentChange,
    onSegmentDetailChange,
    segmentValidationError,
    segmentDetailValidationError,
}: SegmentFieldsProps) => {
    const [openSegment, setOpenSegment] = useState(false);
    const [openSegmentDetail, setOpenSegmentDetail] = useState(false);

    const [searchSegment, setSearchSegment] = useState("");
    const [searchSegmentDetail, setSearchSegmentDetail] = useState("");

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

    const activeSegments = (segments ?? []).filter(
        (item) => item.is_active,
    );

    const activeSegmentDetails = (segmentDetails ?? []).filter(
        (item) => item.is_active,
    );

    const filteredSegments = activeSegments.filter((item) =>
        item.name
            .toLowerCase()
            .includes(searchSegment.toLowerCase().trim()),
    );

    const filteredSegmentDetails = activeSegmentDetails.filter((item) =>
        item.name
            .toLowerCase()
            .includes(searchSegmentDetail.toLowerCase().trim()),
    );

    const selectedSegment = activeSegments.find(
        (item) => item.id === segmentId,
    );

    const selectedSegmentDetail = activeSegmentDetails.find(
        (item) => item.id === segmentDetailId,
    );

    const handleSegmentChange = (id: number | null) => {
        if (id !== segmentId) {
            onSegmentChange(id);
            onSegmentDetailChange(null);
        }

        setSearchSegment("");
        setSearchSegmentDetail("");
        setOpenSegment(false);
        setOpenSegmentDetail(false);
    };

    const handleSegmentDetailChange = (id: number | null) => {
        onSegmentDetailChange(id);
        setSearchSegmentDetail("");
        setOpenSegmentDetail(false);
    };

    return (
        <>
            <Field>
                <FieldLabel>Segment</FieldLabel>

                <SearchablePopover<SegmentOption>
                    open={openSegment}
                    onOpenChange={setOpenSegment}
                    search={searchSegment}
                    onSearchChange={setSearchSegment}
                    placeholder={
                        segmentsLoading
                            ? "Memuat segment..."
                            : "Pilih segment"
                    }
                    selectedLabel={selectedSegment?.name ?? null}
                    selectedKey={
                        segmentId !== null ? String(segmentId) : null
                    }
                    items={filteredSegments}
                    getKey={(item) => String(item.id)}
                    renderItem={(item) => item.name}
                    onSelect={(item) => handleSegmentChange(item.id)}
                    disabled={segmentsLoading}
                    emptyText={
                        segmentsError
                            ? "Segment gagal dimuat."
                            : "Segment tidak ditemukan."
                    }
                    debounceDelay={500}
                />

                {segmentsError && (
                    <p className="text-sm text-red-500">
                        {segmentsError}
                    </p>
                )}

                {segmentValidationError && (
                    <p role="alert" className="text-sm text-red-500">
                        {segmentValidationError}
                    </p>
                )}
            </Field>

            <Field>
                <FieldLabel>Segment Detail</FieldLabel>

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
                        segmentDetailId !== null
                            ? String(segmentDetailId)
                            : null
                    }
                    items={filteredSegmentDetails}
                    getKey={(item) => String(item.id)}
                    renderItem={(item) => item.name}
                    onSelect={(item) =>
                        handleSegmentDetailChange(item.id)
                    }
                    disabled={
                        segmentId === null || segmentDetailsLoading
                    }
                    emptyText={
                        segmentDetailsError
                            ? "Segment detail gagal dimuat."
                            : "Segment detail tidak ditemukan."
                    }
                    debounceDelay={500}
                />

                {segmentDetailsError && (
                    <p className="text-sm text-red-500">
                        {segmentDetailsError}
                    </p>
                )}

                {segmentDetailValidationError && (
                    <p role="alert" className="text-sm text-red-500">
                        {segmentDetailValidationError}
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

    const {
        cities,
        loading: citiesLoading,
    } = useCities(provinceId);

    // Cocokkan nama kota dari data customer dengan data kota dari API.
    useEffect(() => {
        if (provinceId === null || !cityName || cities.length === 0) {
            return;
        }

        const matchedCity = cities.find(
            (city) =>
                city.name.trim().toLowerCase() ===
                cityName.trim().toLowerCase(),
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
                city.name.trim().toLowerCase() ===
                cityName.trim().toLowerCase(),
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
                    <p role="alert" className="text-sm text-red-500">
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
                        provinceId === null
                            ? "Pilih provinsi terlebih dahulu"
                            : citiesLoading
                                ? "Memuat kota..."
                                : "Pilih kota/kabupaten"
                    }
                    selectedLabel={selectedCity?.name ?? null}
                    selectedKey={
                        selectedCity ? String(selectedCity.id) : null
                    }
                    items={filteredCities}
                    getKey={(city) => String(city.id)}
                    renderItem={(city) => city.name}
                    onSelect={(city) =>
                        handleCityChange(city.id, city.name)
                    }
                    disabled={
                        provinceId === null ||
                        citiesLoading ||
                        provinceLoading
                    }
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

    const [validationErrors, setValidationErrors] =
        useState<ValidationErrors>({});

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

        setFormData({
            name: customer.name ?? "",
            email: customer.email ?? "",
            contact_person: customer.contact_person ?? "",
            phone: customer.phone ?? "",
            segment_id:
                customer.segment?.id != null
                    ? String(customer.segment.id)
                    : "",

            segment_detail_id:
                customer.segment_detail?.id != null
                    ? String(customer.segment_detail.id)
                    : "",
            province_id: matchedProvince
                ? String(matchedProvince.id)
                : "",
            city_id: "",
            is_active: customer.is_active ?? true,
        });

        setProvinceName(matchedProvince?.name ?? currentProvinceName);
        setCityName(currentCityName);
        setValidationErrors({});
    }, [open, customer, provinces]);

    const clearForm = () => {
        setFormData({ ...initialFormData });
        setValidationErrors({});
        setProvinceName("");
        setCityName("");
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

        const selectedProvince = provinces.find(
            (province) => province.id === id,
        );

        setProvinceName(selectedProvince?.name ?? "");
        setCityName("");

        setValidationErrors((current) => ({
            ...current,
            province_id: undefined,
            city_id: undefined,
        }));
    };

    const handleCityChange = (
        id: number | null,
        name: string,
    ) => {
        updateField("city_id", id === null ? "" : String(id));
        setCityName(name);

        setValidationErrors((current) => ({
            ...current,
            city_id: undefined,
        }));
    };

    const handleSegmentChange = (id: number | null) => {
        updateField("segment_id", id === null ? "" : String(id));
        updateField("segment_detail_id", "");
    };

    const handleSegmentDetailChange = (id: number | null) => {
        updateField(
            "segment_detail_id",
            id === null ? "" : String(id),
        );
    };

    const getError = (
        field: keyof UpdateCustomerFormValues,
    ) => validationErrors[field];

    const handleSubmit = async () => {
        if (submitting || !customer) return;

        const validation = UpdateCustomerFormSchema.safeParse({
            name: formData.name,
            email: formData.email,
            contact_person: formData.contact_person,
            phone: formData.phone,
            segment_id: formData.segment_id,
            segment_detail_id: formData.segment_detail_id,
            province_id: formData.province_id,
            city_id: formData.city_id,
        });

        if (!validation.success) {
            const nextErrors: ValidationErrors = {};

            validation.error.issues.forEach((issue) => {
                const field =
                    issue.path[0] as keyof UpdateCustomerFormValues;

                nextErrors[field] ??= issue.message;
            });

            setValidationErrors(nextErrors);
            return;
        }

        if (!provinceName || !cityName) {
            setValidationErrors((current) => ({
                ...current,
                ...(!provinceName
                    ? { province_id: "Provinsi wajib dipilih" }
                    : {}),
                ...(!cityName
                    ? { city_id: "Kota/kabupaten wajib dipilih" }
                    : {}),
            }));

            return;
        }

        const payload = {
            name: validation.data.name,
            email: validation.data.email,
            contact_person: validation.data.contact_person,
            phone: validation.data.phone,
            segment_id: Number(validation.data.segment_id),
            segment_detail_id: Number(validation.data.segment_detail_id),
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
            console.error(
                "[Customer] Gagal memperbarui customer:",
                error,
            );
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

                <AppModal.Section
                    title="Update Customer" showHeader={false}
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field>
                            <FieldLabel>Nama Customer</FieldLabel>
                            <Input
                                value={formData.name}
                                onChange={(event) =>
                                    updateField("name", event.target.value)
                                }
                                placeholder="Masukkan nama customer"
                            />
                            {getError("name") && (
                                <p className="text-sm text-red-500">
                                    {getError("name")}
                                </p>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel>WhatsApp Customer</FieldLabel>
                            <Input
                                type="tel"
                                value={formData.phone}
                                onChange={(event) =>
                                    updateField("phone", event.target.value)
                                }
                                placeholder="Contoh: 081234567890"
                            />
                            {getError("phone") && (
                                <p className="text-sm text-red-500">
                                    {getError("phone")}
                                </p>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel>Email Customer</FieldLabel>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(event) =>
                                    updateField("email", event.target.value)
                                }
                                placeholder="Masukkan email customer"
                            />
                            {getError("email") && (
                                <p className="text-sm text-red-500">
                                    {getError("email")}
                                </p>
                            )}
                        </Field>
                        <Field>
                            <FieldLabel>Nama PIC</FieldLabel>
                            <Input
                                value={formData.contact_person}
                                onChange={(event) =>
                                    updateField(
                                        "contact_person",
                                        event.target.value,
                                    )
                                }
                                placeholder="Masukkan nama PIC"
                            />
                            {getError("contact_person") && (
                                <p className="text-sm text-red-500">
                                    {getError("contact_person")}
                                </p>
                            )}
                        </Field>



                        <SegmentFields
                            segmentId={
                                formData.segment_id
                                    ? Number(formData.segment_id)
                                    : null
                            }
                            segmentDetailId={
                                formData.segment_detail_id
                                    ? Number(formData.segment_detail_id)
                                    : null
                            }
                            onSegmentChange={handleSegmentChange}
                            onSegmentDetailChange={
                                handleSegmentDetailChange
                            }
                            segmentValidationError={getError("segment_id")}
                            segmentDetailValidationError={getError(
                                "segment_detail_id",
                            )}
                        />

                        <ProvinceCityFields
                            provinces={provinces}
                            provinceId={
                                formData.province_id
                                    ? Number(formData.province_id)
                                    : null
                            }
                            cityId={
                                formData.city_id
                                    ? Number(formData.city_id)
                                    : null
                            }
                            cityName={cityName}
                            onProvinceChange={handleProvinceChange}
                            onCityChange={handleCityChange}
                            provinceLoading={provincesLoading}
                            provinceError={provincesError}
                            provinceValidationError={getError("province_id")}
                            cityValidationError={getError("city_id")}
                        />

                        <Field>
                            <FieldLabel>Status Customer</FieldLabel>
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
                                        {formData.is_active
                                            ? "Aktif"
                                            : "Nonaktif"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent
                                    align="start"
                                    alignItemWithTrigger={false}
                                >
                                    <SelectItem value="true">
                                        Aktif
                                    </SelectItem>
                                    <SelectItem value="false">
                                        Nonaktif
                                    </SelectItem>
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
