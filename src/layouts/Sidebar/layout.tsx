import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { AppSidebar } from "./app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Outlet, useLocation } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";

export default function Layout() {
  const { pathname } = useLocation();
  const isInvoiceListPage = pathname.replace(/\/$/, "") === "/invoice";

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset
        className={
          isInvoiceListPage ? "h-svh min-h-0 min-w-0 overflow-hidden" : undefined
        }
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <SidebarTrigger />

            <Separator orientation="vertical" className="h-8" />
            <ModeToggle />
          </div>

          <strong className="text-xl uppercase tracking-wider">
            SRO
          </strong>
        </header>

        <main
          className={`flex flex-1 flex-col gap-4 p-4 ${
            isInvoiceListPage ? "min-h-0 min-w-0 overflow-hidden" : ""
          }`}
        >
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
