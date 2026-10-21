import type { dataTableFeatures } from "@/components/data-table/table-features";
import type { ColumnDef } from "@tanstack/react-table";
import type { CustomerRecord } from "./types/customer";
import { Badge } from "@/components/ui/badge";
import DropdownActions from "@/components/dropdown-action";



export function getCustomerColumns(
    onDetail: (record: CustomerRecord) => void,
    onEdit: (record: CustomerRecord) => void,
    canEdit: boolean,

): ColumnDef<typeof dataTableFeatures, CustomerRecord, unknown>[] {
    return [
        {
            id: "number",
            header: "#",
            cell: ({ row }) => row.index + 1,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: "Nama Customer",
        },
        {
            accessorKey: "contact_person",
            header: "Nama PIC",
        },
        {
            accessorKey: "phone",
            header: "WhatsApp",
        },
        {
            accessorKey: "address",
            header: "Alamat",
        },
        {
            accessorKey: "is_active",
            header: "Status Customer",
            cell: ({ getValue }) => {
                const status = getValue<CustomerRecord["is_active"]>();

                const variant = status ? "success" : "warning";

                return (
                    <div className="flex justify-center">
                        {" "}
                        <Badge variant={variant}>
                            {status ? "Aktif" : "Nonaktif"}
                        </Badge>{" "}
                    </div>
                );
            },
        },
        {
            id: "aksi",
            header: "Aksi",
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <DropdownActions
                        onDetail={() => onDetail(row.original)}
                        onEdit={canEdit ? () => onEdit(row.original) : undefined}
                    />
                </div>
            ),
        },
    ]
}