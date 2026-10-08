import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface TablePaginationProps {
  leftSlot?: React.ReactNode;
  itemPerPage: number;
  setItemPerPage: (value: number) => void;
  currentPage: number;
  lastPage: number;
  fromPage: number;
  toPage: number;
  totalData: number;
  onPrev: () => void;
  onNext: () => void;
}


const TablePagination = ({
  leftSlot,
  itemPerPage,
  setItemPerPage,
  currentPage,
  lastPage,
  fromPage,
  toPage,
  totalData,
  onPrev,
  onNext,
}: TablePaginationProps) => {
  const handleItemPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setItemPerPage(Number(event.target.value));
  };

  return (
    <div className="w-full flex items-center justify-between lg:flex-row lg:items-center lg:justify-between">
      {/* LEFT (PAGE INFO) */}
      <div className="flex items-center gap-3">
        {/* DESKTOP ONLY */}
        <div className="hidden lg:flex items-center gap-2">
          {leftSlot}

          <span className="text-xs whitespace-nowrap">
            Rows per page
          </span>

          <select
            value={itemPerPage}
            onChange={handleItemPerPageChange}
            className="
              text-xs cursor-pointer
              dark:bg-slate-800 bg-white
              rounded-lg p-2
              dark:text-white
              border-none outline-none
              focus:ring-0
            "
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={75}>75</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* MOBILE & DESKTOP */}
        <span className="text-xs font-semibold whitespace-nowrap">
          Page {currentPage} of {lastPage}
        </span>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        <span className="text-xs whitespace-nowrap text-slate-600 dark:text-slate-300">
          {fromPage || 0} - {toPage || 0} of {totalData}
        </span>

        <div className="flex items-center gap-1">
          {/* PREVIOUS */}
          <button
            type="button"
            onClick={onPrev}
            disabled={currentPage <= 1}
            className="
              p-1.5 rounded-md
              bg-green-100 hover:bg-green-200
              dark:bg-slate-100 dark:hover:bg-green-200
              transition-colors
              disabled:opacity-40
              disabled:cursor-not-allowed
            "
          >
            <FaChevronLeft className="w-3 h-3 text-slate-700 dark:text-slate-600" />
          </button>

          {/* NEXT */}
          <button
            type="button"
            onClick={onNext}
            disabled={currentPage >= lastPage}
            className="
              p-1.5 rounded-md
              bg-green-100 hover:bg-green-200
              dark:bg-slate-100 dark:hover:bg-green-200
              transition-colors
              disabled:opacity-40
              disabled:cursor-not-allowed
            "
          >
            <FaChevronRight className="w-3 h-3 text-slate-700 dark:text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
