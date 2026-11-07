
import { useEffect, useState } from "react";

import AppModal from "@/components/base-modal";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { FaSave, FaPlus, FaTrash } from "react-icons/fa";
import { Layers, ListTree, Tags } from "lucide-react";

import { segmentSchema } from "../schema/master-segment-schema";
import type { CreateSegmentPayload } from "../types/master-segment";

type CreateMasterSegmentProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSegmentPayload) => Promise<void>;
  submitting?: boolean;
};

type SubDetailForm = {
  name: string;
};

type DetailForm = {
  name: string;
  sub_details: SubDetailForm[];
};

type SegmentForm = {
  name: string;
  details: DetailForm[];
};

type ValidationErrors = Record<string, string>;

const initialSubDetail: SubDetailForm = {
  name: "",
};

const initialDetail: DetailForm = {
  name: "",
  sub_details: [{ ...initialSubDetail }],
};

const initialForm: SegmentForm = {
  name: "",
  details: [{ ...initialDetail }],
};

const CreateMasterSegment = ({
  open,
  onClose,
  onSubmit,
  submitting = false,
}: CreateMasterSegmentProps) => {
  const [form, setForm] = useState<SegmentForm>({
    ...initialForm,
  });

  const [validationErrors, setValidationErrors] =
    useState<ValidationErrors>({});

  // RESET FORM SAAT MODAL DIBUKA
  useEffect(() => {
    if (open) {
      setForm({
        name: "",
        details: [
          {
            name: "",
            sub_details: [{ ...initialSubDetail }],
          },
        ],
      });

      setValidationErrors({});
    }
  }, [open]);

  const getError = (field: string) => validationErrors[field];

  const clearError = (...fields: string[]) => {
    setValidationErrors((previous) => {
      const next = { ...previous };

      fields.forEach((field) => {
        delete next[field];
      });

      return next;
    });
  };

  // INPUT NAMA SEGMENT
  const handleSegmentChange = (value: string) => {
    setForm((previous) => ({
      ...previous,
      name: value,
    }));

    clearError("name");
  };

  // INPUT NAMA DETAIL SEGMENT
  const handleDetailChange = (
    index: number,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      details: previous.details.map((detail, detailIndex) =>
        detailIndex === index
          ? { ...detail, name: value }
          : detail,
      ),
    }));

    clearError(`details.${index}.name`);
  };

  // INPUT NAMA SUB DETAIL
  const handleSubDetailChange = (
    detailIndex: number,
    subIndex: number,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      details: previous.details.map((detail, index) =>
        index === detailIndex
          ? {
              ...detail,
              sub_details: detail.sub_details.map(
                (subDetail, indexSub) =>
                  indexSub === subIndex
                    ? { ...subDetail, name: value }
                    : subDetail,
              ),
            }
          : detail,
      ),
    }));

    clearError(
      `details.${detailIndex}.sub_details.${subIndex}.name`,
    );
  };

  // TAMBAH DETAIL SEGMENT
  const handleAddDetail = () => {
    setForm((previous) => ({
      ...previous,
      details: [
        ...previous.details,
        {
          name: "",
          sub_details: [{ ...initialSubDetail }],
        },
      ],
    }));

    setValidationErrors({});
  };

  // HAPUS DETAIL SEGMENT
  const handleRemoveDetail = (index: number) => {
    setForm((previous) => ({
      ...previous,
      details: previous.details.filter(
        (_, detailIndex) => detailIndex !== index,
      ),
    }));

    setValidationErrors({});
  };

  // TAMBAH SUB DETAIL
  const handleAddSubDetail = (detailIndex: number) => {
    setForm((previous) => ({
      ...previous,
      details: previous.details.map((detail, index) =>
        index === detailIndex
          ? {
              ...detail,
              sub_details: [
                ...detail.sub_details,
                { ...initialSubDetail },
              ],
            }
          : detail,
      ),
    }));

    setValidationErrors({});
  };

  // HAPUS SUB DETAIL
  const handleRemoveSubDetail = (
    detailIndex: number,
    subIndex: number,
  ) => {
    setForm((previous) => ({
      ...previous,
      details: previous.details.map((detail, index) =>
        index === detailIndex
          ? {
              ...detail,
              sub_details: detail.sub_details.filter(
                (_, indexSub) => indexSub !== subIndex,
              ),
            }
          : detail,
      ),
    }));

    setValidationErrors({});
  };

  // SUBMIT
  const handleSubmit = async () => {
    if (submitting) return;

    const payload: CreateSegmentPayload = {
      name: form.name.trim(),
      is_active: true,
      details: form.details.map((detail) => ({
        name: detail.name.trim() || null,
        is_active: true,
        sub_details: detail.sub_details.map((subDetail) => ({
          name: subDetail.name.trim() || null,
          is_active: true,
        })),
      })),
    };

    const result = segmentSchema.safeParse(payload);

    if (!result.success) {
      const errors: ValidationErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path.join(".");

        if (!errors[field]) {
          errors[field] = issue.message;
        }
      });

      console.error(
        "[Master Segment] Validasi gagal:",
        result.error.issues,
      );

      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    try {
      await onSubmit(payload);
    } catch (error) {
      console.error("[Master Segment] onSubmit gagal:", error);
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Tambah Master Segment"
      icon={<FaPlus />}
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
            disabled={submitting}
          >
            <FaSave size={14} />
            {submitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      }
    >
      <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
        {/* NAMA SEGMENT */}
        <AppModal.Section
          title="Informasi Segment"
          icon={<Layers size={18} />}
        >
          <Field>
            <FieldLabel>Nama Segmen</FieldLabel>

            <Input
              value={form.name}
              onChange={(event) =>
                handleSegmentChange(event.target.value)
              }
              placeholder="Masukkan nama segmen"
            />

            {getError("name") && (
              <p className="text-sm text-red-500">
                {getError("name")}
              </p>
            )}
          </Field>
        </AppModal.Section>

        {/* DETAIL SEGMENT */}
        <AppModal.Section
          title="Detail Segmen"
          icon={<ListTree size={18} />}
          headerAction={
            <Button
              type="button"
              variant="blue"
              onClick={handleAddDetail}
              disabled={submitting}
              className="shrink-0 whitespace-nowrap"
            >
              <FaPlus size={13} />
              Tambah
            </Button>
          }
        >
          <div className="space-y-4">
            {form.details.map((detail, detailIndex) => (
              <div
                key={detailIndex}
                className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-800 dark:text-white">
                    Detail Segmen {detailIndex + 1}
                  </h3>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() =>
                      handleRemoveDetail(detailIndex)
                    }
                    disabled={
                      submitting || form.details.length <= 1
                    }
                  >
                    <FaTrash size={12} />
                    Hapus
                  </Button>
                </div>

                <Field>
                  <FieldLabel>Nama Detail Segmen</FieldLabel>

                  <Input
                    value={detail.name}
                    onChange={(event) =>
                      handleDetailChange(
                        detailIndex,
                        event.target.value,
                      )
                    }
                    placeholder="Masukkan nama detail segmen"
                  />

                  {getError(`details.${detailIndex}.name`) && (
                    <p className="text-sm text-red-500">
                      {getError(`details.${detailIndex}.name`)}
                    </p>
                  )}
                </Field>

                {/* SUB DETAIL SEGMENT */}
                <div className="space-y-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Tags
                        size={16}
                        className="text-emerald-500"
                      />

                      <h4 className="text-sm font-semibold">
                        Sub Segmen Detail
                      </h4>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleAddSubDetail(detailIndex)
                      }
                      disabled={submitting}
                    >
                      <FaPlus size={11} />
                      Tambah
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {detail.sub_details.map(
                      (subDetail, subIndex) => (
                        <div
                          key={subIndex}
                          className="flex items-start gap-2"
                        >
                          <div className="flex-1">
                            <Field>
                              <FieldLabel>
                                Sub Segmen Detail {subIndex + 1}
                              </FieldLabel>

                              <Input
                                value={subDetail.name}
                                onChange={(event) =>
                                  handleSubDetailChange(
                                    detailIndex,
                                    subIndex,
                                    event.target.value,
                                  )
                                }
                                placeholder="Masukkan sub segmen detail"
                              />

                              {getError(
                                `details.${detailIndex}.sub_details.${subIndex}.name`,
                              ) && (
                                <p className="text-sm text-red-500">
                                  {getError(
                                    `details.${detailIndex}.sub_details.${subIndex}.name`,
                                  )}
                                </p>
                              )}
                            </Field>
                          </div>

                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="mt-7 shrink-0"
                            onClick={() =>
                              handleRemoveSubDetail(
                                detailIndex,
                                subIndex,
                              )
                            }
                            disabled={
                              submitting ||
                              detail.sub_details.length <= 1
                            }
                          >
                            <FaTrash size={12} />
                          </Button>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AppModal.Section>
      </div>
    </AppModal>
  );
};

export default CreateMasterSegment;
