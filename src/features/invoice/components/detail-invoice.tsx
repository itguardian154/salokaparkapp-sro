import DetailActionFooter, {
  type DetailAction,
} from "@/components/detail-page/detail-action-footer";
import DetailPageLayout from "@/components/detail-page/detail-page-ayout";
import DetailSection from "@/components/detail-page/detail-section";
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
import { useCities } from "@/features/wilayah/hooks/use-cities";
import { useProvinces } from "@/features/wilayah/hooks/use-provinces";
import type { City, Province } from "@/features/wilayah/types/wilayah";
import { Signature, Users } from "lucide-react";
import { useState } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { FaFileInvoice } from "react-icons/fa6";
import { MdWorkHistory } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function DetailInvoice() {
  const navigate = useNavigate();
  const {
    provinces,
    loading: provinceLoading,
    error: provinceError,
  } = useProvinces();
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);
  const actions: DetailAction[] = [];

  // Handle actions start
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
  // Handle get provinsi dan kota end
  return (
    <>
      <DetailPageLayout
        icon={FaFileInvoice}
        title="Invoice"
        subtitle="Form Invoice"
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
          <div className="p-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Field>
              <FieldLabel>Segmen</FieldLabel>

              <Select value={""} onValueChange={() => ""}>
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

            <Field>
              <FieldLabel>Nama Travel/Agent</FieldLabel>

              <Input
                placeholder="Masukkan nama travel/agent"
                value={""}
                onChange={() => ""}
              />
            </Field>

            <Field>
              <FieldLabel>Provinsi</FieldLabel>

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

              <Field>
                <FieldLabel>Cust Segmen</FieldLabel>

                <Select value={""} onValueChange={() => ""}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih customer segmen"></SelectValue>
                  </SelectTrigger>
                  <SelectContent align="start" alignItemWithTrigger={false}>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="edukasi">Edukasi</SelectItem>
                  </SelectContent>
                </Select>
            </Field>
          </div>
        </DetailSection>
      </DetailPageLayout>
    </>
  );
}
