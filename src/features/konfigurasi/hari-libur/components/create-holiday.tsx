import AppModal from "@/components/base-modal";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import DateRangePicker from "@/components/date-range-picker";
import type { DateRange } from "react-day-picker";
import { useState } from "react";
import { FaSave } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";

type CreateHolidayProps = {
  open: boolean;
  onClose: () => void;
};

const CreateHoliday = ({ open, onClose }: CreateHolidayProps) => {
  const [dateRange, setDateRange] = useState<DateRange>();

  const handleClose = () => {
    //clearForm();
    onClose();
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="Tambah Hari Libur"
      className="max-w-lg max-h-[70vh]"
      icon={<FaPlus />}
      footer={
        <div className="flex justify-end gap-3">
          {" "}
          <Button variant="destructive" onClick={handleClose}>
            Batal{" "}
          </Button>
          <Button variant="primer" onClick={() => {}}>
            <FaSave size={14} />
            Simpan
            {/* {submitting ? "Menyimpan..." : "Simpan"} */}
          </Button>
        </div>
      }
    >
      <AppModal.Section title="Hari Libur" showHeader={false}>
        <div className="space-y-3">
          <Field>
            <FieldLabel>Hari Libur</FieldLabel>

            <Input
              placeholder="Masukkan hari libur"
              // value={formData.name}
              // onChange={(event) => {
              //   const value = event.target.value;
              //   setFormData((current) => ({ ...current, name: value }));
              //   if (value.trim()) {
              //     setValidationErrors((current) => ({
              //       ...current,
              //       name: undefined,
              //     }));
              //   }
              // }}
            />
            {/* {validationErrors.name && (
              <p role="alert" className="text-sm text-red-500">
                {validationErrors.name}
              </p>
            )} */}
          </Field>

          <Field>
            <FieldLabel>Tanggal</FieldLabel>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </Field>
        </div>
      </AppModal.Section>
    </AppModal>
  );
};

export default CreateHoliday;
