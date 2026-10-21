import DetailSection from "@/components/detail-page/detail-section";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FaFileInvoice } from "react-icons/fa6";
import { FaSave, FaUserEdit } from "react-icons/fa";
import { useState } from "react";

export default function TagihanCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [billingInformation, setBillingInformation] = useState(
    "No Rekening 0131-2222-88\na/n. PT. Panorama Indah Permai",
  );
  const [minimumAddendumQty, setMinimumAddendumQty] = useState("5");

  return (
    <DetailSection
      icon={FaFileInvoice}
      title="Tagihan"
      variant="blue"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
    >
      <div className="border-t border-slate-100 px-5 py-5 dark:border-slate-800 md:px-6 md:py-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
          <Field className="min-w-0 gap-2.5">
            <div className="space-y-1">
              <FieldLabel
                htmlFor="billing-information"
                className="text-sm font-semibold text-slate-800 dark:text-slate-100"
              >
                Informasi pembayaran tagihan
              </FieldLabel>
              <FieldDescription className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Informasi pembayaran pada hasil cetak tagihan
              </FieldDescription>
            </div>
            {isEditing ? (
              <Textarea
                id="billing-information"
                value={billingInformation}
                onChange={(event) => setBillingInformation(event.target.value)}
                rows={3}
                className="min-h-28 resize-y rounded-xl border-slate-200 bg-white text-sm leading-relaxed shadow-none transition-colors focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-950"
              />
            ) : (
              <div className="min-h-28 whitespace-pre-line rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                {billingInformation}
              </div>
            )}
          </Field>

          <Field className="min-w-0 gap-2.5">
            <div className="space-y-1">
              <FieldLabel
                htmlFor="minimum-addendum-qty"
                className="text-sm font-semibold text-slate-800 dark:text-slate-100"
              >
                Penambahan qty minimum adendum
              </FieldLabel>
              <FieldDescription className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Pada adendum Sale Order, apabila terjadi penambahan qty tiket,
                maka qty minimal tiket yang dapat dipesan dapat ditentukan
              </FieldDescription>
            </div>
            <div className="relative max-w-2xl">
              {isEditing ? (
                <Input
                  id="minimum-addendum-qty"
                  type="number"
                  min={1}
                  value={minimumAddendumQty}
                  onChange={(event) => setMinimumAddendumQty(event.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-white pr-16 text-sm tabular-nums shadow-none transition-colors focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-950"
                />
              ) : (
                <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 pr-16 text-sm tabular-nums text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                  {minimumAddendumQty}
                </div>
              )}
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400">
                tiket
              </span>
            </div>
          </Field>
        </div>
        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
          <Button
            variant={isEditing ? "primer" : "sekunder"}
            onClick={() => setIsEditing((current) => !current)}
          >
            {isEditing ? <FaSave size={14} /> : <FaUserEdit size={14} />}
            {isEditing ? "Simpan" : "Update"}
          </Button>
        </div>
      </div>
    </DetailSection>
  );
}
