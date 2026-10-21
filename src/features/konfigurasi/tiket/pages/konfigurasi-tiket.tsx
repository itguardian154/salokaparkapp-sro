import { FaTicket } from "react-icons/fa6";
import BonusCard from "../components/bonus";
import TagihanCard from "../components/tagihan";

export default function KonfigurasiTiketPage() {
  return (
    <div className="-mx-4 -mt-4 flex min-h-full flex-1 flex-col bg-slate-50/70 dark:bg-slate-950">
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

      <main className="w-full flex-1 space-y-5 p-4">
        <TagihanCard />
        <BonusCard />
      </main>
    </div>
  );
}
