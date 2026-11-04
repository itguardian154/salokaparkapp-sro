
import { useMemo, useState } from "react";
import { FaSave } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";

import AppModal from "@/components/base-modal";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import usePermission from "../hooks/use-permission";
import type { CreateRoleAksesPayload } from "../types/role-akses";

type CreateRoleAksesProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateRoleAksesPayload) => Promise<void>;
  submitting?: boolean;
  submitError?: string | null;
};

const formatGroupName = (value: string) =>
  value
    .split(/[-_.]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const CreateRoleAkses = ({
  open,
  onClose,
  onSubmit,
  submitting = false,
  submitError,
}: CreateRoleAksesProps) => {
  const [name, setName] = useState("");
  const [selectedPermissions, setSelectedPermissions] =
    useState<number[]>([]);
  const [validationError, setValidationError] = useState("");

  const {
    dataPermission,
    loadingPermission,
    errorPermission,
  } = usePermission();

  const permissions = useMemo(
    () => dataPermission ?? [],
    [dataPermission],
  );

  // Mengelompokkan permission berdasarkan prefix nama.
  // Contoh: customer.view -> Customer.
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, typeof permissions> = {};

    permissions.forEach((permission) => {
      const groupKey = permission.name.includes(".")
        ? permission.name.split(".")[0]
        : "lainnya";

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }

      groups[groupKey].push(permission);
    });

    return Object.entries(groups).sort(([a], [b]) =>
      a.localeCompare(b),
    );
  }, [permissions]);

  const allSelected =
    permissions.length > 0 &&
    permissions.every((permission) =>
      selectedPermissions.includes(permission.id),
    );

  // Pilih atau hapus satu permission.
  const handleTogglePermission = (
    id: number,
    checked: boolean,
  ) => {
    setSelectedPermissions((current) =>
      checked
        ? current.includes(id)
          ? current
          : [...current, id]
        : current.filter((permissionId) => permissionId !== id),
    );

    setValidationError("");
  };

  // Pilih atau hapus seluruh permission dalam grup.
  const handleToggleGroup = (
    permissionIds: number[],
    checked: boolean,
  ) => {
    setSelectedPermissions((current) => {
      if (checked) {
        return Array.from(
          new Set([...current, ...permissionIds]),
        );
      }

      return current.filter((id) => !permissionIds.includes(id));
    });

    setValidationError("");
  };

  // Pilih atau hapus seluruh permission.
  const handleSelectAll = () => {
    setSelectedPermissions(
      allSelected
        ? []
        : permissions.map((permission) => permission.id),
    );

    setValidationError("");
  };

  const clearForm = () => {
    setName("");
    setSelectedPermissions([]);
    setValidationError("");
  };

  const handleClose = () => {
    if (submitting) return;

    clearForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (submitting) return;

    if (!name.trim()) {
      setValidationError("Nama role wajib diisi.");
      return;
    }

    if (selectedPermissions.length === 0) {
      setValidationError("Pilih minimal satu permission.");
      return;
    }

    setValidationError("");

    try {
      await onSubmit({
        name: name.trim(),
        guard_name: "web",
        permissions: selectedPermissions,
      });

      clearForm();
      onClose();
    } catch (error) {
      console.error("Gagal menambahkan role akses:", error);
    }
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="Tambah Role Akses"
      icon={<FaPlus />}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="destructive"
            onClick={handleClose}
            disabled={submitting}
          >
            Batal
          </Button>

          <Button
            type="button"
            variant="primer"
            onClick={() => void handleSubmit()}
            disabled={submitting || loadingPermission}
          >
            <FaSave size={14} />
            {submitting ? "Menyimpan..." : "Simpan Role"}
          </Button>
        </div>
      }
    >
      <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
        {/* Error API */}
        {submitError && (
          <p role="alert" className="text-sm text-red-500">
            {submitError}
          </p>
        )}

        {/* Error Validasi */}
        {validationError && (
          <p role="alert" className="text-sm text-red-500">
            {validationError}
          </p>
        )}

        {/* Informasi Role */}
        <AppModal.Section
          title="Informasi Role"
          showHeader={false}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>Nama Role</FieldLabel>
              <Input
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setValidationError("");
                }}
                placeholder="Contoh: Admin Customer"
                disabled={submitting}
              />
            </Field>

            <Field>
              <FieldLabel>Guard Name</FieldLabel>
              <Input value="web" disabled />
            </Field>
          </div>
        </AppModal.Section>

        {/* Daftar Permission */}
        <AppModal.Section
          title="Permission"
          showHeader={false}
        >
          <div className="space-y-4">
            {/* Header Permission */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                  Daftar Permission
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedPermissions.length} dari{" "}
                  {permissions.length} permission dipilih
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleSelectAll}
                disabled={
                  loadingPermission ||
                  permissions.length === 0 ||
                  submitting
                }
              >
                {allSelected
                  ? "Hapus Semua Pilihan"
                  : "Pilih Semua"}
              </Button>
            </div>

            {/* Loading dan Error */}
            {loadingPermission ? (
              <p className="py-6 text-center text-sm text-slate-500">
                Memuat permission...
              </p>
            ) : errorPermission ? (
              <p
                role="alert"
                className="py-6 text-sm text-red-500"
              >
                {errorPermission}
              </p>
            ) : permissions.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                Belum ada permission tersedia.
              </p>
            ) : (
              <div className="space-y-4">
                {groupedPermissions.map(
                  ([groupKey, groupPermissions]) => {
                    const groupIds = groupPermissions.map(
                      (permission) => permission.id,
                    );

                    const selectedCount =
                      groupPermissions.filter((permission) =>
                        selectedPermissions.includes(permission.id),
                      ).length;

                    const groupAllSelected =
                      groupPermissions.length > 0 &&
                      selectedCount === groupPermissions.length;

                    return (
                      <div
                        key={groupKey}
                        className="overflow-hidden rounded-lg border"
                      >
                        {/* Header Grup */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50 px-4 py-3 dark:bg-slate-800">
                          <div>
                            <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                              {formatGroupName(groupKey)}
                            </h4>

                            <p className="mt-1 text-xs text-slate-500">
                              {selectedCount} dari{" "}
                              {groupPermissions.length} dipilih
                            </p>
                          </div>

                          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Checkbox
                              checked={groupAllSelected}
                              onCheckedChange={(checked) =>
                                handleToggleGroup(
                                  groupIds,
                                  checked === true,
                                )
                              }
                              disabled={submitting}
                            />
                            Pilih semua
                          </label>
                        </div>

                        {/* Permission dalam Grup */}
                        <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-3">
                          {groupPermissions.map((permission) => (
                            <label
                              key={permission.id}
                              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <Checkbox
                                checked={selectedPermissions.includes(
                                  permission.id,
                                )}
                                onCheckedChange={(checked) =>
                                  handleTogglePermission(
                                    permission.id,
                                    checked === true,
                                  )
                                }
                                disabled={submitting}
                              />

                              <span className="min-w-0">
                                <span className="block break-words text-sm font-medium text-slate-800 dark:text-slate-100">
                                  {permission.name}
                                </span>

                                <span className="mt-1 block text-xs text-slate-500">
                                  {permission.guard_name}
                                </span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>
        </AppModal.Section>
      </div>
    </AppModal>
  );
};

export default CreateRoleAkses;
