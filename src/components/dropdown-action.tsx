import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaChevronDown, FaUserEdit } from "react-icons/fa";
import { FaEye } from "react-icons/fa6";

type DropdownActionsProps = {
  onDetail: () => void;
  onEdit?: () => void;
};

const DropdownActions = ({
  onDetail,
  onEdit,
}: DropdownActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="group flex h-8 items-center gap-1.5 rounded-full bg-sekunder-60 px-3.5 text-xs font-semibold text-white shadow-sm outline-none transition hover:bg-sekunder-40 active:scale-95"
          />
        }
      >
          Aksi
          <FaChevronDown
            size={10}
            className="transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="z-10000 min-w-140px border border-slate-200 bg-white shadow-xl"
      >
        <DropdownMenuItem
          onClick={onDetail}
          className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-slate-700 transition-colors focus:bg-slate-100 focus:text-blue-600"
        >
          <FaEye className="text-blue-500" size={13} />
          <span>Detail</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onEdit}
          className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-slate-700 transition-colors focus:bg-slate-100 focus:text-amber-600"
        >
          <FaUserEdit className="text-amber-500" size={13} />
          <span>Edit Data</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownActions;
