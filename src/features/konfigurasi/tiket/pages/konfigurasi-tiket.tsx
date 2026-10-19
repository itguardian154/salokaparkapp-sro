import DetailSection from "@/components/detail-page/detail-section";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FaFileInvoice, FaGift, FaTicket } from "react-icons/fa6";

const configurationGroups = [
  {
    title: "Tagihan",
    icon: FaFileInvoice,
    variant: "blue" as const,
    fields: [
      {
        id: "billing-information",
        title: "Informasi pembayaran tagihan",
        description: "Informasi pembayaran pada hasil cetak tagihan",
        kind: "textarea" as const,
        defaultValue:
          "No Rekening 0131-2222-88\na/n. PT. Panorama Indah Permai",
        rows: 3,
        className: "min-h-28 resize-y",
      },
      {
        id: "minimum-addendum-qty",
        title: "Penambahan qty minimum adendum",
        description:
          "Pada adendum Sale Order, apabila terjadi penambahan qty tiket, maka qty minimal tiket yang dapat dipesan dapat ditentukan",
        kind: "number" as const,
        defaultValue: "5",
        min: 1,
        suffix: "tiket",
      },
    ],
  },
  {
    title: "Bonus",
    icon: FaGift,
    variant: "green" as const,
    fields: [
      {
        id: "bonus-ticket-interval",
        title: "Bonus 1 tiket setiap kelipatan",
        description:
          "Pelanggan akan mendapatkan bonus 1 tiket disetiap pemesanan setiap membeli tiket dengan jumlah yang diatur",
        kind: "number" as const,
        defaultValue: "1000",
        min: 1,
        suffix: "tiket",
      },
    ],
  },
];

export default function KonfigurasiTiketPage() {
  return (
    <div className="-mx-4 -mt-4 flex min-h-full flex-1 flex-col bg-slate-50/70 dark:bg-slate-950">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <FaTicket size={17} aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-slate-800 dark:text-white">
              Konfigurasi Tiket
            </h1>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              Pengaturan informasi tagihan dan bonus tiket
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="w-full flex-1 space-y-5 p-4">
        {configurationGroups.map((group) => (
          <DetailSection
            key={group.title}
            icon={group.icon}
            title={group.title}
            variant={group.variant}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
          >
            <div className="border-t border-slate-100 px-5 py-5 dark:border-slate-800 md:px-6 md:py-6">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
                {group.fields.map((field) => (
                  <Field key={field.id} className="min-w-0 gap-2.5">
                    <div className="space-y-1">
                      <FieldLabel
                        htmlFor={field.id}
                        className="text-sm font-semibold text-slate-800 dark:text-slate-100"
                      >
                        {field.title}
                      </FieldLabel>

                      <FieldDescription className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {field.description}
                      </FieldDescription>
                    </div>

                    {field.kind === "textarea" ? (
                      <Textarea
                        id={field.id}
                        defaultValue={field.defaultValue}
                        rows={field.rows}
                        className={`${field.className} rounded-xl border-slate-200 bg-white text-sm leading-relaxed shadow-none transition-colors focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-950`}
                      />
                    ) : (
                      <div className="relative max-w-2xl">
                        <Input
                          id={field.id}
                          type="number"
                          min={field.min}
                          defaultValue={field.defaultValue}
                          className="h-11 rounded-xl border-slate-200 bg-white pr-16 text-sm tabular-nums shadow-none transition-colors focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-950"
                        />

                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400">
                          {field.suffix}
                        </span>
                      </div>
                    )}
                  </Field>
                ))}
              </div>
            </div>
          </DetailSection>
        ))}
      </main>
    </div>
  );
}
