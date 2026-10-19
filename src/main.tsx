import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import "./index.css";

import { ThemeProvider } from "./components/theme-provider";
import Layout from "./layouts/Sidebar/layout";
import DashboardPage from "./features/dashboard/pages/dashboard";
import DatatablePage from "./features/datatable/pages/data-tablelist";
import MasterProdukPage from "./features/master/master-produk/pages/master-produk";
import MasterAgentPage from "./features/master/master-agen/pages/master-agen";
import AuthBootstrap from "./features/auth/components/auth";
import { Toaster } from "./components/ui/toast";
import MasterKategoriProdukPage from "./features/master/kategori-produk/pages/kategori-produk";
import InvoicePage from "./features/invoice/pages/invoice";
import KonfigurasiTiketPage from "./features/konfigurasi/tiket/pages/konfigurasi-tiket";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="theme">
      <Toaster>
        <BrowserRouter>
          <AuthBootstrap>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />

                <Route path="/master/produk" element={<MasterProdukPage />} />

                <Route
                  path="/master/produk"
                  element={<MasterProdukPage />}
                />

                <Route
                  path="/datatable"
                  element={<DatatablePage />}
                />

                <Route
                  path="/master/agen"
                  element={<MasterAgentPage />}
                />

                <Route
                  path="/master/kategori-produk"
                  element={<MasterKategoriProdukPage />}
                />

                <Route
                  path="/invoice"
                  element={<InvoicePage />}
                />

                <Route
                  path="/konfigurasi-tiket"
                  element={<KonfigurasiTiketPage />}
                />
              </Route>
            </Routes>
          </AuthBootstrap>
        </BrowserRouter>
      </Toaster>
    </ThemeProvider>
  </StrictMode>,
);
