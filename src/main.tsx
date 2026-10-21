import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import "./index.css";

import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/toast";

import Layout from "./layouts/Sidebar/layout";
import AuthBootstrap from "./features/auth/components/auth";

import DashboardPage from "./features/dashboard/pages/dashboard";
import MasterProdukPage from "./features/master/master-produk/pages/master-produk";
import MasterAgentPage from "./features/master/master-agen/pages/master-agen";
import MasterKategoriProdukPage from "./features/master/kategori-produk/pages/kategori-produk";
import CustomerPage from "./features/customers/pages/customers";

import InvoicePage from "./features/invoice/pages/invoice";

import KonfigurasiTiketPage from "./features/konfigurasi/tiket/pages/konfigurasi-tiket";
import HolidayPage from "./features/konfigurasi/hari-libur/pages/holiday";
import PaymentMetodePage from "./features/konfigurasi/metode/pages/holiday";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="theme">
      <Toaster>
        <BrowserRouter>
          <AuthBootstrap>
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
              />

              <Route element={<Layout />}>
                <Route
                  path="/dashboard"
                  element={<DashboardPage />}
                />

                {/* Master */}
                <Route
                  path="/master/produk"
                  element={<MasterProdukPage />}
                />

                <Route
                  path="/master/agen"
                  element={<MasterAgentPage />}
                />

                <Route
                  path="/master/kategori-produk"
                  element={<MasterKategoriProdukPage />}
                />
                {/* customer */}

                <Route
                  path="/customers"
                  element={<CustomerPage />}
                />

                {/* Konfigurasi */}
                <Route
                  path="/konfigurasi-tiket"
                  element={<KonfigurasiTiketPage />}
                />

                <Route
                  path="/konfigurasi-hari-libur"
                  element={<HolidayPage />}
                />

                <Route
                  path="/konfigurasi-metode-pembayaran"
                  element={<PaymentMetodePage />}
                />

                {/* Invoice */}
                <Route
                  path="/invoice"
                  element={<InvoicePage />}
                />
              </Route>
            </Routes>
          </AuthBootstrap>
        </BrowserRouter>
      </Toaster>
    </ThemeProvider>
  </StrictMode>,
);