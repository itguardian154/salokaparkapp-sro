import AppModal from "@/components/base-modal";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FaSave } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CreateMethodProps = {
  open: boolean;
  onClose: () => void;
};

const CreateMethod = ({ open, onClose }: CreateMethodProps) => {

  const handleClose = () => {
    //clearForm();
    onClose();
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="TambahTambah Metode Pembayaran"
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
      <AppModal.Section title="Tambah Metode Pembayaran" showHeader={false}>
        <div className="space-y-3">
          <Field>
            <FieldLabel>Nama</FieldLabel>

            <Input
              placeholder="Masukkan nama metode pembayaran"
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
            <FieldLabel>Tipe</FieldLabel>
            <Select value={""} onValueChange={(value) => console.log(value)}>
              <SelectTrigger className="w-full">
                <SelectValue>Pilih Tipe</SelectValue>
              </SelectTrigger>
              <SelectContent align="start" alignItemWithTrigger={false}>
                <SelectItem value="debit">Debit</SelectItem>
                <SelectItem value="kredit">Kredit</SelectItem>
                <SelectItem value="fintech">Fintech</SelectItem>
                <SelectItem value="ota">OTA</SelectItem>
                <SelectItem value="other">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </AppModal.Section>
    </AppModal>
  );
};

export default CreateMethod;
