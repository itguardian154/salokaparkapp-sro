import DetailSection from "@/components/detail-page/detail-section";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaGift } from "react-icons/fa6";
import { FaSave, FaUserEdit } from "react-icons/fa";
import { useState } from "react";

export default function BonusCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [bonusTicketInterval, setBonusTicketInterval] = useState("1000");

  return (
    <DetailSection
      icon={FaGift}
      title="Bonus"
      variant="green"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
    >
      <div className="border-t border-slate-100 px-5 py-5 dark:border-slate-800 md:px-6 md:py-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
          <Field className="min-w-0 gap-2.5">
            <div className="space-y-1">
              <FieldLabel
                htmlFor="bonus-ticket-interval"
                className="text-sm font-semibold text-slate-800 dark:text-slate-100"
              >
                Bonus 1 tiket setiap kelipatan
              </FieldLabel>
              <FieldDescription className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Pelanggan akan mendapatkan bonus 1 tiket disetiap pemesanan
                setiap membeli tiket dengan jumlah yang diatur
              </FieldDescription>
            </div>
            <div className="relative max-w-2xl">
              {isEditing ? (
                <Input
                  id="bonus-ticket-interval"
                  type="number"
                  min={1}
                  value={bonusTicketInterval}
                  onChange={(event) => setBonusTicketInterval(event.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-white pr-16 text-sm tabular-nums shadow-none transition-colors focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-950"
                />
              ) : (
                <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 pr-16 text-sm tabular-nums text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                  {bonusTicketInterval}
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
