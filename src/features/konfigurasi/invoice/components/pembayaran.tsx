import { useState } from "react";
import DetailSection from "@/components/detail-page/detail-section";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FaFileInvoice } from "react-icons/fa6";
import { FaSave, FaUserEdit } from "react-icons/fa";

import useInvoiceConfigurations from "../hooks/use-invoice-configurations";
import { INVOICE_CONFIGURATION_KEYS } from "../types/configuration";

const PAYMENT_TERMS_CONFIGURATION_KEYS = [
  INVOICE_CONFIGURATION_KEYS.paymentTerms,
];

export default function PaymentTermsCard() {
  const [isEditing, setIsEditing] = useState(false);

  const {
    values,
    update,
    saving,
    fieldErrors,
    save,
    cancel,
  } = useInvoiceConfigurations(PAYMENT_TERMS_CONFIGURATION_KEYS);

  const paymentTerms =
    values[INVOICE_CONFIGURATION_KEYS.paymentTerms] ?? "";

  return (
    <DetailSection
      icon={FaFileInvoice}
      title="Ketentuan Pembayaran"
      variant="green"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
    >
      <div className="border-t border-slate-100 px-5 py-5 dark:border-slate-800 md:px-6 md:py-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
          <Field className="min-w-0 gap-2.5">
            <div className="space-y-1">
              <FieldLabel
                htmlFor="payment-terms"
                className="text-sm font-semibold text-slate-800 dark:text-slate-100"
              >
                Informasi Ketentuan Pembayaran
              </FieldLabel>

              <FieldDescription className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Masukkan ketentuan pembayaran yang akan ditampilkan pada invoice.
              </FieldDescription>
            </div>

            {isEditing ? (
              <Textarea
                id="payment-terms"
                value={paymentTerms}
                onChange={(event) =>
                  update(
                    INVOICE_CONFIGURATION_KEYS.paymentTerms,
                    event.target.value
                  )
                }
                rows={3}
                placeholder="Masukkan ketentuan pembayaran..."
                className="min-h-28 resize-y rounded-xl border-slate-200 bg-white text-sm leading-relaxed shadow-none transition-colors focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-950"
              />
            ) : (
              <div className="min-h-28 whitespace-pre-line rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                {paymentTerms || "-"}
              </div>
            )}

            {fieldErrors[INVOICE_CONFIGURATION_KEYS.paymentTerms] && (
              <p role="alert" className="text-sm text-red-500">
                {fieldErrors[INVOICE_CONFIGURATION_KEYS.paymentTerms]}
              </p>
            )}
          </Field>
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="flex gap-2">
            {isEditing && (
              <Button
                variant="destructive"
                disabled={saving}
                onClick={() => {
                  cancel();
                  setIsEditing(false);
                }}
              >
                Batal
              </Button>
            )}

            <Button
              variant={isEditing ? "primer" : "sekunder"}
              disabled={saving}
              onClick={() => {
                if (!isEditing) {
                  setIsEditing(true);
                } else {
                  void save().then((saved) => {
                    if (saved) setIsEditing(false);
                  });
                }
              }}
            >
              {isEditing ? <FaSave size={14} /> : <FaUserEdit size={14} />}
              {saving ? "Menyimpan..." : isEditing ? "Simpan" : "Update"}
            </Button>
          </div>
        </div>
      </div>
    </DetailSection>
  );
}
