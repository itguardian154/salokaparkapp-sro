import { formatRupiah } from "@/lib/utils";

type PaymentInformationProps = {
  totalAmount: string | number;
  paidAmount: string | number;
  remainingAmount: string | number;
};

const summaries = [
  {
    key: "totalAmount",
    label: "Total Tagihan",
    valueClass: "text-slate-900 dark:text-white",
  },
  {
    key: "paidAmount",
    label: "Total Pembayaran",
    valueClass: "text-emerald-700 dark:text-emerald-300",
  },
  {
    key: "remainingAmount",
    label: "Kurang Bayar",
    valueClass: "text-amber-700 dark:text-amber-300",
  },
] as const;

export default function PaymentInformation({
  totalAmount,
  paidAmount,
  remainingAmount,
}: PaymentInformationProps) {
  const values = { totalAmount, paidAmount, remainingAmount };

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {summaries.map((summary) => (
        <div
          key={summary.key}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {summary.label}
          </p>
          <p className={`mt-2 text-lg font-semibold ${summary.valueClass}`}>
            {formatRupiah(values[summary.key])}
          </p>
        </div>
      ))}
    </div>
  );
}
