import AppModal from "@/components/base-modal";
import SearchablePopover from "@/components/searchable-popover";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatRupiah } from "@/lib/utils";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { FaSave } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";

type Departemen = {
  id_dept: string;
  departemen: string;
};

type SelectedDepartemen = {
  id: string;
  name: ReactNode;
};

const dummyDepartemen: Departemen[] = [
  { id_dept: "dept-it", departemen: "IT" },
  { id_dept: "dept-hr", departemen: "Human Resources" },
  { id_dept: "dept-finance", departemen: "Finance" },
  { id_dept: "dept-marketing", departemen: "Marketing" },
];

type CreateMasterProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

const CreateMasterAgen = ({ open, onClose, onSubmit }: CreateMasterProps) => {
  const [price, setPrice] = useState("");
  const [searchDepartemen, setSearchDepartemen] = useState("");
  const [selectedDepartemen, setSelectedDepartemen] = useState<
    SelectedDepartemen[]
  >([]);
  const [openDepartemen, setOpenDepartemen] = useState(false);

  const filteredDepartemen = useMemo(() => {
    const normalizedSearch = searchDepartemen.trim().toLocaleLowerCase();

    return dummyDepartemen.filter((item) =>
      item.departemen.toLocaleLowerCase().includes(normalizedSearch),
    );
  }, [searchDepartemen]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Tambah Master"
      icon={<FaPlus />}
      footer={
        <div className="flex justify-end gap-3">
          {" "}
          <Button variant="destructive" onClick={onClose}>
            Batal{" "}
          </Button>
          <Button variant="primer" onClick={onSubmit}>
            <FaSave size={14} />
            Simpan
          </Button>
        </div>
      }
    >
      <AppModal.Section title="Master Produk" showHeader={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field>
            <FieldLabel>Nama Produk</FieldLabel>

            <Input placeholder="Masukkan nama produk" />
          </Field>

          <Field>
            <FieldLabel>Harga</FieldLabel>

            <Input
              placeholder="Masukkan harga"
              value={price ? formatRupiah(price) : ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setPrice(value);
              }}
            />
          </Field>

          <Field>
            <FieldLabel>Departemen Terkait</FieldLabel>
            <SearchablePopover<Departemen>
              multi
              open={openDepartemen}
              onOpenChange={setOpenDepartemen}
              search={searchDepartemen}
              onSearchChange={setSearchDepartemen}
              placeholder="Pilih departemen"
              items={filteredDepartemen}
              selected={selectedDepartemen}
              onMultiSelect={setSelectedDepartemen}
              renderItem={(item) => item.departemen}
              getKey={(item) => item.id_dept}
            />
          </Field>

          <Field>
            <FieldLabel>Deskripsi</FieldLabel>

            <Textarea placeholder="Masukkan deskripsi" />
          </Field>
        </div>
      </AppModal.Section>
    </AppModal>
  );
};

export default CreateMasterAgen;
