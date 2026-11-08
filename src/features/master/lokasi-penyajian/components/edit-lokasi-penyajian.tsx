import { useEffect, useState, type SubmitEvent } from "react";
import AppModal from "@/components/base-modal";
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
import { FaSave } from "react-icons/fa";
import { FaPen } from "react-icons/fa6";
import type { LokasiPenyajianDetail, UpdateLokasiPenyajianPayload } from "../types/lokasi-penyajian";
import { createLokasiPenyajianFormSchema } from "../schemas/lokasi-penyajian-scehma";


type EditMasterProps = {
    open: boolean;
    lokasiPenyajian: LokasiPenyajianDetail | null;
    loadingLokasiPenyajian: boolean;
    lokasiPenyajianError: string | null;
    submitting: boolean;
    submitError: string | null;
    onClose: () => void;
    onSubmit: (payload: UpdateLokasiPenyajianPayload) => Promise<void>;
};

const EditMasterLokasiPenyajian = ({
    open,
    lokasiPenyajian,
    loadingLokasiPenyajian,
    lokasiPenyajianError,
    submitting,
    submitError,
    onClose,
    onSubmit,
}: EditMasterProps) => {
    const [name, setName] = useState("");
    const [quota, setQuota] = useState("0");
    const [isActive, setIsActive] = useState(true);
    const [nameError, setNameError] = useState<string | null>(null);
    const [quotaError, setQuotaError] = useState<string | null>(null);

    useEffect(() => {
        if (!open || !lokasiPenyajian) return;
        setName(lokasiPenyajian.name);
        setQuota(lokasiPenyajian.quota);
        setIsActive(lokasiPenyajian.is_active);
        setNameError(null);
        setQuotaError(null);
    }, [open, lokasiPenyajian]);

    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting || !lokasiPenyajian) return;

        const validation = createLokasiPenyajianFormSchema.safeParse({ name, quota });
        if (!validation.success) {
            setNameError(
                validation.error.issues[0]?.message ?? "Nama lokasi Penyajian tidak valid.",
            );
            setQuotaError(
                validation.error.issues[1]?.message ?? "Kuota lokasi Penyajian tidak valid.",
            );
            return;
        }

        setNameError(null);
        setQuotaError(null);
        try {
            await onSubmit({ name: validation.data.name, quota: quota, is_active: isActive });
        } catch {
            // Parent menampilkan pesan gagal dan mempertahankan nilai form.
        }
    };

    return (
        <AppModal
            open={open}
            onClose={onClose}
            title="Edit Master Lokasi Penyajian"
            icon={<FaPen />}
            className="max-w-lg max-h-[70vh]"
            footer={
                <div className="flex justify-end gap-3">
                    <Button variant="destructive" onClick={onClose}>
                        Batal
                    </Button>
                    <Button
                        variant="primer"
                        type="submit"
                        form="edit-lokasi-penyajian-form"
                        disabled={submitting || loadingLokasiPenyajian || !lokasiPenyajian}
                    >
                        <FaSave size={14} />
                        {submitting ? "Menyimpan..." : "Simpan"}
                    </Button>
                </div>
            }
        >
            {loadingLokasiPenyajian ? (
                <p className="py-8 text-center text-sm text-slate-500">
                    Memuat detail lokasi penyajian...
                </p>
            ) : lokasiPenyajianError ? (
                <p role="alert" className="py-6 text-sm text-red-600">
                    {lokasiPenyajianError}
                </p>
            ) : lokasiPenyajian ? (
                <form
                    id="edit-lokasi-penyajian-form"
                    onSubmit={(event) => void handleSubmit(event)}
                >
                    <AppModal.Section title="Lokasi Penyajian" showHeader={false}>
                        <div className="space-y-4">
                            <Field>
                                <FieldLabel>Nama Lokasi Penyajian</FieldLabel>
                                <Input
                                    placeholder="Masukkan nama lokasi penyajian"
                                    value={name}
                                    onChange={(event) => {
                                        setName(event.target.value);
                                        setNameError(null);
                                    }}
                                />
                                {nameError && (
                                    <p role="alert" className="text-sm text-red-500">
                                        {nameError}
                                    </p>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel>Kuota Lokasi Penyajian</FieldLabel>
                                <Input
                                    type="number"
                                    min="0"
                                    placeholder="Masukkan kuota lokasi penyajian"
                                    value={quota ?? ""}
                                    onChange={(event) => {
                                        setQuota(event.target.value);
                                        setQuotaError(null);
                                    }}
                                />
                                {quotaError && (
                                    <p role="alert" className="text-sm text-red-500">
                                        {quotaError}
                                    </p>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel>Status Lokasi Penyajian</FieldLabel>
                                <Select
                                    value={String(isActive)}
                                    onValueChange={(value) => setIsActive(value === "true")}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue>{isActive ? "Aktif" : "Nonaktif"}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent align="start" alignItemWithTrigger={false}>
                                        <SelectItem value="true">Aktif</SelectItem>
                                        <SelectItem value="false">Nonaktif</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            {submitError && (
                                <p role="alert" className="text-sm text-red-600">
                                    {submitError}
                                </p>
                            )}
                        </div>
                    </AppModal.Section>
                </form>
            ) : null}
        </AppModal>
    );
};

export default EditMasterLokasiPenyajian;
