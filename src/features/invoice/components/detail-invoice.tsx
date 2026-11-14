import DetailActionFooter, {
  type DetailAction,
} from "@/components/detail-page/detail-action-footer";
import DetailPageLayout from "@/components/detail-page/detail-page-ayout";
import DetailSection from "@/components/detail-page/detail-section";
import SROHistoryApproval from "@/components/detail-page/history-approval";
import Swal from "sweetalert2";
import { toast } from "@/components/ui/toast";
import SearchablePopover from "@/components/searchable-popover";
import DateRangePicker from "@/components/date-range-picker";
import DetailOrderTable from "./detail-order-table";
import DetailPaymentTable, {
  type InvoicePaymentRow,
} from "./detail-payment-table";
import CreatePaymentModal from "./create-payment-modal";
import PaymentInformation from "./payment-information";
import CreateDetailInvoice from "./create-detail-order";
import {
  filterInvoiceOptions,
  customerGroupNumberOptions,
  type InvoiceSearchOption,
} from "./invoice-form-options";
import CustomerSuggestionField from "@/features/invoice/components/customer-suggestion-field";
import useCreateInvoice from "../hooks/use-create-invoice";
import useInvoiceDetail from "../hooks/use-invoice-detail";
import useInvoiceApproval, {
  type InvoiceApprovalAction,
} from "../hooks/use-invoice-approval";
import useUpdateInvoice from "../hooks/use-update-invoice";
import type { InvoicePayment, InvoicePaymentForm } from "../types/invoice";
import type { InvoiceOrder } from "../types/invoice-order";
import type { OptionAgent } from "@/features/master/master-agen/types/master-agen";
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
import { HandCoins, Pencil, Plus, Signature, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaSave } from "react-icons/fa";
import { FaDownload, FaFileInvoice } from "react-icons/fa6";
import { MdWorkHistory } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { useSegments } from "@/features/master/master-segment/hooks/use-master-segment";
import { useSegmentDetails } from "@/features/master/master-segment/hooks/use-master-segment-detail";
import type {
  Segment,
  SegmentDetail,
  SegmentSubDetail,
  SegmentOption,
} from "@/features/master/master-segment/types/master-segment";
import useOptionAgent from "@/features/master/master-agen/hooks/use-option-agen";
import {
  createInitialInvoiceFormData,
  toDate,
  type InvoiceFormData,
} from "../utils/invoice-form-utils";
import { formatTanggal } from "@/lib/utils";

type InvoiceFormPageProps = { mode: "create" | "detail" };

const createEmptyPaymentForm = (): InvoicePaymentForm => ({
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


// Setting Tampilnya Save/Submit
const createInvoiceDraftSnapshot = (
  data: InvoiceFormData,
  hasPendingPayment: boolean,
  payment: InvoicePaymentForm,
) => {
  const invoiceData = {
    ...data,
    provinceId: null,
    cityId: null,
    customerProvinceId: null,
    customerCityId: null,
  };

  return JSON.stringify({
    data: invoiceData,
    payment: hasPendingPayment
      ? {
          ...payment,
          proofFiles: payment.proofFiles.map((file) => ({
            name: file.name,
            size: file.size,
            lastModified: file.lastModified,
            type: file.type,
          })),
        }
      : null,
  });
};

export default function DetailInvoice({ mode }: InvoiceFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  // State formulir dan status popover/modal
  const [openCreateDetailInvoice, setOpenCreateDetailInvoice] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [openSegment, setOpenSegment] = useState(false);
  const [formData, setFormData] = useState<InvoiceFormData>(
    createInitialInvoiceFormData,
  );
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

  // Data referensi wilayah dan segmen invoice
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
  const {
    segments,
    loading: segmentsLoading,
    error: segmentsError,
  } = useSegments({ is_active: true });

  // Turunan segmen untuk pilihan grup dan informasi pelanggan
  const selectedInvoiceSegment = segments.find(
    (item) => String(item.id) === formData.invoiceSegment,
  );
  const { segmentDetails, loading: segmentDetailsLoading } = useSegmentDetails(
    selectedInvoiceSegment?.id ?? null,
  );
  const selectedInvoiceSegmentName = (
    selectedInvoiceSegment?.name ?? formData.invoiceSegmentName
  ).toLowerCase();
  const isCorporateSegment = selectedInvoiceSegmentName.includes("corporate");
  const isIndividualSegment = selectedInvoiceSegmentName.includes("individu");
  const isTravelSegment = selectedInvoiceSegmentName.includes("travel");
  const isCustomerManualEntrySegment =
    isCorporateSegment || isIndividualSegment;
  const isEducationSegment = selectedInvoiceSegmentName.includes("edukasi");
  const isEducationNameReady = Boolean(
    formData.customerGroupTypeId &&
    formData.customerEducationLevelId &&
    formData.customerGroupStatusId &&
    formData.customerGroupNumber,
  );
  const segmentDetailOptions = segmentDetails.filter(
    (item) => item.is_active && item.name,
  );
  const selectedSegmentDetail = segmentDetailOptions.find(
    (item) => String(item.id) === formData.customerGroupTypeId,
  );
  const subDetailOptions = (selectedSegmentDetail?.sub_details ?? []).filter(
    (item) => item.is_active && item.name,
  );
  const selectedSubDetail = subDetailOptions.find(
    (item) => String(item.id) === formData.customerEducationLevelId,
  );
  const segmentStatusOptions = (selectedSubDetail?.options ?? []).filter(
    (item) => item.is_active && item.name,
  );
  const selectedStatusOption = segmentStatusOptions.find(
    (item) => String(item.id) === formData.customerGroupStatusId,
  );
  const statusIsSwasta =
    selectedStatusOption?.name?.trim().toLowerCase().startsWith("swast") ??
    false;
  const selectedBusinessDetail = segmentDetailOptions.find(
    (item) => String(item.id) === formData.customerBusinessFieldId,
  );
  const businessSubDetailOptions = (
    selectedBusinessDetail?.sub_details ?? []
  ).filter((item) => item.is_active && item.name);
  const formatCustomerGroupName = (
    jenjangId: string,
    statusId: string,
    number: string,
    customTag = formData.customCustomerGroupTag,
    tagOrder = formData.customerGroupTagOrder,
  ) => {
    const statusName = segmentStatusOptions.find(
      (item) => String(item.id) === statusId,
    )?.name;
    const parts = [
      {
        id: "jenjang",
        label: subDetailOptions.find((item) => String(item.id) === jenjangId)
          ?.name,
      },
      {
        id: "status",
        label: statusName?.trim().toLowerCase().startsWith("swast")
          ? undefined
          : statusName,
      },
      {
        id: "nomor",
        label: customerGroupNumberOptions.find((item) => item.value === number)
          ?.label,
      },
      { id: "custom", label: customTag },
    ].filter((item): item is { id: string; label: string } =>
      Boolean(item.label),
    );
    const defaultOrder = ["jenjang", "status", "nomor", "custom"];
    return parts
      .sort((left, right) => {
        const leftIndex = tagOrder.indexOf(left.id);
        const rightIndex = tagOrder.indexOf(right.id);
        const leftRank =
          leftIndex < 0 ? defaultOrder.indexOf(left.id) : leftIndex;
        const rightRank =
          rightIndex < 0 ? defaultOrder.indexOf(right.id) : rightIndex;
        return leftRank - rightRank;
      })
      .map((item) => item.label)
      .join(" ");
  };
  const resetCustomerLocationIfEmpty = (customerGroupName: string) =>
    customerGroupName.trim()
      ? {}
      : {
          customerProvinceId: null,
          customerCityId: null,
          customerProvinceName: "",
          customerCityName: "",
          customerContact: "",
        };
  const customerEducationTags: {
    id: string;
    label: string;
    onRemove: () => void;
  }[] = isEducationSegment
    ? [
        selectedSubDetail?.name
          ? {
              id: "jenjang",
              label: selectedSubDetail.name,
              onRemove: () =>
                setFormData((current) => ({
                  ...current,
                  customerEducationLevelId: "",
                  customerGroupStatusId: "",
                  customerGroupName: formatCustomerGroupName(
                    "",
                    "",
                    current.customerGroupNumber,
                  ),
                  ...resetCustomerLocationIfEmpty(
                    formatCustomerGroupName(
                      "",
                      "",
                      current.customerGroupNumber,
                      current.customCustomerGroupTag,
                    ),
                  ),
                })),
            }
          : null,
        selectedStatusOption?.name && !statusIsSwasta
          ? {
              id: "status",
              label: selectedStatusOption.name,
              onRemove: () =>
                setFormData((current) => ({
                  ...current,
                  customerGroupStatusId: "",
                  customerGroupName: formatCustomerGroupName(
                    current.customerEducationLevelId,
                    "",
                    current.customerGroupNumber,
                  ),
                  ...resetCustomerLocationIfEmpty(
                    formatCustomerGroupName(
                      current.customerEducationLevelId,
                      "",
                      current.customerGroupNumber,
                      current.customCustomerGroupTag,
                    ),
                  ),
                })),
            }
          : null,
        formData.customerGroupNumber
          ? {
              id: "nomor",
              label:
                customerGroupNumberOptions.find(
                  (item) => item.value === formData.customerGroupNumber,
                )?.label ?? formData.customerGroupNumber,
              onRemove: () =>
                setFormData((current) => ({
                  ...current,
                  customerGroupNumber: "",
                  customerGroupName: formatCustomerGroupName(
                    current.customerEducationLevelId,
                    current.customerGroupStatusId,
                    "",
                  ),
                  ...resetCustomerLocationIfEmpty(
                    formatCustomerGroupName(
                      current.customerEducationLevelId,
                      current.customerGroupStatusId,
                      "",
                      current.customCustomerGroupTag,
                    ),
                  ),
                })),
            }
          : null,
        formData.customCustomerGroupTag
          ? {
              id: "custom",
              label: formData.customCustomerGroupTag,
              onRemove: () =>
                setFormData((current) => ({
                  ...current,
                  customCustomerGroupTag: "",
                  customerGroupName: formatCustomerGroupName(
                    current.customerEducationLevelId,
                    current.customerGroupStatusId,
                    current.customerGroupNumber,
                    "",
                  ),
                  ...resetCustomerLocationIfEmpty(
                    formatCustomerGroupName(
                      current.customerEducationLevelId,
                      current.customerGroupStatusId,
                      current.customerGroupNumber,
                      "",
                    ),
                  ),
                })),
            }
          : null,
      ]
        .filter((tag) => tag !== null)
        .sort((left, right) => {
          const order = formData.customerGroupTagOrder;
          const defaultOrder = ["jenjang", "status", "nomor", "custom"];
          const leftIndex = order.indexOf(left.id);
          const rightIndex = order.indexOf(right.id);
          return (
            (leftIndex < 0 ? defaultOrder.indexOf(left.id) : leftIndex) -
            (rightIndex < 0 ? defaultOrder.indexOf(right.id) : rightIndex)
          );
        })
    : [];
  const customerFieldTags = formData.customerId
    ? []
    : isEducationSegment
      ? customerEducationTags
      : formData.customCustomerGroupTag
        ? [
            {
              id: "custom",
              label: formData.customCustomerGroupTag,
              onRemove: () =>
                setFormData((current) => ({
                  ...current,
                  customCustomerGroupTag: "",
                  customerGroupName: "",
                  customerProvinceId: null,
                  customerCityId: null,
                  customerProvinceName: "",
                  customerCityName: "",
                  customerContact: "",
                })),
            },
          ]
        : [];

  // Sesuaikan segmen otomatis untuk tipe order perjalanan
  useEffect(() => {
    const travelSegment = segments.find(
      (segment) => segment.name.trim().toLowerCase() === "travel",
    );
    if (!travelSegment) return;

    const travelSegmentId = String(travelSegment.id);
    if (formData.tipeOrder === "travel") {
      if (formData.invoiceSegment !== travelSegmentId) {
        setFormData((current) => ({
          ...current,
          invoiceSegment: travelSegmentId,
          invoiceSegmentName: travelSegment.name,
          customerBusinessFieldId: "",
          customerBusinessTypeId: "",
          customerGroupTypeId: "",
          customerEducationLevelId: "",
          customerGroupStatusId: "",
          customerGroupNumber: "",
        }));
      }
    }
  }, [formData.invoiceSegment, formData.tipeOrder, segments]);
  const [openCustomerProvince, setOpenCustomerProvince] = useState(false);
  const [openCustomerCity, setOpenCustomerCity] = useState(false);
  const [searchCustomerProvince, setSearchCustomerProvince] = useState("");
  const [searchCustomerCity, setSearchCustomerCity] = useState("");
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState<InvoicePaymentForm>(
    createEmptyPaymentForm,
  );
  const [savedPaymentsOverride, setSavedPaymentsOverride] = useState<
    InvoicePayment[] | null
  >(null);
  const [paymentAmountsOverride, setPaymentAmountsOverride] = useState<{
    totalAmount: string | number;
    paidAmount: string | number;
    remainingAmount: string | number;
  } | null>(null);
  const invoiceFormBaseline = useRef<string | null>(null);
  const capturedInvoiceFormHydrationVersion = useRef(0);
  const [invoiceFormHydrationVersion, setInvoiceFormHydrationVersion] =
    useState(0);
  const [invoiceFormBaselineVersion, setInvoiceFormBaselineVersion] =
    useState(0);
  const {
    invoice: invoiceData,
    loading: invoiceLoading,
    refetch: refetchInvoiceDetail,
    // error: invoiceError,
  } = useInvoiceDetail(mode === "detail" ? id : undefined);
  const {
    canApprove,
    checkingPermission: checkingApprovalPermission,
    permissionError: approvalPermissionError,
    loadingAction: loadingApprovalAction,
    runAction: runInvoiceApprovalAction,
  } = useInvoiceApproval(
    mode === "detail" ? (invoiceData?.id ?? null) : null,
    mode === "detail" && Boolean(invoiceData),
  );
  const createInvoiceMutation = useCreateInvoice();
  const updateInvoiceMutation = useUpdateInvoice();
  const saving = createInvoiceMutation.loading || updateInvoiceMutation.loading;
  const openPaymentEditor = () => {
    setOpenPaymentModal(true);
  };
  const handleEditOrder = (order: InvoiceOrder) => {
    setEditingOrderId(order.id);
    setOpenCreateDetailInvoice(true);
  };
  const handleDeleteOrder = async (order: InvoiceOrder) => {
    const confirmation = await Swal.fire({
      title: "Hapus detail pesanan?",
      text: `Produk ${order.product} akan dihapus dari draft invoice.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Batal",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });
    if (!confirmation.isConfirmed) return;

    setFormData((current) => ({
      ...current,
      orderItems: current.orderItems.filter((item) => item.id !== order.id),
    }));
  };
  const handleSaveOrder = (order: Omit<InvoiceOrder, "id">) => {
    setFormData((current) => ({
      ...current,
      orderItems:
        editingOrderId === null
          ? [...current.orderItems, { ...order, id: Date.now() }]
          : current.orderItems.map((item) =>
              item.id === editingOrderId
                ? { ...order, id: editingOrderId }
                : item,
            ),
    }));
    setEditingOrderId(null);
  };
  const savePaymentDraft = (payment: InvoicePaymentForm) => {
    setPaymentForm(payment);
    setHasPendingPayment(true);
  };

  // Isi formulir dari invoice yang sedang dibuka
  useEffect(() => {
    if (!invoiceData) return;
    setSavedPaymentsOverride(null);
    setPaymentAmountsOverride(null);
    const bookingType =
      invoiceData.booking_type ??
      invoiceData.type_order ??
      invoiceData.items?.find((item) => item.booking_type)?.booking_type ??
      "";
    const normalizedBookingType = bookingType
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
    const segmentName = invoiceData.segment_name ?? "";
    const isCorporate = segmentName.toLowerCase().includes("corporate");

    const partnerProvince =
      invoiceData.partner_branch_province ?? invoiceData.partner_province;
    const partnerCity =
      invoiceData.partner_branch_city ?? invoiceData.partner_city;
    pendingAgentLocation.current = partnerProvince
      ? {
          provinceId: null,
          provinceName: partnerProvince,
          cityName: partnerCity ?? "",
          waitForCities: true,
          loadingStarted: false,
        }
      : null;
    pendingCustomerLocation.current = invoiceData.customer_province
      ? {
          provinceId: null,
          provinceName: invoiceData.customer_province,
          cityName: invoiceData.customer_city ?? "",
          loadingStarted: false,
        }
      : null;

    setFormData((current) => ({
      ...current,
      tipeOrder: normalizedBookingType || current.tipeOrder,
      bookingType: normalizedBookingType || current.bookingType,
      invoiceSegment:
        invoiceData.segment_id !== null
          ? String(invoiceData.segment_id)
          : current.invoiceSegment,
      invoiceSegmentName: segmentName || current.invoiceSegmentName,
      customerBusinessFieldId:
        isCorporate && invoiceData.segment_detail_id !== null
          ? String(invoiceData.segment_detail_id)
          : current.customerBusinessFieldId,
      customerBusinessTypeId:
        isCorporate && invoiceData.sub_segment_detail_id !== null
          ? String(invoiceData.sub_segment_detail_id)
          : current.customerBusinessTypeId,
      customerGroupTypeId:
        !isCorporate && invoiceData.segment_detail_id !== null
          ? String(invoiceData.segment_detail_id)
          : current.customerGroupTypeId,
      customerEducationLevelId:
        !isCorporate && invoiceData.sub_segment_detail_id !== null
          ? String(invoiceData.sub_segment_detail_id)
          : current.customerEducationLevelId,
      customerGroupStatusId:
        invoiceData.segment_option_id !== null &&
        invoiceData.segment_option_id !== undefined
          ? String(invoiceData.segment_option_id)
          : current.customerGroupStatusId,
      customerName: invoiceData.customer_contact_person ?? "",
      customerGroupName: invoiceData.customer_name ?? "",
      customerContact: invoiceData.customer_phone ?? "",
      customerProvinceName: invoiceData.customer_province ?? "",
      customerCityName: invoiceData.customer_city ?? "",
      provinceId: null,
      cityId: null,
      customerProvinceId: null,
      customerCityId: null,
      customerId: invoiceData.customer_id,
      partnerId: invoiceData.partner_id,
      partnerBranchId: invoiceData.partner_branch_id
        ? String(invoiceData.partner_branch_id)
        : null,
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
        isTicket: item.is_ticket ?? false,
        discountPrice: Number(item.discount_amount) || 0,
        subtotal: Number(item.subtotal) || 0,
      })),
    }));
    setPaymentForm(createEmptyPaymentForm());
    setHasPendingPayment(false);
    setInvoiceFormHydrationVersion((version) => version + 1);
  }, [invoiceData]);

  useEffect(() => {
    if (
      mode !== "detail" ||
      !invoiceData ||
      invoiceFormHydrationVersion === 0 ||
      capturedInvoiceFormHydrationVersion.current ===
        invoiceFormHydrationVersion
    ) {
      return;
    }

    invoiceFormBaseline.current = createInvoiceDraftSnapshot(
      formData,
      false,
      createEmptyPaymentForm(),
    );
    capturedInvoiceFormHydrationVersion.current = invoiceFormHydrationVersion;
    setInvoiceFormBaselineVersion(invoiceFormHydrationVersion);
  }, [formData, invoiceData, invoiceFormHydrationVersion, mode]);
  // Data sales dan agen perjalanan
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
    karyawan.find((employee) => employee.name === defaultSalesName) ??
    null;

  const {
    optionAgents,
    loading: loadingAgents,
    error: agentsError,
    search: searchAgent,
    setSearch: setSearchAgent,
  } = useOptionAgent({ is_active: true });
  const activeOptionAgents = optionAgents.filter(
    (agent) => agent.is_active !== false,
  );
  const [openTravelAgent, setOpenTravelAgent] = useState(false);
  // Pencarian wilayah dan sinkronisasi provinsi/kota tertunda
  const [openProvince, setOpenProvince] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [searchProvince, setSearchProvince] = useState("");
  const [searchCity, setSearchCity] = useState("");

  const { cities, loading: citiesLoading } = useCities(formData.provinceId);
  const { cities: customerCities, loading: customerCitiesLoading } = useCities(
    formData.customerProvinceId,
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
    if (pendingLocation.waitForCities && !pendingLocation.loadingStarted) {
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
        customerProvinceId: province.id,
        customerCityId: null,
      }));
      return;
    }

    if (formData.customerProvinceId !== pendingLocation.provinceId) return;

    if (!pendingLocation.cityName) {
      pendingCustomerLocation.current = null;
      return;
    }

    if (customerCitiesLoading) {
      pendingLocation.loadingStarted = true;
      return;
    }

    if (!pendingLocation.loadingStarted || customerCities.length === 0) return;

    const city = customerCities.find(
      (item) =>
        item.name.toLowerCase().trim() ===
        pendingLocation.cityName.toLowerCase().trim(),
    );
    if (city) {
      setFormData((current) => ({ ...current, customerCityId: city.id }));
    }
    pendingCustomerLocation.current = null;
  }, [
    formData.customerProvinceId,
    customerCities,
    customerCitiesLoading,
    provinces,
  ]);

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
  const selectedCustomerProvince = provinces.find(
    (province) => province.id === formData.customerProvinceId,
  );
  const selectedCustomerCity = customerCities.find(
    (city) => city.id === formData.customerCityId,
  );
  const filteredCustomerProvinces = provinces.filter((province) =>
    province.name
      .toLowerCase()
      .includes(searchCustomerProvince.toLowerCase().trim()),
  );
  const filteredCustomerCities = customerCities.filter((city) =>
    city.name.toLowerCase().includes(searchCustomerCity.toLowerCase().trim()),
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

  const handleCustomerProvinceChange = (id: number | null) => {
    pendingCustomerLocation.current = null;
    if (id !== formData.customerProvinceId) {
      setFormData((current) => ({
        ...current,
        customerProvinceId: id,
        customerCityId: null,
        customerProvinceName:
          provinces.find((province) => province.id === id)?.name ?? "",
        customerCityName: "",
      }));
    }

    setSearchCustomerProvince("");
    setSearchCustomerCity("");
    setOpenCustomerProvince(false);
    setOpenCustomerCity(false);
  };
  // Validasi dan penyimpanan invoice
  const handleSave = async () => {
    if (saving) return;
    if (!selectedSales?.id_absen && !invoiceData?.sales_person_id) {
      toast.add({
        title: "Sales belum dipilih",
        description:
          "Pilih nama sales yang memiliki ID sebelum menyimpan invoice.",
        type: "error",
        timeout: 5000,
      });
      return;
    }
    // if (
    //   !formData.customerId &&
    //   (!formData.customerGroupName.trim() ||
    //     !selectedCustomerProvince ||
    //     !selectedCustomerCity)
    // ) {
    //   toast.add({
    //     title: "Data customer belum lengkap",
    //     description:
    //       isTravelSegment
    //         ? "Pilih customer existing sebelum menyimpan invoice."
    //         : "Isi nama group, provinsi, dan kota sebelum menyimpan invoice.",
    //     type: "error",
    //     timeout: 5000,
    //   });
    //   return;
    // }

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
    const bookingType =
      formData.tipeOrder === "travel" ? "travel" : "non_travel";
    const segmentId = selectedInvoiceSegment?.id
      ? String(selectedInvoiceSegment.id)
      : mode === "detail" && invoiceData?.segment_id != null
        ? String(invoiceData.segment_id)
        : "";
    const selectedSegmentDetailId = isCorporateSegment
      ? formData.customerBusinessFieldId
      : formData.customerGroupTypeId;
    const segmentDetailId =
      selectedSegmentDetailId ||
      (mode === "detail" && invoiceData?.segment_detail_id != null
        ? String(invoiceData.segment_detail_id)
        : "");
    const selectedSubSegmentDetailId = isCorporateSegment
      ? formData.customerBusinessTypeId
      : formData.customerEducationLevelId;
    const subSegmentDetailId =
      selectedSubSegmentDetailId ||
      (mode === "detail" && invoiceData?.sub_segment_detail_id != null
        ? String(invoiceData.sub_segment_detail_id)
        : "");
    const segmentOptionId = isEducationSegment
      ? formData.customerGroupStatusId ||
        (mode === "detail" && invoiceData?.segment_option_id != null
          ? String(invoiceData.segment_option_id)
          : "")
      : "";
    const salesPersonId =
      selectedSales?.id_absen || invoiceData?.sales_person_id || "";
    const partnerId = formData.partnerId ? String(formData.partnerId) : "";
    const partnerBranchId =
      formData.tipeOrder === "travel" ? (formData.partnerBranchId ?? "") : "";
    const invoiceDate = invoiceData?.invoice_date ?? new Date().toISOString();
    const arrivalDate =
      formData.tipeOrder === "travel"
        ? (formData.arrivalDate?.toISOString() ?? "")
        : "";
    const payload = new FormData();
    const customerId = formData.customerId;
    if (customerId) {
      payload.append("customer_id", String(customerId));
      payload.append("contact_person", formData.customerName.trim());
    } else {
      payload.append("customer[name]", formData.customerGroupName.trim());
      payload.append("customer[email]", formData.customerEmail);
      payload.append("customer[phone]", formData.customerContact);
      payload.append(
        "customer[contact_person]",
        formData.customerContactPerson,
      );
      payload.append(
        "customer[province_name]",
        selectedCustomerProvince?.name ?? formData.customerProvinceName,
      );
      payload.append(
        "customer[city_name]",
        selectedCustomerCity?.name ?? formData.customerCityName,
      );
      payload.append("customer[segment_id]", segmentId);
      payload.append("customer[segment_detail_id]", segmentDetailId);
      payload.append("customer[sub_segment_detail_id]", subSegmentDetailId);
      payload.append("customer[segment_option_id]", segmentOptionId);
      payload.append("customer[is_active]", "1");
    }

    const hasPaymentInput = hasPendingPayment;
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
      if (paymentForm.proofFiles.length === 0) {
        payload.append("payment[proof_of_payment]", "");
      }
    }
    payload.append("sales_person_id", salesPersonId);
    payload.append("partner_id", partnerId);
    payload.append("partner_branch_id", partnerBranchId);
    payload.append("booking_type", bookingType);
    payload.append("segment_id", segmentId);
    payload.append("segment_detail_id", segmentDetailId);
    payload.append("sub_segment_detail_id", subSegmentDetailId);
    payload.append("segment_option_id", segmentOptionId);
    payload.append("invoice_date", invoiceDate);
    payload.append("arrival_date", arrivalDate);
    payload.append("notes", invoiceData?.notes ?? "");
    payload.append("supporting_document", "");
    formData.orderItems.forEach((order, index) => {
      const item = `items[${index}]`;
      payload.append(`${item}[product_id]`, String(order.productId || ""));
      payload.append(`${item}[product_code]`, "");
      payload.append(`${item}[product_name]`, order.product);
      payload.append(`${item}[product_description]`, order.description);
      payload.append(`${item}[quantity]`, String(order.quantity));
      payload.append(`${item}[bonus_quantity]`, String(order.compliment ?? 0));
      if (!order.isTicket) {
        payload.append(`${item}[unit_price]`, String(order.unitPrice));
      }
      payload.append(`${item}[discount_amount]`, String(order.discountPrice));
      payload.append(`${item}[notes]`, "");
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
        const updatedInvoice = await updateInvoiceMutation.submit(id, payload);
        if (hasPendingPayment) {
          setPaymentAmountsOverride({
            totalAmount: updatedInvoice.total_amount,
            paidAmount:
              updatedInvoice.paid_amount ?? invoiceData?.paid_amount ?? 0,
            remainingAmount:
              updatedInvoice.remaining_amount ??
              invoiceData?.remaining_amount ??
              0,
          });
          const uploadedProofNames = paymentForm.proofFiles
            .map((file) => file.name)
            .join(", ");
          const fallbackPayments = [
            ...(invoiceData?.payments ?? []),
            {
              payment_date: paymentForm.paymentDate?.toISOString() ?? null,
              payment_type: paymentForm.paymentType,
              payment_method: paymentForm.paymentMethod,
              account_holder_name: paymentForm.accountHolderName,
              from_bank: paymentForm.fromBank,
              to_bank: paymentForm.toBank,
              amount: paymentForm.amount,
              notes: paymentForm.notes,
              proof_of_payment: uploadedProofNames || null,
            },
          ];
          const returnedPayments = updatedInvoice.payments;
          const savedPayments = returnedPayments?.length
            ? returnedPayments
            : fallbackPayments;
          if (
            uploadedProofNames &&
            !savedPayments.some((payment) => payment.proof_of_payment?.trim())
          ) {
            savedPayments[savedPayments.length - 1] = {
              ...savedPayments[savedPayments.length - 1],
              proof_of_payment: uploadedProofNames,
            };
          }
          setSavedPaymentsOverride(savedPayments);
          setHasPendingPayment(false);
          setPaymentForm(createEmptyPaymentForm());
        }
        invoiceFormBaseline.current = createInvoiceDraftSnapshot(
          formData,
          false,
          createEmptyPaymentForm(),
        );
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

  const handleInvoiceApprovalAction = async (action: InvoiceApprovalAction) => {
    if (!invoiceData?.id) return;

    const confirmation = {
      submit: {
        title: "Konfirmasi Submit",
        text: `Yakin ingin submit invoice ${invoiceData.invoice_number ?? "ini"}?`,
        confirmButtonText: "Ya, Submit",
      },
      approve: {
        title: "Konfirmasi Approval",
        text: `Yakin ingin menyetujui invoice ${invoiceData.invoice_number ?? "ini"}?`,
        confirmButtonText: "Ya, Approve",
      },
      reject: {
        title: "Konfirmasi Reject",
        text: `Yakin ingin menolak invoice ${invoiceData.invoice_number ?? "ini"}?`,
        confirmButtonText: "Ya, Reject",
      },
    }[action];

    const result = await Swal.fire({
      ...confirmation,
      confirmButtonColor: "#107254",
      icon: "question",
      showCancelButton: true,
      cancelButtonText: "Batal",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    try {
      const responseMessage = await runInvoiceApprovalAction(action);
      refetchInvoiceDetail();
      toast.add({
        title:
          action === "submit"
            ? "Invoice berhasil disubmit"
            : action === "approve"
              ? "Invoice berhasil disetujui"
              : "Invoice berhasil ditolak",
        description:
          responseMessage ??
          (action === "submit"
            ? "Invoice telah dikirim untuk proses approval."
            : action === "approve"
              ? "Invoice telah disetujui."
              : "Invoice telah ditolak."),
        type: "success",
        timeout: 5000,
      });
    } catch (approvalError: unknown) {
      toast.add({
        title:
          action === "submit"
            ? "Invoice gagal disubmit"
            : action === "approve"
              ? "Invoice gagal disetujui"
              : "Invoice gagal ditolak",
        description:
          approvalError instanceof Error
            ? approvalError.message
            : "Terjadi kesalahan saat memproses approval invoice.",
        type: "error",
        timeout: 6000,
      });
    }
  };
  const approvalStatus = invoiceData?.status?.trim().toLowerCase() ?? "";
  const isDraftInvoice = approvalStatus === "draft";
  const currentInvoiceFormSnapshot = createInvoiceDraftSnapshot(
    formData,
    hasPendingPayment,
    paymentForm,
  );
  const isInvoiceSnapshotReady =
    mode === "detail" &&
    invoiceFormBaseline.current !== null &&
    invoiceFormBaselineVersion === invoiceFormHydrationVersion;
  const hasUnsavedInvoiceChanges =
    isInvoiceSnapshotReady &&
    currentInvoiceFormSnapshot !== invoiceFormBaseline.current;
  // const savedPaymentRecords =
  //   savedPaymentsOverride ?? invoiceData?.payments ?? [];
  // const hasUploadedPaymentProof = savedPaymentRecords.some((payment) =>
  //   Boolean(payment.proof_of_payment?.trim()),
  // );
  const approvalActionDisabled =
    invoiceLoading ||
    checkingApprovalPermission ||
    loadingApprovalAction !== null;

  const approvalHistory = (invoiceData?.approvals ?? []).map((approval) => ({
    action:
      approval.action === "submit"
        ? "Dibuat oleh,"
        : approval.action === "approve"
          ? "Disetujui oleh,"
          : approval.action === "reject"
            ? "Ditolak oleh,"
            : approval.action,
    name: approval.employee_name,
    grade: approval.grade ?? approval.position ?? approval.department ?? "-",
  }));

  // Aksi yang tersedia pada footer halaman
  const actions: DetailAction[] = [];

  if (mode === "create" || hasUnsavedInvoiceChanges) {
    actions.push({
      id: "save",
      label: saving ? "Menyimpan..." : "Save",
      icon: <FaSave size={15} />,
      variant: "primer",
      mobileColor: "bg-primer-60",
      position: "right",
      disabled: saving || invoiceLoading,
      onClick: handleSave,
    });
  }

  if (
    mode === "detail" &&
    isInvoiceSnapshotReady &&
    !hasUnsavedInvoiceChanges &&
    isDraftInvoice
  ) {
    actions.push({
      id: "submit",
      label: loadingApprovalAction === "submit" ? "Memproses..." : "Submit",
      icon: <FaSave size={15} />,
      variant: "primer",
      mobileColor: "bg-primer-60",
      position: "right",
      disabled: approvalActionDisabled,
      onClick: () => handleInvoiceApprovalAction("submit"),
    });
  }

  // if (mode === "detail" && isDraftInvoice && hasUploadedPaymentProof) {
  //   actions.push({
  //     id: "submit",
  //     label: loadingApprovalAction === "submit" ? "Memproses..." : "Submit",
  //     icon: <FaSave size={15} />,
  //     variant: "primer",
  //     mobileColor: "bg-primer-60",
  //     position: "right",
  //     disabled: approvalActionDisabled,
  //     onClick: () => handleInvoiceApprovalAction("submit"),
  //   });
  // }

  if (mode === "detail" && canApprove) {
    actions.push(
      {
        id: "reject",
        label: loadingApprovalAction === "reject" ? "Memproses..." : "Reject",
        icon: <X size={15} />,
        variant: "destructive",
        mobileColor: "bg-red-500",
        position: "right",
        disabled: approvalActionDisabled,
        onClick: () => handleInvoiceApprovalAction("reject"),
      },
      {
        id: "approve",
        label: loadingApprovalAction === "approve" ? "Memproses..." : "Approve",
        icon: <Signature size={15} />,
        variant: "primer",
        mobileColor: "bg-primer-60",
        position: "right",
        disabled: approvalActionDisabled,
        onClick: () => handleInvoiceApprovalAction("approve"),
      },
    );
  }

  if (mode === "detail")
    actions.push({
      id: "download",
      label: "Download",
      icon: <FaDownload size={15} />,
      variant: "blue",
      mobileColor: "bg-blue-600",
      position: "left",
    });

  const paymentRows: InvoicePaymentRow[] = [
    ...(savedPaymentsOverride ?? invoiceData?.payments ?? []).map(
      (payment, index) => ({
        id: `saved-payment-${index}`,
        paymentDate: payment.payment_date ?? null,
        paymentMethod: payment.payment_method ?? "",
        accountHolderName: payment.account_holder_name ?? "",
        fromBank: payment.from_bank ?? "",
        toBank: payment.to_bank ?? "",
        amount: payment.amount ?? null,
        notes: payment.notes ?? "",
        proof: payment.proof_of_payment?.split(/[\\/]/).pop() ?? "",
        status: "Tersimpan",
      }),
    ),
    ...(hasPendingPayment
      ? [
          {
            id: "pending-payment",
            paymentDate: paymentForm.paymentDate ?? null,
            paymentMethod: paymentForm.paymentMethod,
            accountHolderName: paymentForm.accountHolderName,
            fromBank: paymentForm.fromBank,
            toBank: paymentForm.toBank,
            amount: paymentForm.amount,
            notes: paymentForm.notes,
            proof: paymentForm.proofFiles.map((file) => file.name).join(", "),
            status: "Menunggu disimpan",
            pending: true,
            onEdit: openPaymentEditor,
            onRemove: () => {
              setPaymentForm(createEmptyPaymentForm());
              setHasPendingPayment(false);
            },
          },
        ]
      : []),
  ];

  // Susunan halaman detail invoice
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
        {mode === "detail" && approvalPermissionError && (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            Gagal memeriksa izin approval: {approvalPermissionError}
          </p>
        )}

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
          <div
            className={`grid grid-cols-1 gap-8 p-5 [&_[data-slot=field-label]]:!text-xs max-md:[&_[data-slot=field]]:!grid-cols-1 max-md:[&_[data-slot=field]]:!items-stretch max-md:[&_[data-slot=field]]:!gap-1 ${formData.tipeOrder === "travel" ? "xl:grid-cols-2" : formData.tipeOrder === "non_travel" && mode === "detail" ? "xl:grid-cols-2" : "xl:grid-cols-1"}`}
          >
            {/* Informasi Umum Pelanggan */}
            <div
              className={`space-y-4 [&_[data-slot=field]]:!grid [&_[data-slot=field]]:!grid-cols-[140px_minmax(0,1fr)] [&_[data-slot=field]]:!items-center [&_[data-slot=field]]:!gap-3 [&_[data-slot=field]_button]:!h-10 [&_[data-slot=field]_[data-slot=input]]:!h-10 ${formData.tipeOrder === "travel" ? "" : "max-w-4xl"}`}
            >
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
                  disabled={approvalStatus !== "draft"}
                />
              </Field>
              <Field orientation="horizontal">
                <FieldLabel>
                  Tipe Order <span className="text-xs text-red-500">*</span>
                </FieldLabel>

                <Select
                  value={formData.tipeOrder}
                  onValueChange={(value) => {
                    pendingCustomerLocation.current = null;
                    pendingAgentLocation.current = null;

                    setFormData((current) => ({
                      ...current,
                      tipeOrder: (value ?? "").toLowerCase(),

                      invoiceSegment: "",
                      invoiceSegmentName: "",
                      customerBusinessFieldId: "",
                      customerBusinessTypeId: "",
                      customerGroupTypeId: "",
                      customerEducationLevelId: "",
                      customerGroupStatusId: "",
                      customerGroupNumber: "",
                      customCustomerGroupTag: "",
                      customerGroupTagOrder: [],
                      customerGroupName: "",

                      customerId: null,
                      customerContact: "",
                      customerSegment: "",

                      // Reset data travel
                      travelAgent: "",
                      partnerId: null,
                      partnerBranchId: null,

                      // Reset lokasi
                      provinceId: null,
                      cityId: null,
                      customerProvinceId: null,
                      customerCityId: null,
                      customerProvinceName: "",
                      customerCityName: "",
                    }));

                    // Reset pencarian
                    setSearchAgent("");
                    setSearchProvince("");
                    setSearchCity("");

                    // Tutup popover
                    setOpenTravelAgent(false);
                    setOpenProvince(false);
                    setOpenCity(false);
                  }}
                  disabled={mode === "detail"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih tipe order">
                      {formData.tipeOrder === "travel"
                        ? "Travel"
                        : formData.tipeOrder === "non_travel"
                          ? "Non Travel"
                          : undefined}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent align="start" alignItemWithTrigger={false}>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="non_travel">Non Travel</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field orientation="horizontal">
                <FieldLabel>
                  Segmen <span className="text-xs text-red-500">*</span>
                </FieldLabel>

                <SearchablePopover<Segment>
                  open={openSegment}
                  onOpenChange={setOpenSegment}
                  search={searchInvoiceOption}
                  onSearchChange={setSearchInvoiceOption}
                  placeholder={
                    segmentsLoading ? "Memuat segmen..." : "Pilih segmen"
                  }
                  selectedLabel={
                    selectedInvoiceSegment?.name ??
                    invoiceData?.segment_name ??
                    null
                  }
                  selectedKey={formData.invoiceSegment || null}
                  items={segments.filter(
                    (item) =>
                      item.name.trim().toLowerCase() !== "travel" &&
                      item.name
                        .toLowerCase()
                        .includes(searchInvoiceOption.toLowerCase().trim()),
                  )}
                  getKey={(item) => String(item.id)}
                  renderItem={(item) => item.name}
                  onSelect={(item) => {
                    pendingCustomerLocation.current = null;
                    const nextValue = String(item.id);
                    setFormData((current) => ({
                      ...current,
                      invoiceSegment: nextValue,
                      invoiceSegmentName: item.name,
                      customerSegment: "",
                      customerBusinessFieldId: "",
                      customerBusinessTypeId: "",
                      customerGroupTypeId: "",
                      customerEducationLevelId: "",
                      customerGroupStatusId: "",
                      customerGroupNumber: "",
                      customCustomerGroupTag: "",
                      customerGroupTagOrder: [],
                      customerGroupName: "",
                      customerId: null,
                      customerProvinceId: null,
                      customerCityId: null,
                      customerProvinceName: "",
                      customerCityName: "",
                      customerContact: "",
                      provinceId: null,
                      cityId: null,
                    }));
                    setSearchInvoiceOption("");
                    setOpenSegment(false);
                  }}
                  emptyText={segmentsError ?? "Segmen tidak ditemukan."}
                  disabled={
                    !formData.tipeOrder ||
                    segmentsLoading ||
                    formData.tipeOrder === "travel" ||
                    mode === "detail"
                  }
                  debounceDelay={0}
                />
              </Field>
            </div>

            <div className="space-y-4 [&_[data-slot=field]]:!grid [&_[data-slot=field]]:!grid-cols-[140px_minmax(0,1fr)] [&_[data-slot=field]]:!items-center [&_[data-slot=field]]:!gap-3 [&_[data-slot=field]_button]:!h-10 [&_[data-slot=field]_[data-slot=input]]:!h-10">
              {mode !== "create" && (
                <Field orientation="horizontal">
                  <FieldLabel>Input Date</FieldLabel>
                  <Input
                    placeholder={formatTanggal(
                      invoiceData?.invoice_date ?? "Input Date",
                    )}
                    disabled
                  />
                </Field>
              )}

              {formData.tipeOrder === "travel" && (
                <>
                  <Field orientation="horizontal">
                    <FieldLabel>
                      Nama Travel/Agent{" "}
                      <span className="text-xs text-red-500">*</span>
                    </FieldLabel>

                    <SearchablePopover<OptionAgent>
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
                          ? `${formData.partnerId}:${formData.partnerBranchId ?? ""}`
                          : null
                      }
                      items={activeOptionAgents}
                      getKey={(agent) =>
                        `${agent.partner_id}:${agent.partner_branch_id ?? ""}`
                      }
                      renderItem={(agent) => agent.label}
                      onSelect={(agent) => {
                        const provinceName = agent.province_name;
                        const cityName = agent.city_name;
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
                          partnerId: Number(agent.partner_id) || null,
                          partnerBranchId: agent.partner_branch_id,
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
                        selectedLabel={
                          selectedProvince?.name ??
                          invoiceData?.partner_branch_province ??
                          invoiceData?.partner_province ??
                          null
                        }
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
                        emptyText={
                          provinceError
                            ? "Provinsi gagal dimuat."
                            : "Provinsi tidak ditemukan."
                        }
                        debounceDelay={500}
                        disabled
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
                      selectedLabel={
                        selectedCity?.name ??
                        invoiceData?.partner_branch_city ??
                        invoiceData?.partner_city ??
                        null
                      }
                      selectedKey={
                        formData.cityId !== null
                          ? String(formData.cityId)
                          : null
                      }
                      items={filteredCities}
                      getKey={(city) => String(city.id)}
                      renderItem={(city) => city.name}
                      onSelect={(city) => handleCityChange(city.id)}
                      disabled
                      emptyText="Kota/kabupaten tidak ditemukan."
                      debounceDelay={500}
                    />
                  </Field>
                </>
              )}
            </div>

            {isCorporateSegment && (
              <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-slate-100 px-5 py-4 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="grid grid-cols-1 items-center gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(240px,0.9fr)] xl:gap-6">
                  <div className="grid min-w-0 grid-cols-1 items-start gap-1 md:grid-cols-[110px_minmax(0,1fr)] md:items-center md:gap-3">
                    <FieldLabel>
                      Bidang Usaha{" "}
                      <span className="text-xs text-red-500">*</span>
                    </FieldLabel>
                    <SearchablePopover<SegmentDetail>
                      open={openInvoiceOption === "businessField"}
                      onOpenChange={(open) =>
                        setOpenInvoiceOption(open ? "businessField" : null)
                      }
                      search={searchInvoiceOption}
                      onSearchChange={setSearchInvoiceOption}
                      placeholder="Pilih bidang usaha"
                      selectedLabel={
                        selectedBusinessDetail?.name ??
                        invoiceData?.segment_detail_name ??
                        null
                      }
                      selectedKey={formData.customerBusinessFieldId || null}
                      items={segmentDetailOptions.filter((option) =>
                        option.name
                          ?.toLowerCase()
                          .includes(searchInvoiceOption.toLowerCase().trim()),
                      )}
                      getKey={(option) => String(option.id)}
                      renderItem={(option) => option.name ?? ""}
                      onSelect={(option) => {
                        setFormData((current) => ({
                          ...current,
                          customerBusinessFieldId: String(option.id),
                          customerBusinessTypeId: "",
                        }));
                        setSearchInvoiceOption("");
                        setOpenInvoiceOption(null);
                      }}
                      emptyText="Bidang usaha tidak ditemukan."
                      debounceDelay={0}
                      disabled={mode === "detail"}
                    />
                  </div>

                  <div className="grid min-w-0 grid-cols-1 items-start gap-1 md:grid-cols-[110px_minmax(0,1fr)] md:items-center md:gap-3">
                    <FieldLabel>
                      Jenis Usaha{" "}
                      <span className="text-xs text-red-500">*</span>
                    </FieldLabel>
                    <SearchablePopover<SegmentSubDetail>
                      open={openInvoiceOption === "businessType"}
                      onOpenChange={(open) =>
                        setOpenInvoiceOption(open ? "businessType" : null)
                      }
                      search={searchInvoiceOption}
                      onSearchChange={setSearchInvoiceOption}
                      placeholder="Pilih jenis usaha"
                      selectedLabel={
                        businessSubDetailOptions.find(
                          (option) =>
                            String(option.id) ===
                            formData.customerBusinessTypeId,
                        )?.name ?? null
                      }
                      selectedKey={formData.customerBusinessTypeId || null}
                      items={businessSubDetailOptions.filter((option) =>
                        option.name
                          ?.toLowerCase()
                          .includes(searchInvoiceOption.toLowerCase().trim()),
                      )}
                      getKey={(option) => String(option.id)}
                      renderItem={(option) => option.name ?? ""}
                      onSelect={(option) => {
                        setFormData((current) => ({
                          ...current,
                          customerBusinessTypeId: String(option.id),
                        }));
                        setSearchInvoiceOption("");
                        setOpenInvoiceOption(null);
                      }}
                      emptyText="Jenis usaha tidak ditemukan."
                      debounceDelay={0}
                      disabled={mode === "detail"}
                    />
                  </div>
                </div>
              </div>
            )}

            {isEducationSegment && (
              <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-slate-100 px-5 py-4 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="grid grid-cols-1 items-center gap-4 xl:grid-cols-[repeat(4,minmax(0,1fr))] xl:gap-6">
                  <div className="grid min-w-0 grid-cols-1 items-start gap-1 md:grid-cols-[110px_minmax(0,1fr)] md:items-center md:gap-3">
                    <FieldLabel>
                      Jenis <span className="text-xs text-red-500">*</span>
                    </FieldLabel>
                    <SearchablePopover<SegmentDetail>
                      open={openInvoiceOption === "educationType"}
                      onOpenChange={(open) =>
                        setOpenInvoiceOption(open ? "educationType" : null)
                      }
                      search={searchInvoiceOption}
                      onSearchChange={setSearchInvoiceOption}
                      placeholder={
                        segmentDetailsLoading
                          ? "Memuat jenis..."
                          : "Pilih jenis"
                      }
                      selectedLabel={
                        selectedSegmentDetail?.name ??
                        invoiceData?.segment_detail_name ??
                        null
                      }
                      selectedKey={formData.customerGroupTypeId || null}
                      items={segmentDetailOptions.filter((item) =>
                        item.name
                          ?.toLowerCase()
                          .includes(searchInvoiceOption.toLowerCase().trim()),
                      )}
                      getKey={(item) => String(item.id)}
                      renderItem={(item) => item.name ?? ""}
                      onSelect={(item) => {
                        pendingCustomerLocation.current = null;
                        setFormData((current) => ({
                          ...current,
                          customerGroupTypeId: String(item.id),
                          customerEducationLevelId: "",
                          customerGroupStatusId: "",
                          customerGroupNumber: "",
                          customCustomerGroupTag: "",
                          customerGroupTagOrder: [],
                          customerGroupName: "",
                          customerId: null,
                          customerProvinceId: null,
                          customerCityId: null,
                          customerProvinceName: "",
                          customerCityName: "",
                          customerContact: "",
                        }));
                        setSearchInvoiceOption("");
                        setOpenInvoiceOption(null);
                      }}
                      emptyText="Jenis tidak ditemukan."
                      disabled={
                        segmentDetailsLoading || Boolean(formData.customerId)
                      }
                      debounceDelay={0}
                    />
                  </div>

                  <div className="grid min-w-0 grid-cols-1 items-start gap-1 md:grid-cols-[110px_minmax(0,1fr)] md:items-center md:gap-3">
                    <FieldLabel>
                      Jenjang <span className="text-xs text-red-500">*</span>
                    </FieldLabel>
                    <SearchablePopover<SegmentSubDetail>
                      open={openInvoiceOption === "educationLevel"}
                      onOpenChange={(open) =>
                        setOpenInvoiceOption(open ? "educationLevel" : null)
                      }
                      search={searchInvoiceOption}
                      onSearchChange={setSearchInvoiceOption}
                      placeholder="Pilih jenjang"
                      selectedLabel={
                        selectedSubDetail?.name ??
                        invoiceData?.sub_segment_detail_name ??
                        null
                      }
                      selectedKey={formData.customerEducationLevelId || null}
                      items={subDetailOptions.filter((option) =>
                        option.name
                          ?.toLowerCase()
                          .includes(searchInvoiceOption.toLowerCase().trim()),
                      )}
                      getKey={(option) => String(option.id)}
                      renderItem={(option) => option.name ?? ""}
                      onSelect={(option) => {
                        setFormData((current) => ({
                          ...current,
                          customerEducationLevelId: String(option.id),
                          customerGroupStatusId: "",
                          customerId: null,
                          customerGroupName: formatCustomerGroupName(
                            String(option.id),
                            "",
                            current.customerGroupNumber,
                          ),
                        }));
                        setSearchInvoiceOption("");
                        setOpenInvoiceOption(null);
                      }}
                      emptyText="Jenjang tidak ditemukan."
                      disabled={
                        Boolean(formData.customerId) ||
                        formData.customerGroupTypeId === ""
                      }
                      debounceDelay={0}
                    />
                  </div>

                  <div className="grid min-w-0 grid-cols-1 items-start gap-1 md:grid-cols-[110px_minmax(0,1fr)] md:items-center md:gap-3">
                    <FieldLabel>
                      Status <span className="text-xs text-red-500">*</span>
                    </FieldLabel>
                    <SearchablePopover<SegmentOption>
                      open={openInvoiceOption === "educationStatus"}
                      onOpenChange={(open) =>
                        setOpenInvoiceOption(open ? "educationStatus" : null)
                      }
                      search={searchInvoiceOption}
                      onSearchChange={setSearchInvoiceOption}
                      placeholder="Pilih status"
                      selectedLabel={
                        selectedStatusOption?.name ??
                        invoiceData?.segment_option_name ??
                        null
                      }
                      selectedKey={formData.customerGroupStatusId || null}
                      items={segmentStatusOptions.filter((option) =>
                        option.name
                          ?.toLowerCase()
                          .includes(searchInvoiceOption.toLowerCase().trim()),
                      )}
                      getKey={(option) => String(option.id)}
                      renderItem={(option) => option.name ?? ""}
                      onSelect={(option) => {
                        setFormData((current) => ({
                          ...current,
                          customerGroupStatusId: String(option.id),
                          customerId: null,
                          customerGroupName: formatCustomerGroupName(
                            current.customerEducationLevelId,
                            String(option.id),
                            current.customerGroupNumber,
                          ),
                        }));
                        setSearchInvoiceOption("");
                        setOpenInvoiceOption(null);
                      }}
                      emptyText="Status tidak ditemukan."
                      disabled={
                        Boolean(formData.customerId) ||
                        formData.customerGroupTypeId === "" ||
                        formData.customerEducationLevelId === ""
                      }
                      debounceDelay={0}
                    />
                  </div>

                  <div className="grid min-w-0 grid-cols-1 items-start gap-1 md:grid-cols-[110px_minmax(0,1fr)] md:items-center md:gap-3">
                    <FieldLabel>
                      Nomor <span className="text-xs text-red-500">*</span>
                    </FieldLabel>
                    <SearchablePopover<InvoiceSearchOption>
                      open={openInvoiceOption === "customerGroupNumber"}
                      onOpenChange={(open) =>
                        setOpenInvoiceOption(
                          open ? "customerGroupNumber" : null,
                        )
                      }
                      search={searchInvoiceOption}
                      onSearchChange={setSearchInvoiceOption}
                      placeholder="Pilih nomor"
                      selectedLabel={
                        customerGroupNumberOptions.find(
                          (option) =>
                            option.value === formData.customerGroupNumber,
                        )?.label ?? null
                      }
                      selectedKey={formData.customerGroupNumber || null}
                      items={filterInvoiceOptions(
                        customerGroupNumberOptions,
                        searchInvoiceOption,
                      )}
                      getKey={(option) => option.value}
                      renderItem={(option) => option.label}
                      onSelect={(option) => {
                        setFormData((current) => ({
                          ...current,
                          customerGroupNumber: option.value,
                          customerId: null,
                          customerGroupName: formatCustomerGroupName(
                            current.customerEducationLevelId,
                            current.customerGroupStatusId,
                            option.value,
                          ),
                        }));
                        setSearchInvoiceOption("");
                        setOpenInvoiceOption(null);
                      }}
                      emptyText="Nomor tidak ditemukan."
                      disabled={
                        Boolean(formData.customerId) ||
                        formData.customerGroupTypeId === "" ||
                        formData.customerEducationLevelId === "" ||
                        formData.customerGroupStatusId === ""
                      }
                      debounceDelay={0}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="space-y-4 [&_[data-slot=field]]:!grid [&_[data-slot=field]]:!grid-cols-[160px_minmax(0,1fr)] [&_[data-slot=field]]:!items-center [&_[data-slot=field]]:!gap-3 [&_[data-slot=field]_button:not(.customer-search-button)]:!h-10 [&_[data-slot=field]_[data-slot=input]]:!h-10">
                  <Field orientation="horizontal">
                    <FieldLabel>
                      {isCustomerManualEntrySegment || isTravelSegment
                        ? "Nama Customer"
                        : "Nama Group"}{" "}
                      <span className="text-xs text-red-500">*</span>
                    </FieldLabel>
                    <CustomerSuggestionField
                      value={formData.customerGroupName}
                      segmentId={selectedInvoiceSegment?.id ?? null}
                      tags={customerFieldTags}
                      plainText={Boolean(formData.customerId)}
                      manualEntry={isCustomerManualEntrySegment}
                      existingOnly={isTravelSegment}
                      hideClearButton={mode === "detail"}
                      inputDisabled={
                        isEducationSegment &&
                        !isEducationNameReady &&
                        !formData.customerId
                      }
                      onPlainTextChange={(value) =>
                        setFormData((current) => ({
                          ...current,
                          customerGroupName: value,
                          customerId: null,
                        }))
                      }
                      onClearPlainText={() => {
                        pendingCustomerLocation.current = null;
                        setSearchCustomerProvince("");
                        setSearchCustomerCity("");
                        setFormData((current) => ({
                          ...current,
                          customerId: null,
                          customerGroupName: "",
                          customerProvinceId: null,
                          customerCityId: null,
                          customerProvinceName: "",
                          customerCityName: "",
                          customerContact: "",
                          customerGroupTypeId: "",
                          customerEducationLevelId: "",
                          customerGroupStatusId: "",
                          customerBusinessFieldId: "",
                          customerBusinessTypeId: "",
                        }));
                      }}
                      onReorderTags={(ids) =>
                        setFormData((current) => ({
                          ...current,
                          customerGroupTagOrder: ids,
                          customerGroupName: formatCustomerGroupName(
                            current.customerEducationLevelId,
                            current.customerGroupStatusId,
                            current.customerGroupNumber,
                            current.customCustomerGroupTag,
                            ids,
                          ),
                        }))
                      }
                      onAddTextTag={(text) =>
                        setFormData((current) => ({
                          ...current,
                          customCustomerGroupTag: [
                            current.customCustomerGroupTag,
                            text,
                          ]
                            .filter(Boolean)
                            .join(" "),
                          customerGroupName: isEducationSegment
                            ? formatCustomerGroupName(
                                current.customerEducationLevelId,
                                current.customerGroupStatusId,
                                current.customerGroupNumber,
                                [current.customCustomerGroupTag, text]
                                  .filter(Boolean)
                                  .join(" "),
                              )
                            : [current.customerGroupName, text]
                                .filter(Boolean)
                                .join(" "),
                          customerId: null,
                        }))
                      }
                      onSelect={(customer) => {
                        const segmentId =
                          customer.segment?.id ?? customer.segment_id;
                        const segmentName =
                          customer.segment?.name.toLowerCase() ?? "";
                        const isCustomerCorporate =
                          segmentName.includes("corporate");
                        const detailId =
                          customer.segment_detail?.id ??
                          customer.segment_detail_id;
                        const subDetailId =
                          customer.sub_segment_detail?.id ?? null;
                        const segmentOptionId =
                          customer.segment_option_id ??
                          customer.segment_option?.id ??
                          null;
                        const customerProvince = provinces.find(
                          (province) =>
                            province.name.toLowerCase().trim() ===
                            customer.province_name?.toLowerCase().trim(),
                        );
                        const customerCityName = customer.city_name
                          ?.toLowerCase()
                          .trim();
                        const existingCity =
                          customerProvince?.id === formData.customerProvinceId
                            ? customerCities.find(
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
                                  formData.customerProvinceId ||
                                customerCitiesLoading,
                            }
                          : null;
                        setFormData((current) => ({
                          ...current,
                          customerGroupName: customer.name,
                          customCustomerGroupTag: "",
                          customerGroupTagOrder: [],
                          customerEmail: customer.email ?? "",
                          customerContactPerson: customer.contact_person ?? "",
                          customerName: customer.contact_person ?? "",
                          customerProvinceName: customer.province_name ?? "",
                          customerCityName: customer.city_name ?? "",
                          invoiceSegment: String(segmentId),
                          invoiceSegmentName: customer.segment?.name ?? "",
                          customerBusinessFieldId: isCustomerCorporate
                            ? String(detailId)
                            : "",
                          customerBusinessTypeId:
                            isCustomerCorporate && subDetailId !== null
                              ? String(subDetailId)
                              : "",
                          customerGroupTypeId: isCustomerCorporate
                            ? ""
                            : String(detailId),
                          customerEducationLevelId:
                            !isCustomerCorporate && subDetailId !== null
                              ? String(subDetailId)
                              : "",
                          customerGroupStatusId:
                            segmentOptionId !== null
                              ? String(segmentOptionId)
                              : "",
                          customerGroupNumber: "",
                          customerContact: customer.phone ?? "",
                          customerId: customer.id,
                          customerProvinceId: customerProvince?.id ?? null,
                          customerCityId: existingCity?.id ?? null,
                        }));
                      }}
                    />
                    {/* {isTravelSegment ? (
                      <p className="mt-1 text-xs text-slate-500">
                        Cari dan pilih customer dari data existing.
                      </p>
                    ) : isEducationSegment &&
                      !isEducationNameReady &&
                      !formData.customerId ? (
                      <p className="mt-1 text-xs text-slate-500 ">
                        Pilih jenis, jenjang, status, dan nomor untuk mengaktifkan input nama group.
                      </p>
                    ) : isEducationSegment && !formData.customerId ? (
                      <p className="mt-1 text-xs text-slate-500">
                        Tambahkan kata di belakang nama group bila diperlukan.
                      </p>
                    ) : null} */}
                  </Field>
                  <Field orientation="horizontal">
                    <FieldLabel>
                      Provinsi <span className="text-xs text-red-500">*</span>
                    </FieldLabel>

                    <div className="min-w-0 space-y-1">
                      <SearchablePopover<Province>
                        open={openCustomerProvince}
                        onOpenChange={setOpenCustomerProvince}
                        search={searchCustomerProvince}
                        onSearchChange={setSearchCustomerProvince}
                        placeholder={
                          provinceLoading
                            ? "Memuat provinsi..."
                            : "Pilih provinsi"
                        }
                        selectedLabel={
                          selectedCustomerProvince?.name ??
                          formData.customerProvinceName ??
                          null
                        }
                        selectedKey={
                          formData.customerProvinceId !== null
                            ? String(formData.customerProvinceId)
                            : null
                        }
                        items={filteredCustomerProvinces}
                        getKey={(province) => String(province.id)}
                        renderItem={(province) => province.name}
                        onSelect={(province) =>
                          handleCustomerProvinceChange(province.id)
                        }
                        disabled={
                          provinceLoading || Boolean(formData.customerId)
                        }
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
                      open={openCustomerCity}
                      onOpenChange={setOpenCustomerCity}
                      search={searchCustomerCity}
                      onSearchChange={setSearchCustomerCity}
                      placeholder={
                        formData.customerProvinceId === null
                          ? "Pilih provinsi terlebih dahulu"
                          : customerCitiesLoading
                            ? "Memuat kota..."
                            : "Pilih kota"
                      }
                      selectedLabel={
                        selectedCustomerCity?.name ??
                        formData.customerCityName ??
                        null
                      }
                      selectedKey={
                        formData.customerCityId !== null
                          ? String(formData.customerCityId)
                          : null
                      }
                      items={filteredCustomerCities}
                      getKey={(city) => String(city.id)}
                      renderItem={(city) => city.name}
                      onSelect={(city) => {
                        setFormData((current) => ({
                          ...current,
                          customerCityId: city.id,
                          customerCityName: city.name,
                        }));
                        setSearchCustomerCity("");
                        setOpenCustomerCity(false);
                      }}
                      disabled={
                        formData.customerProvinceId === null ||
                        customerCitiesLoading ||
                        provinceLoading ||
                        Boolean(formData.customerId)
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
                      disabled={approvalStatus !== "draft"}
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
                      disabled={approvalStatus !== "draft"}
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
                      disabled={Boolean(formData.customerId)}
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
              onClick={() => {
                setEditingOrderId(null);
                setOpenCreateDetailInvoice(true);
              }}
              disabled={approvalStatus !== "draft"}
            >
              <Plus size={16} />
              Tambah
            </Button>
          }
        >
          <div className="p-5">
            <DetailOrderTable
              data={formData.orderItems}
              onEdit={handleEditOrder}
              onDelete={handleDeleteOrder}
              actionsDisabled={
                approvalStatus !== "draft"
              }
            />
          </div>
        </DetailSection>

        {mode === "detail" && (
          <DetailSection
            icon={HandCoins}
            title="Informasi Pembayaran"
            variant="green"
            action={
              <Button variant="primer" size="lg" onClick={openPaymentEditor} disabled={invoiceData?.payment_status === "paid"}>
                {hasPendingPayment ? <Pencil size={16} /> : <Plus size={16} />}
                {hasPendingPayment ? "Ubah Pembayaran" : "Tambah Pembayaran"}
              </Button>
            }
          >
            <div className="p-5">
              <PaymentInformation
                totalAmount={
                  paymentAmountsOverride?.totalAmount ??
                  invoiceData?.total_amount ??
                  0
                }
                paidAmount={
                  paymentAmountsOverride?.paidAmount ??
                  invoiceData?.paid_amount ??
                  0
                }
                remainingAmount={
                  paymentAmountsOverride?.remainingAmount ??
                  invoiceData?.remaining_amount ??
                  0
                }
              />
            </div>
            <div className="px-5 pb-5">
              <DetailPaymentTable data={paymentRows} />
            </div>
          </DetailSection>
        )}

        <CreatePaymentModal
          open={openPaymentModal}
          onClose={() => setOpenPaymentModal(false)}
          onSave={savePaymentDraft}
          initialValue={paymentForm}
          hasPendingPayment={hasPendingPayment}
          totalAmount={
            paymentAmountsOverride?.totalAmount ??
            invoiceData?.total_amount ??
            0
          }
          paidAmount={
            paymentAmountsOverride?.paidAmount ?? invoiceData?.paid_amount ?? 0
          }
          remainingAmount={
            paymentAmountsOverride?.remainingAmount ??
            invoiceData?.remaining_amount ??
            0
          }
        />

        <CreateDetailInvoice
          open={openCreateDetailInvoice}
          initialValue={
            editingOrderId === null
              ? null
              : (formData.orderItems.find(
                  (order) => order.id === editingOrderId,
                ) ?? null)
          }
          onClose={() => {
            setOpenCreateDetailInvoice(false);
            setEditingOrderId(null);
          }}
          onSave={handleSaveOrder}
        />

        {mode === "detail" && invoiceData && (
          <>
            <SROHistoryApproval approvals={approvalHistory} />
          </>
        )}
      </DetailPageLayout>
    </>
  );
}
