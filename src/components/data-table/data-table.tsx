import {
  type RowData,
  type ReactTable,
} from "@tanstack/react-table";
import { dataTableFeatures } from "./table-features";

interface DataTableProps<TData extends RowData> {
  table: ReactTable<typeof dataTableFeatures, TData>;
  loading?: boolean;
  header?: React.ReactNode;
  cellClassName?: string;
}

const DataTable = <TData extends RowData,>({
  table,
  loading = false,
  header,
  cellClassName = "",
}: DataTableProps<TData>) => {
  const rows = table.getRowModel().rows;
  const columnCount = table.getVisibleLeafColumns().length;

  return (
    <div className="w-full bg-white dark:bg-slate-800 overflow-x-auto">
      <table className="w-full border-collapse border-gray-300 dark:border-gray-600">
        {header ? (
          header
        ) : (
          <thead className="bg-gray-100 dark:bg-gray-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="
                      p-3 text-xs font-semibold text-center
                      border-x border-gray-200 dark:border-gray-600
                      first:border-l-0 last:border-r-0
                      whitespace-pre-line leading-tight
                    "
                  >
                    {header.isPlaceholder
                      ? null
                      : <table.FlexRender header={header} />}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
        )}

        <tbody>
          {loading && (
            <tr>
              <td
                colSpan={columnCount}
                className="p-4 text-center"
              >
                Sedang memuat data...
              </td>
            </tr>
          )}

          {!loading && rows.length === 0 && (
            <tr>
              <td
                colSpan={columnCount}
                className="p-4 text-center"
              >
                Saat ini data kosong
              </td>
            </tr>
          )}

          {!loading &&
            rows.map((row, index) => (
              <tr key={`${row.id}-${index}`}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`
                      text-sm border border-gray-300 dark:border-gray-600
                      first:border-l-0 last:border-r-0
                      ${cellClassName}
                    `}
                  >
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
