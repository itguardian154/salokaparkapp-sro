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
            className="group flex h-8 items-center gap-1.5 rounded-full bg-sekunder-60 px-3.5 text-xs font-semibold text-white shadow-sm outline-none transition hover:bg-sekunder-40 active:scale-95 focus-visible:ring-2 focus-visible:ring-sekunder-40 dark:bg-sekunder-60 dark:hover:bg-sekunder-40"
          >
            Aksi
            <FaChevronDown
              size={10}
              className="transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
          </button>
        }
      />

      <DropdownMenuContent
        align="end"
        className="z-10000 min-w-35 border border-slate-200 bg-white text-slate-700 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <DropdownMenuItem
          onClick={onDetail}
          className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-blue-50! hover:text-blue-600! focus:bg-blue-50! focus:text-blue-600! data-highlighted:bg-blue-50! data-highlighted:text-blue-600! dark:text-slate-200 dark:hover:bg-blue-500/15! dark:hover:text-blue-400! dark:focus:bg-blue-500/15! dark:focus:text-blue-400! dark:data-highlighted:bg-blue-500/15! dark:data-highlighted:text-blue-400!"
        >
          <FaEye
            className="text-blue-500! dark:text-blue-400!"
            size={13}
          />
          <span className="text-inherit">Detail</span>
        </DropdownMenuItem>

        {onEdit && (
          <DropdownMenuItem
            onClick={onEdit}
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-amber-50! hover:text-amber-600! focus:bg-amber-50! focus:text-amber-600! data-highlighted:bg-amber-50! data-highlighted:text-amber-600! dark:text-slate-200 dark:hover:bg-amber-500/15! dark:hover:text-amber-400! dark:focus:bg-amber-500/15! dark:focus:text-amber-400! dark:data-highlighted:bg-amber-500/15! dark:data-highlighted:text-amber-400!"
          >
            <FaUserEdit
              className="text-amber-500! dark:text-amber-400!"
              size={13}
            />
            <span className="text-inherit">Edit Data</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownActions;
