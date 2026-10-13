import { useState } from "react";
import { Badge, badgeVariants } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ProdukDepartmentOwner } from "../types/master-produk";

type DepartmentOwnerListProps = {
  owners: ProdukDepartmentOwner[];
  fallback?: string | null;
};

const DepartmentOwnerList = ({ owners, fallback }: DepartmentOwnerListProps) => {
  const [open, setOpen] = useState(false);

  if (owners.length === 0) return fallback || "-";

  const visibleOwners = owners.slice(0, 3);
  const hiddenOwners = owners.slice(3);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visibleOwners.map((owner) => (
        <Badge key={owner.id} variant="blueCircle">
          {owner.department_name}
        </Badge>
      ))}
      {hiddenOwners.length > 0 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            type="button"
            aria-label={`Lihat ${hiddenOwners.length} departemen lainnya`}
            className={`${badgeVariants({ variant: "blueCircle" })} cursor-pointer hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-blue-900`}
          >
            +{hiddenOwners.length}
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto min-w-48 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Departemen lainnya
            </p>
            <div className="flex flex-wrap gap-1.5">
              {hiddenOwners.map((owner) => (
                <Badge key={owner.id} variant="blueCircle">
                  {owner.department_name}
                </Badge>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default DepartmentOwnerList;
