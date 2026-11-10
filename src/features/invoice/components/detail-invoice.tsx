import DetailActionFooter, {
  type DetailAction,
} from "@/components/detail-page/detail-action-footer";
import DetailPageLayout from "@/components/detail-page/detail-page-ayout";
import DetailSection from "@/components/detail-page/detail-section";
import Swal from "sweetalert2";
import { toast } from "@/components/ui/toast";
import SearchablePopover from "@/components/searchable-popover";
import DateRangePicker from "@/components/date-range-picker";
import DetailOrderTable from "./detail-order-table";
import PaymentInformation from "./payment-information";
import CreateDetailInvoice from "./create-detail-order";
import {
  businessFieldOptions,
  businessTypeOptions,
  buildEducationGroupName,
  educationLevelOptions,
  educationStatusOptions,
  filterInvoiceOptions,
  groupNumberOptions,
  STATIC_INVOICE_SEGMENT_IDS,
  type InvoiceSearchOption,
} from "./invoice-form-options";
import type { InvoiceOrder } from "../types/invoice-order";
import CustomerSuggestionField from "@/features/customers/components/customer-suggestion-field";
import useCreateInvoice from "../hooks/use-create-invoice";
import useInvoiceDetail from "../hooks/use-invoice-detail";
import useUpdateInvoice from "../hooks/use-update-invoice";
import type { InvoicePaymentForm } from "../types/invoice";
import type { Agent } from "@/features/master/master-agen/types/master-agen";
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
import { HandCoins, Plus, Signature, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaSave } from "react-icons/fa";
import { FaDownload, FaFileInvoice } from "react-icons/fa6";
import { MdWorkHistory } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import useMasterAgent from "@/features/master/master-agen/hooks/use-master-agen";

type InvoiceFormPageProps = { mode: "create" | "detail" };

type InvoiceFormData = {
  orderItems: InvoiceOrder[];
  provinceId: number | null;
  cityId: number | null;
  selectedKaryawan: Karyawan | null;
  partnerId: number | null;
  customerSegment: string;
  invoiceSegment: string;
  travelAgent: string;
  businessField: string;
  businessType: string;
  jenisGroup: string;
  jenjang: string;
  statusGroup: string;
  nomorGroup: string;
  groupName: string;
  customerId: number | null;
  groupProvinceId: number | null;
  groupCityId: number | null;
  arrivalDate: Date | undefined;
  customerName: string;
  customerContact: string;
};

const toDate = (value: string | null | undefined) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export default function DetailInvoice({ mode }: InvoiceFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [openCreateDetailInvoice, setOpenCreateDetailInvoice] = useState(false);
  const [formData, setFormData] = useState<InvoiceFormData>({
    orderItems: [],
    provinceId: null,
    cityId: null,
    selectedKaryawan: null,
    partnerId: null,
    customerSegment: "",
    invoiceSegment: "",
    travelAgent: "",
    businessField: "",
    businessType: "",
    jenisGroup: "",
    jenjang: "",
    statusGroup: "",
    nomorGroup: "",
    groupName: "",
    customerId: null,
    groupProvinceId: null,
    groupCityId: null,
    arrivalDate: undefined,
    customerName: "",
    customerContact: "",
  });
  const pendingCustomerLocation = useRef<{
    provinceId: number | null;
    provinceName: string;
    cityName: string;
    loadingStarted: boolean;
  } | null>(null);
  const pendingAgentLocation = useRef<{
    provinceId: number | null;
    provinceName: string;
    cityName: string;
    waitForCities: boolean;
    loadingStarted: boolean;
  } | null>(null);
  const {
    provinces,
    loading: provinceLoading,
    error: provinceError,
  } = useProvinces();
  const [openKaryawan, setOpenKaryawan] = useState(false);
  const [openInvoiceOption, setOpenInvoiceOption] = useState<string | null>(
    null,
  );
  const [searchInvoiceOption, setSearchInvoiceOption] = useState("");
  const [openGroupProvince, setOpenGroupProvince] = useState(false);
  const [openGroupCity, setOpenGroupCity] = useState(false);
  const [searchGroupProvince, setSearchGroupProvince] = useState("");
  const [searchGroupCity, setSearchGroupCity] = useState("");
  const [hasPaymentProof, setHasPaymentProof] = useState(false);
  const [paymentForm, setPaymentForm] = useState<InvoicePaymentForm>({
    paymentDate: undefined,
    paymentType: "dp",
    paymentMethod: "",
    accountHolderName: "",
    depositNumber: "",
    fromBank: "",
    toBank: "",
    amount: "",
    notes: "",
    proofFiles: [],
  });
  const {
    invoice: invoiceData,
    loading: invoiceLoading,
    // error: invoiceError,
  } = useInvoiceDetail(mode === "detail" ? id : undefined);
  const createInvoiceMutation = useCreateInvoice();
  const updateInvoiceMutation = useUpdateInvoice();
  const saving = createInvoiceMutation.loading || updateInvoiceMutation.loading;
  

  // Set form data when invoice data is loaded
  useEffect(() => {
    if (!invoiceData) return;
    setFormData((current) => ({
      ...current,
      customerName: invoiceData.customer_name ?? "",
      groupName: invoiceData.customer_name ?? "",
      customerId: invoiceData.customer_id,
      partnerId: invoiceData.partner_id,
      travelAgent: invoiceData.partner_name ?? "",
      arrivalDate: toDate(invoiceData.arrival_date),
      orderItems: (invoiceData.items ?? []).map((item) => ({
        id: item.id,
        productId: item.product_id ?? 0,
        product: item.product_name,
        description: item.product_description ?? "",
        quantity: Number(item.quantity) || 0,
        compliment: Number(item.bonus_quantity) || 0,
        unitPrice: Number(item.unit_price) || 0,
        discountPrice: Number(item.discount_amount) || 0,
        subtotal: Number(item.subtotal) || 0,
      })),
    }));
    setHasPaymentProof(
      (invoiceData.payments ?? []).some((payment) => payment.proof_of_payment),
    );
    const payment = invoiceData.payments?.[0];
    setPaymentForm({
      paymentDate: toDate(payment?.payment_date),
      paymentType: payment?.payment_type ?? "dp",
      paymentMethod: payment?.payment_method ?? "",
      accountHolderName: payment?.account_holder_name ?? "",
      depositNumber: "",
      fromBank: payment?.from_bank ?? "",
      toBank: payment?.to_bank ?? "",
      amount:
        payment?.amount !== null && payment?.amount !== undefined
          ? String(payment.amount)
          : "",
      notes: payment?.notes ?? "",
      proofFiles: [],
    });
  }, [invoiceData]);
  // Set form data when province data is loaded

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
  const defaultSalesName =
    mode === "create" ? localStorage.getItem("namakaryawan") : null;
  const selectedSales =
    formData.selectedKaryawan ??
    karyawan.find(
      (employee) => employee.id_absen === invoiceData?.sales_person_id,
    ) ??
    eligibleKaryawan.find((employee) => employee.name === defaultSalesName) ??
    null;

  // Get nama sales end

  // Get nama travel agent start
  const {
    agents,
    loading: loadingAgents,
    error: agentsError,
    search: searchAgent,
    setSearch: setSearchAgent,
  } = useMasterAgent({ is_active: "1" });
  const [openTravelAgent, setOpenTravelAgent] = useState(false);
  // Get nama travel agent end

  // Handle get provinsi dan kota start
  const [openProvince, setOpenProvince] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [searchProvince, setSearchProvince] = useState("");
  const [searchCity, setSearchCity] = useState("");

  const { cities, loading: citiesLoading } = useCities(formData.provinceId);
  const { cities: groupCities, loading: groupCitiesLoading } = useCities(
    formData.groupProvinceId,
  );

  useEffect(() => {
    const pendingLocation = pendingAgentLocation.current;
    if (!pendingLocation) return;

    if (pendingLocation.provinceId === null) {
      const province = provinces.find(
        (item) =>
          item.name.toLowerCase().trim() ===
          pendingLocation.provinceName.toLowerCase().trim(),
      );
      if (!province) return;

      pendingLocation.provinceId = province.id;
      pendingLocation.waitForCities = true;
      setFormData((current) => ({
        ...current,
        provinceId: province.id,
        cityId: null,
      }));
      return;
    }

    if (formData.provinceId !== pendingLocation.provinceId) return;
    if (!pendingLocation.cityName) {
      pendingAgentLocation.current = null;
      return;
    }

    if (citiesLoading) {
      pendingLocation.loadingStarted = true;
      return;
    }
    if (
      pendingLocation.waitForCities &&
      !pendingLocation.loadingStarted
    ) {
      return;
    }

    const city = cities.find(
      (item) =>
        item.name.toLowerCase().trim() ===
        pendingLocation.cityName.toLowerCase().trim(),
    );
    if (city) {
      setFormData((current) => ({ ...current, cityId: city.id }));
    }
    pendingAgentLocation.current = null;
  }, [cities, citiesLoading, formData.provinceId, provinces]);

  useEffect(() => {
    const pendingLocation = pendingCustomerLocation.current;
    if (!pendingLocation) return;

    if (pendingLocation.provinceId === null) {
      const province = provinces.find(
        (item) =>
          item.name.toLowerCase().trim() ===
          pendingLocation.provinceName.toLowerCase().trim(),
      );
      if (!province) return;

      pendingLocation.provinceId = province.id;
      setFormData((current) => ({
        ...current,
        groupProvinceId: province.id,
        groupCityId: null,
      }));
      return;
    }

    if (formData.groupProvinceId !== pendingLocation.provinceId) return;

    if (!pendingLocation.cityName) {
      pendingCustomerLocation.current = null;
      return;
    }

    if (groupCitiesLoading) {
      pendingLocation.loadingStarted = true;
      return;
    }

    if (!pendingLocation.loadingStarted || groupCities.length === 0) return;

    const city = groupCities.find(
      (item) =>
        item.name.toLowerCase().trim() ===
        pendingLocation.cityName.toLowerCase().trim(),
    );
    if (city) {
      setFormData((current) => ({ ...current, groupCityId: city.id }));
    }
    pendingCustomerLocation.current = null;
  }, [formData.groupProvinceId, groupCities, groupCitiesLoading, provinces]);

  const selectedProvince = provinces.find(
    (province) => province.id === formData.provinceId,
  );

  const selectedCity = cities.find((city) => city.id === formData.cityId);

  const filteredProvinces = provinces.filter((province) =>
    province.name.toLowerCase().includes(searchProvince.toLowerCase().trim()),
  );

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(searchCity.toLowerCase().trim()),
  );
  const selectedGroupProvince = provinces.find(
    (province) => province.id === formData.groupProvinceId,
  );
  const selectedGroupCity = groupCities.find(
    (city) => city.id === formData.groupCityId,
  );
  const filteredGroupProvinces = provinces.filter((province) =>
    province.name
      .toLowerCase()
      .includes(searchGroupProvince.toLowerCase().trim()),
  );
  const filteredGroupCities = groupCities.filter((city) =>
    city.name.toLowerCase().includes(searchGroupCity.toLowerCase().trim()),
  );

  const handleProvinceChange = (id: number | null) => {
    if (id !== formData.provinceId) {
      setFormData((current) => ({
        ...current,
        provinceId: id,
        cityId: null,
      }));
    }

    setSearchProvince("");
    setSearchCity("");
    setOpenProvince(false);
    setOpenCity(false);
  };

  const handleCityChange = (id: number | null) => {
    setFormData((current) => ({ ...current, cityId: id }));
    setSearchCity("");
    setOpenCity(false);
  };

  const handleGroupProvinceChange = (id: number | null) => {
    pendingCustomerLocation.current = null;
    if (id !== formData.groupProvinceId) {
      setFormData((current) => ({
        ...current,
        groupProvinceId: id,
        groupCityId: null,
      }));
    }

    setSearchGroupProvince("");
    setSearchGroupCity("");
    setOpenGroupProvince(false);
    setOpenGroupCity(false);
  };
  // Handle get provinsi dan kota end

  // Handle save start
  const handleSave = async () => {
    if (saving) return;
    if (
      !formData.customerId &&
      (!formData.groupName.trim() || !selectedGroupProvince || !selectedGroupCity)
    ) {
      toast.add({
        title: "Data customer belum lengkap",
        description:
          "Isi nama group, provinsi, dan kota sebelum menyimpan invoice.",
        type: "error",
        timeout: 5000,
      });
      return;
    }

    const confirmation = await Swal.fire({
      title: "Konfirmasi Simpan",
      text:
        mode === "create"
          ? "Yakin ingin menambahkan invoice ini?"
          : "Yakin ingin menyimpan perubahan invoice ini?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Simpan",
      confirmButtonColor: "#107254",
      cancelButtonText: "Batal",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });
    if (!confirmation.isConfirmed) return;

    createInvoiceMutation.clearError();
    updateInvoiceMutation.clearError();
    const payload = new FormData();
    const customerId = formData.customerId;
    if (customerId) {
      payload.append("customer_id", String(customerId));
    } else {
      payload.append("customer[name]", formData.groupName.trim());
      payload.append("customer[phone]", formData.customerContact);
      payload.append(
        "customer[province_name]",
        selectedGroupProvince?.name ?? "",
      );
      payload.append("customer[city_name]", selectedGroupCity?.name ?? "");
      payload.append(
        "customer[segment_id]",
        String(STATIC_INVOICE_SEGMENT_IDS.segmentId),
      );
      payload.append(
        "customer[segment_detail_id]",
        String(STATIC_INVOICE_SEGMENT_IDS.segmentDetailId),
      );
    }

    const hasPaymentInput = Boolean(
      paymentForm.paymentDate ||
        paymentForm.paymentMethod ||
        paymentForm.accountHolderName.trim() ||
        paymentForm.fromBank ||
        paymentForm.toBank ||
        paymentForm.amount.trim() ||
        paymentForm.notes.trim() ||
        paymentForm.proofFiles.length,
    );
    if (hasPaymentInput) {
      if (
        !paymentForm.paymentDate ||
        !paymentForm.paymentMethod ||
        Number(paymentForm.amount) <= 0
      ) {
        toast.add({
          title: "Informasi pembayaran belum lengkap",
          description:
            "Isi tanggal bayar, metode bayar, dan jumlah pembayaran sebelum menyimpan.",
          type: "error",
          timeout: 5000,
        });
        return;
      }

      payload.append(
        "payment[payment_date]",
        paymentForm.paymentDate.toISOString(),
      );
      payload.append("payment[payment_type]", paymentForm.paymentType || "dp");
      payload.append("payment[payment_method]", paymentForm.paymentMethod);
      payload.append(
        "payment[account_holder_name]",
        paymentForm.accountHolderName,
      );
      payload.append("payment[from_bank]", paymentForm.fromBank);
      payload.append("payment[to_bank]", paymentForm.toBank);
      payload.append("payment[amount]", paymentForm.amount);
      payload.append("payment[notes]", paymentForm.notes);
      paymentForm.proofFiles.forEach((file) => {
        payload.append("payment[proof_of_payment]", file);
      });
    }
    payload.append(
      "partner_id",
      String(formData.partnerId),
    );
    payload.append("segment_id", String(STATIC_INVOICE_SEGMENT_IDS.segmentId));
    payload.append(
      "segment_detail_id",
      String(STATIC_INVOICE_SEGMENT_IDS.segmentDetailId),
    );
    // payload.append("sub_segment_detail_id", String(STATIC_INVOICE_SEGMENT_IDS.subSegmentDetailId));
    payload.append(
      "invoice_date",
      invoiceData?.invoice_date ?? new Date().toISOString(),
    );
    if (formData.arrivalDate)
      payload.append("arrival_date", formData.arrivalDate.toISOString());
    formData.orderItems.forEach((order, index) => {
      const item = `items[${index}]`;
      payload.append(`${item}[product_id]`, String(order.productId || ""));
      payload.append(`${item}[product_name]`, order.product);
      payload.append(`${item}[product_description]`, order.description);
      payload.append(`${item}[quantity]`, String(order.quantity));
      payload.append(`${item}[bonus_quantity]`, String(order.compliment ?? 0));
      payload.append(`${item}[unit_price]`, String(order.unitPrice));
      payload.append(`${item}[discount_amount]`, String(order.discountPrice));
      payload.append(`${item}[subtotal]`, String(order.subtotal));
    });

    try {
      if (mode === "create") {
        const created = await createInvoiceMutation.submit(payload);
        toast.add({
          title: "Invoice berhasil dibuat",
          description: "Invoice baru berhasil disimpan.",
          type: "success",
          timeout: 4000,
        });
        navigate(`/invoice/detail/${created.id}`, { replace: true });
      } else if (id) {
        await updateInvoiceMutation.submit(id, payload);
        toast.add({
          title: "Invoice berhasil diperbarui",
          description: "Perubahan invoice berhasil disimpan.",
          type: "success",
          timeout: 4000,
        });
      } else {
        throw new Error("ID invoice tidak ditemukan untuk memperbarui data.");
      }
    } catch (error) {
      toast.add({
        title: "Invoice gagal disimpan",
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menyimpan invoice.",
        type: "error",
        timeout: 6000,
      });
    }
  };
  // Handle save end

  // Handle actions start
  const actions: DetailAction[] = [
    {
      id: "save",
      label: saving ? "Menyimpan..." : "Save",
      icon: <FaSave size={15} />,
      variant: "primer",
      mobileColor: "bg-primer-60",
      position: "right",
      disabled: saving || invoiceLoading,
      onClick: handleSave,
    },
  ];

  if (mode === "detail" && invoiceData?.status == "partially_paid")
    actions.push({
      id: "submit",
      label: "Submit",
      icon: <FaSave size={15} />,
      variant: "primer",
      mobileColor: "bg-primer-60",
      position: "right",
    });
  if (mode === "detail" && status)
    actions.push({
      id: "approve",
      label: "Approve",
      icon: <Signature size={15} />,
      variant: "primer",
      mobileColor: "bg-primer-60",
      position: "right",
    });

  if (mode === "detail")
    actions.push({
      id: "download",
      label: "Download",
      icon: <FaDownload size={15} />,
      variant: "blue",
      mobileColor: "bg-blue-600",
      position: "left",
    });
  // Handle actions end

  return (
    <>
      <DetailPageLayout
        icon={FaFileInvoice}
        title={mode === "create" ? "Tambah Invoice" : "Invoice"}
        subtitle={
          mode === "create"
            ? "Form menambahkan data invoice"
            : (invoiceData?.invoice_number ?? "")
        }
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
          <div className="grid grid-cols-1 gap-8 p-5 xl:grid-cols-2 [&_[data-slot=field-label]]:!text-xs max-md:[&_[data-slot=field]]:!grid-cols-1 max-md:[&_[data-slot=field]]:!items-stretch max-md:[&_[data-slot=field]]:!gap-1">
            {/* Informasi Umum Pelanggan */}
            <div className="space-y-4 [&_[data-slot=field]]:!grid [&_[data-slot=field]]:!grid-cols-[140px_minmax(0,1fr)] [&_[data-slot=field]]:!items-center [&_[data-slot=field]]:!gap-3 [&_[data-slot=field]_button]:!h-10 [&_[data-slot=field]_[data-slot=input]]:!h-10">
              {mode !== "create" && (
                <Field orientation="horizontal">
                  <FieldLabel>Nomor Invoice</FieldLabel>
                  <Input
                    placeholder={invoiceData?.invoice_number ?? "Nomor Invoice"}
                    disabled
                  />
                </Field>
              )}
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
                  selectedLabel={
                    selectedSales?.name ??
                    invoiceData?.sales_person_name ??
                    defaultSalesName
                  }
                  selectedKey={
                    selectedSales?.id_absen ??
                    invoiceData?.sales_person_id ??
                    null
                  }
                  items={eligibleKaryawan}
                  getKey={(item) => item.id_absen}
                  renderItem={(item) => `${item.name}`}
                  onSelect={(item) => {
                    setFormData((current) => ({
                      ...current,
                      selectedKaryawan: item,
                    }));
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
            </div>

            <div className="space-y-4 [&_[data-slot=field]]:!grid [&_[data-slot=field]]:!grid-cols-[140px_minmax(0,1fr)] [&_[data-slot=field]]:!items-center [&_[data-slot=field]]:!gap-3 [&_[data-slot=field]_button]:!h-10 [&_[data-slot=field]_[data-slot=input]]:!h-10">
              {mode !== "create" && (
                <Field orientation="horizontal">
                  <FieldLabel>Input Date</FieldLabel>
                  <Input
                    placeholder={invoiceData?.invoice_date ?? "Input Date"}
                    disabled
                  />
                </Field>
              )}

              <Field orientation="horizontal">
                <FieldLabel>
                  Segmen <span className="text-xs text-red-500">*</span>
                </FieldLabel>

                <Select
                  value={formData.invoiceSegment}
                  onValueChange={(value) => {
                    const nextValue = value ?? "";
                    setFormData((current) => ({
                      ...current,
                      invoiceSegment: nextValue,
                      customerSegment: "",
                      businessField: "",
                      businessType: "",
                      jenisGroup: "",
                      jenjang: "",
                      statusGroup: "",
                      nomorGroup: "",
                      travelAgent:
                        nextValue !== "travel" ? "" : current.travelAgent,
                      partnerId:
                        nextValue !== "travel" ? null : current.partnerId,
                    }));
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
            {formData.invoiceSegment === "travel" && (
              <>
                <div className="space-y-4 [&_[data-slot=field]]:!grid [&_[data-slot=field]]:!grid-cols-[140px_minmax(0,1fr)] [&_[data-slot=field]]:!items-center [&_[data-slot=field]]:!gap-3 [&_[data-slot=field]_button]:!h-10 [&_[data-slot=field]_[data-slot=input]]:!h-10">
                  <Field orientation="horizontal">
                    <FieldLabel>
                      Nama Travel/Agent{" "}
                      <span className="text-xs text-red-500">*</span>
                    </FieldLabel>

                    <SearchablePopover<Agent>
                      open={openTravelAgent}
                      onOpenChange={setOpenTravelAgent}
                      search={searchAgent}
                      onSearchChange={setSearchAgent}
                      placeholder={
                        loadingAgents
                          ? "Memuat agen..."
                          : "Pilih nama travel/agent"
                      }
                      selectedLabel={
                        formData.travelAgent ||
                        invoiceData?.partner_name ||
                        null
                      }
                      selectedKey={
                        formData.partnerId !== null
                          ? String(formData.partnerId)
                          : invoiceData?.partner_id
                            ? String(invoiceData.partner_id)
                            : null
                      }
                      items={agents}
                      getKey={(agent) => String(agent.id)}
                      renderItem={(agent) => agent.name}
                      onSelect={(agent) => {
                        const provinceName =
                          (typeof agent.province === "string"
                            ? agent.province
                            : agent.province?.name) || agent.province_name;
                        const cityName =
                          (typeof agent.city === "string"
                            ? agent.city
                            : agent.city?.name) || agent.city_name;
                        const province = provinces.find(
                          (item) =>
                            item.name.toLowerCase().trim() ===
                            provinceName.toLowerCase().trim(),
                        );

                        pendingAgentLocation.current = provinceName
                          ? {
                              provinceId: province?.id ?? null,
                              provinceName,
                              cityName,
                              waitForCities:
                                !province ||
                                province.id !== formData.provinceId,
                              loadingStarted: false,
                            }
                          : null;
                        setFormData((current) => ({
                          ...current,
                          travelAgent: agent.name,
                          partnerId: agent.id,
                          ...(provinceName && {
                            provinceId: province?.id ?? null,
                            cityId: null,
                          }),
                        }));
                        setSearchProvince("");
                        setSearchCity("");
                        setOpenProvince(false);
                        setOpenCity(false);
                        setSearchAgent("");
                        setOpenTravelAgent(false);
                      }}
                      emptyText={
                        loadingAgents
                          ? "Memuat data agen..."
                          : (agentsError ?? "Agen tidak ditemukan.")
                      }
                      debounceDelay={500}
                    />
                  </Field>

                  <Field orientation="horizontal">
                    <FieldLabel>
                      Cust Segmen{" "}
                      <span className="text-xs text-red-500">*</span>
                    </FieldLabel>

                    <Select
                      value={formData.customerSegment}
                      onValueChange={(value: string | null) => {
                        if (value !== null) {
                          setFormData((current) => ({
                            ...current,
                            customerSegment: value,
                            ...(value !== "Corporate" && {
                              businessField: "",
                              businessType: "",
                            }),
                          }));
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
                          formData.provinceId !== null
                            ? String(formData.provinceId)
                            : null
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
                        formData.provinceId === null
                          ? "Pilih provinsi terlebih dahulu"
                          : citiesLoading
                            ? "Memuat kota..."
                            : "Pilih kota/kabupaten"
                      }
                      selectedLabel={selectedCity?.name ?? null}
                      selectedKey={
                        formData.cityId !== null
                          ? String(formData.cityId)
                          : null
                      }
                      items={filteredCities}
                      getKey={(city) => String(city.id)}
                      renderItem={(city) => city.name}
                      onSelect={(city) => handleCityChange(city.id)}
                      disabled={
                        formData.provinceId === null ||
                        citiesLoading ||
                        provinceLoading
                      }
                      emptyText="Kota/kabupaten tidak ditemukan."
                      debounceDelay={500}
                    />
                  </Field>
                </div>
              </>
            )}

            {(formData.customerSegment === "Corporate" ||
              formData.invoiceSegment === "corporate") && (
              <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-slate-100 px-5 py-4 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="grid grid-cols-1 items-center gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(240px,0.9fr)] xl:gap-6">
                  <div className="grid min-w-0 grid-cols-1 items-start gap-1 md:grid-cols-[110px_minmax(0,1fr)] md:items-center md:gap-3">
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
                          (option) => option.value === formData.businessField,
                        )?.label ?? null
                      }
                      selectedKey={formData.businessField || null}
                      items={filterInvoiceOptions(
                        businessFieldOptions,
                        searchInvoiceOption,
                      )}
                      getKey={(option) => option.value}
                      renderItem={(option) => option.label}
                      onSelect={(option) => {
                        setFormData((current) => ({
                          ...current,
                          businessField: option.value,
                        }));
                        setSearchInvoiceOption("");
                        setOpenInvoiceOption(null);
                      }}
                      emptyText="Bidang usaha tidak ditemukan."
                      debounceDelay={0}
                    />
                  </div>

                  <div className="grid min-w-0 grid-cols-1 items-start gap-1 md:grid-cols-[110px_minmax(0,1fr)] md:items-center md:gap-3">
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
                          (option) => option.value === formData.businessType,
                        )?.label ?? null
                      }
                      selectedKey={formData.businessType || null}
                      items={filterInvoiceOptions(
                        businessTypeOptions,
                        searchInvoiceOption,
                      )}
                      getKey={(option) => option.value}
                      renderItem={(option) => option.label}
                      onSelect={(option) => {
                        setFormData((current) => ({
                          ...current,
                          businessType: option.value,
                        }));
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

            {(formData.customerSegment === "Edukasi" ||
              formData.invoiceSegment === "edukasi") && (
              <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-slate-100 px-5 py-4 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="grid grid-cols-1 items-center gap-4 xl:grid-cols-[repeat(4,minmax(0,1fr))] xl:gap-6">
                  <div className="grid min-w-0 grid-cols-1 items-start gap-1 md:grid-cols-[110px_minmax(0,1fr)] md:items-center md:gap-3">
                    <FieldLabel>
                      Jenis <span className="text-xs text-red-500">*</span>
                    </FieldLabel>
                    <Select
                      value={formData.jenisGroup}
                      onValueChange={(value) =>
                        setFormData((current) => ({
                          ...current,
                          jenisGroup: value ?? "",
                        }))
                      }
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

                  <div className="grid min-w-0 grid-cols-1 items-start gap-1 md:grid-cols-[110px_minmax(0,1fr)] md:items-center md:gap-3">
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
                          (option) => option.value === formData.jenjang,
                        )?.label ?? null
                      }
                      selectedKey={formData.jenjang || null}
                      items={filterInvoiceOptions(
                        educationLevelOptions,
                        searchInvoiceOption,
                      )}
                      getKey={(option) => option.value}
                      renderItem={(option) => option.label}
                      onSelect={(option) => {
                        setFormData((current) => ({
                          ...current,
                          jenjang: option.value,
                          groupName:
                            current.statusGroup !== "swasta"
                              ? buildEducationGroupName(
                                  option.value,
                                  current.statusGroup,
                                  current.nomorGroup,
                                )
                              : current.groupName,
                        }));
                        setSearchInvoiceOption("");
                        setOpenInvoiceOption(null);
                      }}
                      emptyText="Jenjang tidak ditemukan."
                      debounceDelay={0}
                    />
                  </div>

                  <div className="grid min-w-0 grid-cols-1 items-start gap-1 md:grid-cols-[110px_minmax(0,1fr)] md:items-center md:gap-3">
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
                          (option) => option.value === formData.statusGroup,
                        )?.label ?? null
                      }
                      selectedKey={formData.statusGroup || null}
                      items={filterInvoiceOptions(
                        educationStatusOptions,
                        searchInvoiceOption,
                      )}
                      getKey={(option) => option.value}
                      renderItem={(option) => option.label}
                      onSelect={(option) => {
                        setFormData((current) => ({
                          ...current,
                          statusGroup: option.value,
                          groupName:
                            option.value === "swasta"
                              ? ""
                              : buildEducationGroupName(
                                  current.jenjang,
                                  option.value,
                                  current.nomorGroup,
                                ),
                        }));
                        setSearchInvoiceOption("");
                        setOpenInvoiceOption(null);
                      }}
                      emptyText="Status tidak ditemukan."
                      debounceDelay={0}
                    />
                  </div>

                  <div className="grid min-w-0 grid-cols-1 items-start gap-1 md:grid-cols-[110px_minmax(0,1fr)] md:items-center md:gap-3">
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
                          (option) => option.value === formData.nomorGroup,
                        )?.label ?? null
                      }
                      selectedKey={formData.nomorGroup || null}
                      items={filterInvoiceOptions(
                        groupNumberOptions,
                        searchInvoiceOption,
                      )}
                      getKey={(option) => option.value}
                      renderItem={(option) => option.label}
                      onSelect={(option) => {
                        setFormData((current) => ({
                          ...current,
                          nomorGroup: option.value,
                          groupName:
                            current.statusGroup !== "swasta"
                              ? buildEducationGroupName(
                                  current.jenjang,
                                  current.statusGroup,
                                  option.value,
                                )
                              : current.groupName,
                        }));
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
                    <CustomerSuggestionField
                      value={formData.groupName}
                      onChange={(value) =>
                        setFormData((current) => ({
                          ...current,
                          groupName: value,
                          customerId: null,
                        }))
                      }
                      onSelect={(customer) => {
                        const customerProvince = provinces.find(
                          (province) =>
                            province.name.toLowerCase().trim() ===
                            customer.province_name?.toLowerCase().trim(),
                        );
                        const customerCityName = customer.city_name
                          ?.toLowerCase()
                          .trim();
                        const existingCity =
                          customerProvince?.id === formData.groupProvinceId
                            ? groupCities.find(
                                (city) =>
                                  city.name.toLowerCase().trim() ===
                                  customerCityName,
                              )
                            : undefined;

                        pendingCustomerLocation.current = customer.province_name
                          ? {
                              provinceId: customerProvince?.id ?? null,
                              provinceName: customer.province_name,
                              cityName: customer.city_name ?? "",
                              loadingStarted:
                                customerProvince?.id ===
                                  formData.groupProvinceId ||
                                groupCitiesLoading,
                            }
                          : null;
                        setFormData((current) => ({
                          ...current,
                          groupName: customer.name,
                          customerContact: customer.phone ?? "",
                          customerId: customer.id,
                          groupProvinceId: customerProvince?.id ?? null,
                          groupCityId: existingCity?.id ?? null,
                        }));
                      }}
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
                          formData.groupProvinceId !== null
                            ? String(formData.groupProvinceId)
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
                        formData.groupProvinceId === null
                          ? "Pilih provinsi terlebih dahulu"
                          : groupCitiesLoading
                            ? "Memuat kota..."
                            : "Pilih kota"
                      }
                      selectedLabel={selectedGroupCity?.name ?? null}
                      selectedKey={
                        formData.groupCityId !== null
                          ? String(formData.groupCityId)
                          : null
                      }
                      items={filteredGroupCities}
                      getKey={(city) => String(city.id)}
                      renderItem={(city) => city.name}
                      onSelect={(city) => {
                        setFormData((current) => ({
                          ...current,
                          groupCityId: city.id,
                        }));
                        setSearchGroupCity("");
                        setOpenGroupCity(false);
                      }}
                      disabled={
                        formData.groupProvinceId === null ||
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
                      value={formData.arrivalDate}
                      onChange={(date) =>
                        setFormData((current) => ({
                          ...current,
                          arrivalDate: date,
                        }))
                      }
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
                      value={formData.customerName}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          customerName: event.target.value,
                        }))
                      }
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
                      value={formData.customerContact}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          customerContact: event.target.value,
                        }))
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
            <DetailOrderTable data={formData.orderItems} />
          </div>
        </DetailSection>

        {mode === "detail" && (
          <DetailSection
            icon={HandCoins}
            title="Informasi Pembayaran"
            variant="green"
          >
            <PaymentInformation
              totalInvoice={formData.orderItems.reduce(
                (total, order) => total + order.subtotal,
                0,
              )}
              value={paymentForm}
              onChange={setPaymentForm}
              onProofChange={setHasPaymentProof}
            />
          </DetailSection>
        )}

        <CreateDetailInvoice
          open={openCreateDetailInvoice}
          onClose={() => setOpenCreateDetailInvoice(false)}
          onSave={(order) =>
            setFormData((current) => ({
              ...current,
              orderItems: [...current.orderItems, { ...order, id: Date.now() }],
            }))
          }
        />
      </DetailPageLayout>
    </>
  );
}
