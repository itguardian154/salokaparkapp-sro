import DetailActionFooter, {
  type DetailAction,
} from "@/components/detail-page/detail-action-footer";
import DetailPageLayout from "@/components/detail-page/detail-page-ayout";
import DetailSection from "@/components/detail-page/detail-section";
import SearchablePopover from "@/components/searchable-popover";
import DateRangePicker from "@/components/date-range-picker";
import DetailOrderTable from "./detail-order-table";
import CreateDetailInvoice from "./create-detail-order";
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
import { useCities } from "@/features/wilayah/hooks/use-cities";
import { useProvinces } from "@/features/wilayah/hooks/use-provinces";
import type { City, Province } from "@/features/wilayah/types/wilayah";
import { useKaryawan } from "@/features/karyawan/hooks/use-karyawan";
import type { Karyawan } from "@/features/karyawan/types/karyawan";
import { Plus, Signature, Users } from "lucide-react";
import { useState } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { FaFileInvoice } from "react-icons/fa6";
import { MdWorkHistory } from "react-icons/md";
import { useNavigate } from "react-router-dom";

type InvoiceSearchOption = {
  value: string;
  label: string;
};

const businessFieldOptions: InvoiceSearchOption[] = [
  { value: "manufaktur", label: "Manufaktur" },
  { value: "keuangan", label: "Keuangan" },
  { value: "kesehatan", label: "Kesehatan" },
  { value: "kedinasan", label: "Kedinasan" },
  { value: "horeka", label: "Horeka" },
  { value: "dagang", label: "Dagang" },
  { value: "komunitas", label: "Komunitas" },
  { value: "keluarga", label: "Keluarga" },
];

const businessTypeOptions = [
  { value: "manufaktur", label: "Manufaktur" },
  { value: "keuangan", label: "Keuangan" },
  { value: "kesehatan", label: "Kesehatan" },
  { value: "kedinasan", label: "Kedinasan" },
  { value: "horeka", label: "Horeka" },
  { value: "dagang", label: "Dagang" },
  { value: "komunitas", label: "Komunitas" },
  { value: "keluarga", label: "Keluarga" },
];

const educationLevelOptions: InvoiceSearchOption[] = [
  { value: "sd", label: "SD" },
  { value: "smp", label: "SMP" },
  { value: "sma", label: "SMA" },
];

const educationStatusOptions: InvoiceSearchOption[] = [
  { value: "negeri", label: "Negeri" },
  { value: "swasta", label: "Swasta" },
];

const groupNumberOptions: InvoiceSearchOption[] = Array.from(
  { length: 999 },
  (_, index) => {
    const value = String(index + 1);
    return { value, label: value };
  },
);

const filterInvoiceOptions = (
  options: InvoiceSearchOption[],
  search: string,
) =>
  options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase().trim()),
  );

const buildEducationGroupName = (
  level: string,
  status: string,
  number: string,
) =>
  [
    educationLevelOptions.find((option) => option.value === level)?.label,
    educationStatusOptions.find((option) => option.value === status)?.label,
    groupNumberOptions.find((option) => option.value === number)?.label,
  ]
    .filter(Boolean)
    .join(" ");

export default function DetailInvoice() {
  const navigate = useNavigate();
  const [openCreateDetailInvoice, setOpenCreateDetailInvoice] = useState(false);
  const {
    provinces,
    loading: provinceLoading,
    error: provinceError,
  } = useProvinces();
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);
  const [openKaryawan, setOpenKaryawan] = useState(false);
  const [selectedKaryawan, setSelectedKaryawan] = useState<Karyawan | null>(
    null,
  );
  const [customerSegment, setCustomerSegment] = useState("");
  const [invoiceSegment, setInvoiceSegment] = useState("");
  const [travelAgent, setTravelAgent] = useState("");
  const [businessField, setBusinessField] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [openInvoiceOption, setOpenInvoiceOption] = useState<string | null>(null);
  const [searchInvoiceOption, setSearchInvoiceOption] = useState("");
  const [jenisGroup, setJenisGroup] = useState("");
  const [jenjang, setJenjang] = useState("");
  const [statusGroup, setStatusGroup] = useState("");
  const [nomorGroup, setNomorGroup] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupProvinceId, setGroupProvinceId] = useState<number | null>(null);
  const [groupCityId, setGroupCityId] = useState<number | null>(null);
  const [openGroupProvince, setOpenGroupProvince] = useState(false);
  const [openGroupCity, setOpenGroupCity] = useState(false);
  const [searchGroupProvince, setSearchGroupProvince] = useState("");
  const [searchGroupCity, setSearchGroupCity] = useState("");
  const [arrivalDate, setArrivalDate] = useState<Date>();
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");

  // Get nama sales start
  const {
    karyawan,
    searchKaryawan,
    setSearchKaryawan,
    loading: karyawanLoading,
    error: karyawanError,
  } = useKaryawan();
  const eligibleKaryawan = karyawan.filter(
    (item) =>
      item.id_departemen === "DP008" ||
      (item.id_departemen === "DP009" && item.id_departemen_sub === "DS019"),
  );

  // Get nama sales end

  // Handle actions start
  const actions: DetailAction[] = [];
  actions.push({
    id: "submit",
    label: "Submit",
    icon: <FaSave size={15} />,
    variant: "blue",
    mobileColor: "bg-blue-600",
    position: "right",
  });

  actions.push(
    {
      id: "reject",
      label: "Reject",
      icon: <FaTimes size={15} />,
      variant: "destructive",
      mobileColor: "bg-red-500",
      position: "right",
    },
    {
      id: "approve",
      label: "Approve",
      icon: <Signature size={15} />,
      variant: "primer",
      mobileColor: "bg-emerald-500",
      position: "right",
    },
  );
  // Handle actions end

  // Handle get provinsi dan kota start
  const [openProvince, setOpenProvince] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [searchProvince, setSearchProvince] = useState("");
  const [searchCity, setSearchCity] = useState("");

  const { cities, loading: citiesLoading } = useCities(provinceId);
  const { cities: groupCities, loading: groupCitiesLoading } =
    useCities(groupProvinceId);

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
  const selectedGroupProvince = provinces.find(
    (province) => province.id === groupProvinceId,
  );
  const selectedGroupCity = groupCities.find((city) => city.id === groupCityId);
  const filteredGroupProvinces = provinces.filter((province) =>
    province.name
      .toLowerCase()
      .includes(searchGroupProvince.toLowerCase().trim()),
  );
  const filteredGroupCities = groupCities.filter((city) =>
    city.name.toLowerCase().includes(searchGroupCity.toLowerCase().trim()),
  );

  const handleProvinceChange = (id: number | null) => {
    if (id !== provinceId) {
      setProvinceId(id);
      setCityId(null);
    }

    setSearchProvince("");
    setSearchCity("");
    setOpenProvince(false);
    setOpenCity(false);
  };

  const handleCityChange = (id: number | null) => {
    setCityId(id);
    setSearchCity("");
    setOpenCity(false);
  };

  const handleGroupProvinceChange = (id: number | null) => {
    if (id !== groupProvinceId) {
      setGroupProvinceId(id);
      setGroupCityId(null);
    }

    setSearchGroupProvince("");
    setSearchGroupCity("");
    setOpenGroupProvince(false);
    setOpenGroupCity(false);
  };
  // Handle get provinsi dan kota end
  return (
    <>
      <DetailPageLayout
        icon={FaFileInvoice}
        title="Invoice"
        subtitle="INV/PIP/26/2/0001/2151"
        onClose={() => navigate("/invoice")}
        footer={<DetailActionFooter actions={actions} />}
      >
        <DetailSection
          icon={Users}
          title="Informasi Pelanggan"
          variant="blue"
          action={
            <Button
              //onClick={() => setOpenActivity(true)}
              variant="amberBorder"
              size="lg"
              className="bg-white/90 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <MdWorkHistory size={16} />
              Log Aktivitas
            </Button>
          }
        >
          <div className="grid grid-cols-1 gap-8 p-5 xl:grid-cols-2 [&_[data-slot=field-label]]:!text-xs">
            {/* Informasi Umum Pelanggan */}
            <div className="space-y-4 [&_[data-slot=field]]:!grid [&_[data-slot=field]]:!grid-cols-[140px_minmax(0,1fr)] [&_[data-slot=field]]:!items-center [&_[data-slot=field]]:!gap-3 [&_[data-slot=field]_button]:!h-10 [&_[data-slot=field]_[data-slot=input]]:!h-10">
              <Field orientation="horizontal">
                <FieldLabel>Nomor Invoice</FieldLabel>
                <Input placeholder="INV/PIP/26/2/0001/2151" disabled />
              </Field>

              <Field orientation="horizontal">
                <FieldLabel>Input Date</FieldLabel>
                <Input placeholder="Autofill tanggal pembuatan" disabled />
              </Field>
            </div>

            <div className="space-y-4 [&_[data-slot=field]]:!grid [&_[data-slot=field]]:!grid-cols-[140px_minmax(0,1fr)] [&_[data-slot=field]]:!items-center [&_[data-slot=field]]:!gap-3 [&_[data-slot=field]_button]:!h-10 [&_[data-slot=field]_[data-slot=input]]:!h-10">
              <Field orientation="horizontal">
                <FieldLabel>Sales</FieldLabel>
                <SearchablePopover<Karyawan>
                  open={openKaryawan}
                  onOpenChange={setOpenKaryawan}
                  search={searchKaryawan}
                  onSearchChange={setSearchKaryawan}
                  placeholder={
                    karyawanLoading ? "Memuat karyawan..." : "Pilih nama sales"
                  }
                  selectedLabel={selectedKaryawan?.name ?? null}
                  selectedKey={selectedKaryawan?.id_absen ?? null}
                  items={eligibleKaryawan}
                  getKey={(item) => item.id_absen}
                  renderItem={(item) => `${item.name}`}
                  onSelect={(item) => {
                    setSelectedKaryawan(item);
                    setOpenKaryawan(false);
                    setSearchKaryawan("");
                  }}
                  emptyText={
                    karyawanLoading
                      ? "Memuat data karyawan..."
                      : (karyawanError ?? "Karyawan tidak ditemukan.")
                  }
                />
              </Field>

              <Field orientation="horizontal">
                <FieldLabel>
                  Segmen <span className="text-xs text-red-500">*</span>
                </FieldLabel>

                <Select
                  value={invoiceSegment}
                  onValueChange={(value) => {
                    const nextValue = value ?? "";
                    setInvoiceSegment(nextValue);
                    setCustomerSegment("");
                    setBusinessField("");
                    setBusinessType("");
                    setJenisGroup("");
                    setJenjang("");
                    setStatusGroup("");
                    setNomorGroup("");
                    if (nextValue !== "travel") setTravelAgent("");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih segmen"></SelectValue>
                  </SelectTrigger>
                  <SelectContent align="start" alignItemWithTrigger={false}>
                    <SelectItem value="individu">Individu</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="edukasi">Edukasi</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Informasi Segmen Travel */}
            {invoiceSegment === "travel" && (
              <>
                <div className="space-y-4 [&_[data-slot=field]]:!grid [&_[data-slot=field]]:!grid-cols-[140px_minmax(0,1fr)] [&_[data-slot=field]]:!items-center [&_[data-slot=field]]:!gap-3 [&_[data-slot=field]_button]:!h-10 [&_[data-slot=field]_[data-slot=input]]:!h-10">
                  <Field orientation="horizontal">
                    <FieldLabel>
                      Nama Travel/Agent{" "}
                      <span className="text-xs text-red-500">*</span>
                    </FieldLabel>

                    <Input
                      placeholder="Masukkan nama travel/agent"
                      value={travelAgent}
                      onChange={(event) => setTravelAgent(event.target.value)}
                    />
                  </Field>

                  <Field orientation="horizontal">
                    <FieldLabel>
                      Cust Segmen{" "}
                      <span className="text-xs text-red-500">*</span>
                    </FieldLabel>

                    <Select
                      value={customerSegment}
                      onValueChange={(value: string | null) => {
                        if (value !== null) {
                          setCustomerSegment(value);
                          if (value !== "Corporate") {
                            setBusinessField("");
                            setBusinessType("");
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih customer segmen"></SelectValue>
                      </SelectTrigger>
                      <SelectContent align="start" alignItemWithTrigger={false}>
                        <SelectItem value="Corporate">Corporate</SelectItem>
                        <SelectItem value="Edukasi">Edukasi</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="space-y-4 [&_[data-slot=field]]:!grid [&_[data-slot=field]]:!grid-cols-[140px_minmax(0,1fr)] [&_[data-slot=field]]:!items-center [&_[data-slot=field]]:!gap-3 [&_[data-slot=field]_button]:!h-10 [&_[data-slot=field]_[data-slot=input]]:!h-10">
                  <Field orientation="horizontal">
                    <FieldLabel>
                      Provinsi <span className="text-xs text-red-500">*</span>
                    </FieldLabel>

                    <div className="min-w-0 space-y-1">
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
                        <p className="text-sm text-red-500">{provinceError}</p>
                      )}
                    </div>
                  </Field>

                  <Field orientation="horizontal">
                    <FieldLabel>
                      Kota/Kabupaten{" "}
                      <span className="text-xs text-red-500">*</span>
                    </FieldLabel>

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
                      onSelect={(city) => handleCityChange(city.id)}
                      disabled={
                        provinceId === null || citiesLoading || provinceLoading
                      }
                      emptyText="Kota/kabupaten tidak ditemukan."
                      debounceDelay={500}
                    />
                  </Field>
                </div>
              </>
            )}

            {(customerSegment === "Corporate" ||
              invoiceSegment === "corporate") && (
              <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-slate-100 px-5 py-4 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="grid grid-cols-1 items-center gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(240px,0.9fr)] xl:gap-6">
                  <div className="grid min-w-0 grid-cols-[110px_minmax(0,1fr)] items-center gap-3">
                    <FieldLabel>
                      Bidang Usaha{" "}
                      <span className="text-xs text-red-500">*</span>
                    </FieldLabel>
                    <SearchablePopover<InvoiceSearchOption>
                      open={openInvoiceOption === "businessField"}
                      onOpenChange={(open) =>
                        setOpenInvoiceOption(open ? "businessField" : null)
                      }
                      search={searchInvoiceOption}
                      onSearchChange={setSearchInvoiceOption}
                      placeholder="Pilih bidang usaha"
                      selectedLabel={
                        businessFieldOptions.find(
                          (option) => option.value === businessField,
                        )?.label ?? null
                      }
                      selectedKey={businessField || null}
                      items={filterInvoiceOptions(
                        businessFieldOptions,
                        searchInvoiceOption,
                      )}
                      getKey={(option) => option.value}
                      renderItem={(option) => option.label}
                      onSelect={(option) => {
                        setBusinessField(option.value);
                        setSearchInvoiceOption("");
                        setOpenInvoiceOption(null);
                      }}
                      emptyText="Bidang usaha tidak ditemukan."
                      debounceDelay={0}
                    />
                  </div>

                  <div className="grid min-w-0 grid-cols-[110px_minmax(0,1fr)] items-center gap-3">
                    <FieldLabel>
                      Jenis Usaha{" "}
                      <span className="text-xs text-red-500">*</span>
                    </FieldLabel>
                    <SearchablePopover<InvoiceSearchOption>
                      open={openInvoiceOption === "businessType"}
                      onOpenChange={(open) =>
                        setOpenInvoiceOption(open ? "businessType" : null)
                      }
                      search={searchInvoiceOption}
                      onSearchChange={setSearchInvoiceOption}
                      placeholder="Pilih jenis usaha"
                      selectedLabel={
                        businessTypeOptions.find(
                          (option) => option.value === businessType,
                        )?.label ?? null
                      }
                      selectedKey={businessType || null}
                      items={filterInvoiceOptions(
                        businessTypeOptions,
                        searchInvoiceOption,
                      )}
                      getKey={(option) => option.value}
                      renderItem={(option) => option.label}
                      onSelect={(option) => {
                        setBusinessType(option.value);
                        setSearchInvoiceOption("");
                        setOpenInvoiceOption(null);
                      }}
                      emptyText="Jenis usaha tidak ditemukan."
                      debounceDelay={0}
                    />
                  </div>
                </div>
              </div>
            )}

            {(customerSegment === "Edukasi" || invoiceSegment === "edukasi") && (
              <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-slate-100 px-5 py-4 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="grid grid-cols-1 items-center gap-4 xl:grid-cols-[repeat(4,minmax(0,1fr))] xl:gap-6">
                  <div className="grid min-w-0 grid-cols-[110px_minmax(0,1fr)] items-center gap-3">
                    <FieldLabel>
                      Jenis <span className="text-xs text-red-500">*</span>
                    </FieldLabel>
                    <Select
                      value={jenisGroup}
                      onValueChange={(value) => setJenisGroup(value ?? "")}
                    >
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="Pilih jenis" />
                      </SelectTrigger>
                      <SelectContent align="start" alignItemWithTrigger={false}>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="nonformal">Non-Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid min-w-0 grid-cols-[110px_minmax(0,1fr)] items-center gap-3">
                    <FieldLabel>
                      Jenjang <span className="text-xs text-red-500">*</span>
                    </FieldLabel>
                    <SearchablePopover<InvoiceSearchOption>
                      open={openInvoiceOption === "educationLevel"}
                      onOpenChange={(open) =>
                        setOpenInvoiceOption(open ? "educationLevel" : null)
                      }
                      search={searchInvoiceOption}
                      onSearchChange={setSearchInvoiceOption}
                      placeholder="Pilih jenjang"
                      selectedLabel={
                        educationLevelOptions.find(
                          (option) => option.value === jenjang,
                        )?.label ?? null
                      }
                      selectedKey={jenjang || null}
                      items={filterInvoiceOptions(
                        educationLevelOptions,
                        searchInvoiceOption,
                      )}
                      getKey={(option) => option.value}
                      renderItem={(option) => option.label}
                      onSelect={(option) => {
                        setJenjang(option.value);
                        if (statusGroup !== "swasta") {
                          setGroupName(
                            buildEducationGroupName(
                              option.value,
                              statusGroup,
                              nomorGroup,
                            ),
                          );
                        }
                        setSearchInvoiceOption("");
                        setOpenInvoiceOption(null);
                      }}
                      emptyText="Jenjang tidak ditemukan."
                      debounceDelay={0}
                    />
                  </div>

                  <div className="grid min-w-0 grid-cols-[110px_minmax(0,1fr)] items-center gap-3">
                    <FieldLabel>
                      Status <span className="text-xs text-red-500">*</span>
                    </FieldLabel>
                    <SearchablePopover<InvoiceSearchOption>
                      open={openInvoiceOption === "educationStatus"}
                      onOpenChange={(open) =>
                        setOpenInvoiceOption(open ? "educationStatus" : null)
                      }
                      search={searchInvoiceOption}
                      onSearchChange={setSearchInvoiceOption}
                      placeholder="Pilih status"
                      selectedLabel={
                        educationStatusOptions.find(
                          (option) => option.value === statusGroup,
                        )?.label ?? null
                      }
                      selectedKey={statusGroup || null}
                      items={filterInvoiceOptions(
                        educationStatusOptions,
                        searchInvoiceOption,
                      )}
                      getKey={(option) => option.value}
                      renderItem={(option) => option.label}
                      onSelect={(option) => {
                        setStatusGroup(option.value);
                        setGroupName(
                          option.value === "swasta"
                            ? ""
                            : buildEducationGroupName(
                                jenjang,
                                option.value,
                                nomorGroup,
                              ),
                        );
                        setSearchInvoiceOption("");
                        setOpenInvoiceOption(null);
                      }}
                      emptyText="Status tidak ditemukan."
                      debounceDelay={0}
                    />
                  </div>

                  <div className="grid min-w-0 grid-cols-[110px_minmax(0,1fr)] items-center gap-3">
                    <FieldLabel>
                      Nomor <span className="text-xs text-red-500">*</span>
                    </FieldLabel>
                    <SearchablePopover<InvoiceSearchOption>
                      open={openInvoiceOption === "groupNumber"}
                      onOpenChange={(open) =>
                        setOpenInvoiceOption(open ? "groupNumber" : null)
                      }
                      search={searchInvoiceOption}
                      onSearchChange={setSearchInvoiceOption}
                      placeholder="Pilih nomor"
                      selectedLabel={
                        groupNumberOptions.find(
                          (option) => option.value === nomorGroup,
                        )?.label ?? null
                      }
                      selectedKey={nomorGroup || null}
                      items={filterInvoiceOptions(
                        groupNumberOptions,
                        searchInvoiceOption,
                      )}
                      getKey={(option) => option.value}
                      renderItem={(option) => option.label}
                      onSelect={(option) => {
                        setNomorGroup(option.value);
                        if (statusGroup !== "swasta") {
                          setGroupName(
                            buildEducationGroupName(
                              jenjang,
                              statusGroup,
                              option.value,
                            ),
                          );
                        }
                        setSearchInvoiceOption("");
                        setOpenInvoiceOption(null);
                      }}
                      emptyText="Nomor tidak ditemukan."
                      debounceDelay={0}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="space-y-4 [&_[data-slot=field]]:!grid [&_[data-slot=field]]:!grid-cols-[160px_minmax(0,1fr)] [&_[data-slot=field]]:!items-center [&_[data-slot=field]]:!gap-3 [&_[data-slot=field]_button]:!h-10 [&_[data-slot=field]_[data-slot=input]]:!h-10">
                  <Field orientation="horizontal">
                    <FieldLabel>
                      Nama Group <span className="text-xs text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      className="h-10"
                      placeholder="Masukkan nama group"
                      value={groupName}
                      onChange={(event) => setGroupName(event.target.value)}
                    />
                  </Field>
                  <Field orientation="horizontal">
                    <FieldLabel>
                      Provinsi <span className="text-xs text-red-500">*</span>
                    </FieldLabel>

                    <div className="min-w-0 space-y-1">
                      <SearchablePopover<Province>
                        open={openGroupProvince}
                        onOpenChange={setOpenGroupProvince}
                        search={searchGroupProvince}
                        onSearchChange={setSearchGroupProvince}
                        placeholder={
                          provinceLoading
                            ? "Memuat provinsi..."
                            : "Pilih provinsi"
                        }
                        selectedLabel={selectedGroupProvince?.name ?? null}
                        selectedKey={
                          groupProvinceId !== null
                            ? String(groupProvinceId)
                            : null
                        }
                        items={filteredGroupProvinces}
                        getKey={(province) => String(province.id)}
                        renderItem={(province) => province.name}
                        onSelect={(province) =>
                          handleGroupProvinceChange(province.id)
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
                        <p className="text-sm text-red-500">{provinceError}</p>
                      )}
                    </div>
                  </Field>

                  <Field orientation="horizontal">
                    <FieldLabel>
                      Kota <span className="text-xs text-red-500">*</span>
                    </FieldLabel>
                    <SearchablePopover<City>
                      open={openGroupCity}
                      onOpenChange={setOpenGroupCity}
                      search={searchGroupCity}
                      onSearchChange={setSearchGroupCity}
                      placeholder={
                        groupProvinceId === null
                          ? "Pilih provinsi terlebih dahulu"
                          : groupCitiesLoading
                            ? "Memuat kota..."
                            : "Pilih kota"
                      }
                      selectedLabel={selectedGroupCity?.name ?? null}
                      selectedKey={
                        groupCityId !== null ? String(groupCityId) : null
                      }
                      items={filteredGroupCities}
                      getKey={(city) => String(city.id)}
                      renderItem={(city) => city.name}
                      onSelect={(city) => {
                        setGroupCityId(city.id);
                        setSearchGroupCity("");
                        setOpenGroupCity(false);
                      }}
                      disabled={
                        groupProvinceId === null ||
                        groupCitiesLoading ||
                        provinceLoading
                      }
                      emptyText="Kota tidak ditemukan."
                      debounceDelay={500}
                    />
                  </Field>
                </div>

                <div className="space-y-4 [&_[data-slot=field]]:!grid [&_[data-slot=field]]:!grid-cols-[160px_minmax(0,1fr)] [&_[data-slot=field]]:!items-center [&_[data-slot=field]]:!gap-3 [&_[data-slot=field]_[data-slot=input]]:!h-10">
                  <Field orientation="horizontal">
                    <FieldLabel>
                      Tanggal Kedatangan{" "}
                      <span className="text-xs text-red-500">*</span>
                    </FieldLabel>
                    <DateRangePicker
                      mode="single"
                      value={arrivalDate}
                      onChange={setArrivalDate}
                    />
                  </Field>

                  <Field orientation="horizontal">
                    <FieldLabel>
                      Nama Pelanggan{" "}
                      <span className="text-xs text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      className="h-10"
                      placeholder="Masukkan nama pelanggan"
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                    />
                  </Field>

                  <Field orientation="horizontal">
                    <FieldLabel>
                      Kontak Pelanggan{" "}
                      <span className="text-xs text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      className="h-10"
                      placeholder="Masukkan nomor kontak pelanggan"
                      value={customerContact}
                      onChange={(event) =>
                        setCustomerContact(event.target.value)
                      }
                    />
                  </Field>
                </div>
              </div>
            </div>
          </div>
        </DetailSection>

        <DetailSection
          icon={Users}
          title="Detail Pesanan"
          variant="orange"
          action={
            <Button
              variant="primer"
              size="lg"
              onClick={() => setOpenCreateDetailInvoice(true)}
            >
              <Plus size={16} />
             Tambah
            </Button>
          }
        >
          <div className="p-5">
            <DetailOrderTable />
          </div>
        </DetailSection>
        <CreateDetailInvoice
          open={openCreateDetailInvoice}
          onClose={() => setOpenCreateDetailInvoice(false)}
        />
      </DetailPageLayout>
    </>
  );
}
