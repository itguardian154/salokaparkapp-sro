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
import { FaPlus } from "react-icons/fa6";

type EditMasterProps = {
  open: boolean;
  onClose: () => void;
};

const EditMasterKategoriProduk = ({ open, onClose }: EditMasterProps) => {
  const handleClose = () => {
    //  clearForm();
    onClose();
  };
  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="Edit Master Kategori Produk"
      icon={<FaPlus />}
      className="max-w-lg max-h-[70vh]"
      footer={
        <div className="flex justify-end gap-3">
          {" "}
          <Button variant="destructive" onClick={handleClose}>
            Batal{" "}
          </Button>
          <Button variant="primer">
            <FaSave size={14} />
            Simpan
            {/* {submitting ? "Menyimpan..." : "Simpan"} */}
          </Button>
        </div>
      }
    >
      <AppModal.Section title="Master Produk" showHeader={false}>
        <div className="space-y-3">
          <Field>
            <FieldLabel>Nama Kategori</FieldLabel>

            <Input
              placeholder="Masukkan nama kategori"
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
            <FieldLabel>Status Produk</FieldLabel>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue>Aktif</SelectValue>
              </SelectTrigger>
              <SelectContent align="start" alignItemWithTrigger={false}>
                <SelectItem value="true">Aktif</SelectItem>
                <SelectItem value="false">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </AppModal.Section>
    </AppModal>
  );
};

export default EditMasterKategoriProduk;
