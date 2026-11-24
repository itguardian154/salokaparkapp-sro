
import { useEffect, useMemo, type ReactNode } from "react";
import { Building2, Paperclip, ExternalLink } from "lucide-react";
import { FaPen } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import API_URLS from "@/config/env";
import { formatTanggal } from "@/lib/utils";

type ShoppingVoucherView = {
    name: string;
    quantity: string | number;
    pecahan: string | number;
};

// Bentuk attachment dari response GET Detail Reservasi.
type EventOrderApiAttachment = {
    id: number;
    name: string;
    mime_type: string;
    size: number;
    url: string;
};

export type EventOrderDisplayData = {
    id?: number | string;
    department_id: string | number;
    department_name: string | null;
    description: string | null;
    product_description: string | null;
    quantity: number | string | null;
    unit_price: number | string | null;
    serving_type: string | null;
    serving_time: string | null;
    serving_location: string | null;
    ticket_print_date: string | null;
    meal_voucher: number | null;
    voucher_tour_leader: number | null;
    shopping_voucher: ShoppingVoucherView[] | null;
    attachments?: (
        | string
        | File
        | EventOrderApiAttachment
    )[] | null;
    attachmentFiles?: File[];
};

type EventOrderContentProps = {
    item: EventOrderDisplayData;
    onEdit?: () => void;
    isAssignedDepartment?: boolean;
    status?: {
        label: string;
        positive: boolean;
    };
};

const hasValue = (value: unknown) =>
    value !== null &&
    value !== undefined &&
    String(value).trim() !== "";

const resolveAttachmentUrl = (url: string) => {
    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    const backendUrl = API_URLS.sro.replace(/api\/?$/, "");

    return new URL(
        url.replace(/^\/+/, ""),
        backendUrl,
    ).toString();
};

const openAttachment = (url: string) => {
    window.open(
        resolveAttachmentUrl(url),
        "_blank",
        "noopener,noreferrer",
    );
};

const isImageFile = (fileName: string, mimeType?: string) => {
    return (
        mimeType?.startsWith("image/") ||
        /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(fileName)
    );
};

const InfoItem = ({
    label,
    value,
}: {
    label: string;
    value: ReactNode;
}) => (
    <div className="min-w-0 space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
        </p>

        <div className="wrap-break-word text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-200">
            {hasValue(value) ? value : "-"}
        </div>
    </div>
);

const EventOrderContent = ({
    item,
    onEdit,
    status,
    isAssignedDepartment = false,
}: EventOrderContentProps) => {
    const isIR = String(item.department_id) === "DP005";
    const isFinance = String(item.department_id) === "DP013";

    // Attachment berbentuk URL string.
    const attachmentUrls = useMemo(
        () =>
            (item.attachments ?? []).filter(
                (attachment): attachment is string =>
                    typeof attachment === "string",
            ),
        [item.attachments],
    );

    // Attachment berbentuk object dari response GET Detail.
    const apiAttachments = useMemo(
        () =>
            (item.attachments ?? []).filter(
                (
                    attachment,
                ): attachment is EventOrderApiAttachment =>
                    typeof attachment === "object" &&
                    attachment !== null &&
                    !(attachment instanceof File) &&
                    "url" in attachment,
            ),
        [item.attachments],
    );

    // File baru dari proses edit/upload tetap dipertahankan.
    const attachmentFiles = useMemo(
        () => [
            ...(item.attachments ?? []).filter(
                (attachment): attachment is File =>
                    attachment instanceof File,
            ),
            ...(item.attachmentFiles ?? []),
        ],
        [item.attachments, item.attachmentFiles],
    );

    // Membuat URL preview untuk file baru.
    const filePreviews = useMemo(
        () =>
            attachmentFiles.map((file) => ({
                file,
                url: URL.createObjectURL(file),
            })),
        [attachmentFiles],
    );

    // Membersihkan object URL ketika file berubah atau komponen dilepas.
    useEffect(() => {
        return () => {
            filePreviews.forEach(({ url }) => {
                URL.revokeObjectURL(url);
            });
        };
    }, [filePreviews]);

    const hasAttachments =
        attachmentUrls.length > 0 ||
        apiAttachments.length > 0 ||
        filePreviews.length > 0;

    return (
        <div
            className={`overflow-hidden rounded-xl border transition-colors ${
                isAssignedDepartment
                    ? "border-emerald-300 bg-emerald-50/30 dark:border-emerald-700 dark:bg-emerald-950/10"
                    : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
            }`}
        >
            {/* HEADER CARD DEPARTEMEN */}
            <div
                className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 ${
                    isAssignedDepartment
                        ? "border-emerald-200 bg-emerald-100/70 dark:border-emerald-800 dark:bg-emerald-950/40"
                        : "border-slate-100 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900/30"
                }`}
            >
                <div className="flex min-w-0 items-center gap-3">
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                            isAssignedDepartment
                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                                : "bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400"
                        }`}
                    >
                        <Building2 size={19} />
                    </div>

                    <div className="min-w-0">
                        <h3 className="wrap-break-word text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {hasValue(item.department_name)
                                ? item.department_name
                                : "Nama Departemen -"}
                        </h3>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {isAssignedDepartment && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                            Departemen Anda
                        </span>
                    )}

                    {status && (
                        <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                status.positive
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                            }`}
                        >
                            {status.label}
                        </span>
                    )}

                    {onEdit && (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={onEdit}
                            title="Edit"
                            className="border-orange-300 text-orange-500 hover:bg-orange-50 hover:text-orange-600 dark:border-orange-500/40 dark:hover:bg-orange-500/10"
                        >
                            <FaPen className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* DETAIL CARD */}
            <div className="space-y-4 p-4">
                {/* IR */}
                {isIR && (
                    <>
                        <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
                            <h4 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Food & Beverage
                            </h4>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <InfoItem label="Paket" value={item.product_description} />
                                <InfoItem label="Penyajian" value={item.serving_type} />
                                <InfoItem label="Jumlah Pax" value={item.quantity} />
                                <InfoItem label="Jam Penyajian" value={item.serving_time} />
                                <InfoItem label="Harga" value={item.unit_price} />
                                <InfoItem label="Tempat Penyajian" value={item.serving_location} />
                                <InfoItem label="Detail Menu" value={item.product_description} />
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
                            <h4 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Retail & Merchandise
                            </h4>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <InfoItem label="Nama Barang" value={item.product_description} />
                                <InfoItem label="Jumlah" value={item.quantity} />
                                <InfoItem label="Harga" value={item.unit_price} />
                            </div>
                        </div>
                    </>
                )}

                {/* FINANCE */}
                {isFinance && (
                    <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <InfoItem
                                label="Tanggal Cetak Tiket"
                                value={
                                    hasValue(item.ticket_print_date)
                                        ? formatTanggal(String(item.ticket_print_date))
                                        : "-"
                                }
                            />

                            <InfoItem
                                label="Kupon Makan"
                                value={item.meal_voucher}
                            />

                            <InfoItem
                                label="Kupon Belanja"
                                value={
                                    item.shopping_voucher?.length ? (
                                        <div className="flex flex-col gap-1">
                                            {item.shopping_voucher.map(
                                                (voucher, index) => (
                                                    <div key={index}>
                                                        {index + 1}. {voucher.name} (
                                                        {voucher.quantity} x Rp
                                                        {Number(
                                                            voucher.pecahan,
                                                        ).toLocaleString("id-ID")}
                                                        )
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        "-"
                                    )
                                }
                            />

                            <InfoItem
                                label="Voucher Tour Leader"
                                value={item.voucher_tour_leader}
                            />
                        </div>
                    </div>
                )}

                {/* DEPARTEMEN LAINNYA */}
                {!isIR && !isFinance && (
                    <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
                        <InfoItem
                            label="Desc Request"
                            value={
                                <p className="text-sm italic leading-relaxed text-slate-600 dark:text-slate-300">
                                    "{item.description}"
                                </p>
                            }
                        />
                    </div>
                )}

                {/* DESKRIPSI TAMBAHAN */}
                {(isIR || isFinance) && (
                    <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
                        <InfoItem
                            label="Desc Request"
                            value={
                                <p className="text-sm italic leading-relaxed text-slate-600 dark:text-slate-300">
                                    "{item.description}"
                                </p>
                            }
                        />
                    </div>
                )}

                {/* ATTACHMENTS - SEMUA DEPARTEMEN */}
                <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
                    <InfoItem
                        label="Lampiran"
                        value={
                            hasAttachments ? (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                    {/* FILE BARU */}
                                    {filePreviews.map(({ file, url }, index) => {
                                        const isImage = isImageFile(
                                            file.name,
                                            file.type,
                                        );

                                        return (
                                            <div
                                                key={`new-${file.name}-${index}`}
                                                className="overflow-hidden rounded-lg border border-orange-200 dark:border-orange-500/30"
                                            >
                                                {isImage ? (
                                                    <a
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <img
                                                            src={url}
                                                            alt={file.name}
                                                            className="h-36 w-full bg-slate-100 object-cover"
                                                        />
                                                    </a>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            window.open(
                                                                url,
                                                                "_blank",
                                                                "noopener,noreferrer",
                                                            )
                                                        }
                                                        className="flex h-36 w-full flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900"
                                                    >
                                                        <Paperclip className="h-6 w-6" />
                                                        <span className="max-w-full truncate px-2 text-sm">
                                                            {file.name}
                                                        </span>
                                                        <span className="text-[10px] text-orange-600 dark:text-orange-400">
                                                            File baru
                                                        </span>
                                                    </button>
                                                )}

                                                <div className="flex items-center justify-between gap-2 border-t border-orange-200 px-3 py-2 text-xs dark:border-orange-500/30">
                                                    <span className="truncate">
                                                        {file.name}
                                                    </span>
                                                    <span className="shrink-0 text-orange-600 dark:text-orange-400">
                                                        Baru
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* LAMPIRAN BERUPA URL STRING */}
                                    {attachmentUrls.map((attachment, index) => {
                                        const fileUrl = resolveAttachmentUrl(attachment);
                                        const fileName =
                                            attachment.split("/").pop() ||
                                            `Lampiran ${index + 1}`;

                                        const isImage = isImageFile(fileName);

                                        return (
                                            <div
                                                key={`url-${attachment}-${index}`}
                                                className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
                                            >
                                                {isImage ? (
                                                    <a
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <img
                                                            src={fileUrl}
                                                            alt={fileName}
                                                            className="h-36 w-full bg-slate-100 object-cover"
                                                        />
                                                    </a>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openAttachment(attachment)
                                                        }
                                                        className="flex h-36 w-full flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900"
                                                    >
                                                        <Paperclip className="h-6 w-6" />
                                                        <span className="max-w-full truncate px-2 text-sm">
                                                            {fileName}
                                                        </span>
                                                    </button>
                                                )}

                                                <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-3 py-2 text-xs dark:border-slate-700">
                                                    <span className="truncate">
                                                        {fileName}
                                                    </span>
                                                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* LAMPIRAN OBJECT DARI API GET DETAIL */}
                                    {apiAttachments.map((attachment) => {
                                        const fileUrl = resolveAttachmentUrl(
                                            attachment.url,
                                        );

                                        const isImage = isImageFile(
                                            attachment.name,
                                            attachment.mime_type,
                                        );

                                        return (
                                            <div
                                                key={`api-${attachment.id}`}
                                                className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
                                            >
                                                {isImage ? (
                                                    <a
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <img
                                                            src={fileUrl}
                                                            alt={attachment.name}
                                                            className="h-36 w-full bg-slate-100 object-cover"
                                                        />
                                                    </a>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openAttachment(
                                                                attachment.url,
                                                            )
                                                        }
                                                        className="flex h-36 w-full flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900"
                                                    >
                                                        <Paperclip className="h-6 w-6" />
                                                        <span className="max-w-full truncate px-2 text-sm">
                                                            {attachment.name}
                                                        </span>
                                                    </button>
                                                )}

                                                <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-3 py-2 text-xs dark:border-slate-700">
                                                    <span className="truncate">
                                                        {attachment.name}
                                                    </span>
                                                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                "-"
                            )
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default EventOrderContent;
