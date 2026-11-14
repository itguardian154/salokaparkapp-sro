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

import KonfigurasiInvoicePage from "./features/konfigurasi/invoice/pages/konfigurasi-invoice";
import HolidayPage from "./features/konfigurasi/hari-libur/pages/holiday";
import PaymentMetodePage from "./features/konfigurasi/metode/pages/holiday";
import RoleAksesPage from "./features/role-akses/pages/role-akses";
import DetailInvoice from "./features/invoice/components/detail-invoice";
import CreateReservasi from "./features/reservasi/components/create-reservasi";
import DetailReservasi from "@/features/reservasi/components/detail-reservasi";
import MasterSegmentPage from "./features/master/master-segment/pages/master-segment";
import MasterLokasiPenyajianPage from "./features/master/lokasi-penyajian/pages/lokasi-penyajian"
import ReservasiPage from "./features/reservasi/pages/reservasi";
import DetailSection from "./components/detail-page/detail-section";

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

                {/* Master */}
                <Route path="/master/produk" element={<MasterProdukPage />} />

                <Route path="/master/agen" element={<MasterAgentPage />} />

                <Route
                  path="/master/kategori-produk"
                  element={<MasterKategoriProdukPage />}
                />
                <Route
                  path="/master/segmen"
                  element={<MasterSegmentPage />}
                />
                <Route
                  path="/master/lokasi-penyajian"
                  element={<MasterLokasiPenyajianPage />}
                />
                {/* customer */}

                <Route path="/customers" element={<CustomerPage />} />

                {/* Konfigurasi */}
                <Route
                  path="/konfigurasi-invoice"
                  element={<KonfigurasiInvoicePage />}
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
                <Route path="/invoice" element={<InvoicePage />} />
                <Route path="/invoice/create" element={<DetailInvoice mode="create" />} />
                <Route path="/invoice/detail/:id" element={<DetailInvoice mode="detail" />} />
                {/* Role Akses */}
                <Route
                  path="/role-akses"
                  element={<RoleAksesPage />}
                />
                {/* Reservasi */}
                <Route path="/reservation" element={<ReservasiPage />} />
                <Route
                  path="/reservation/create"
                  element={<CreateReservasi />}
                />
                <Route
                  path="/reservation/detail/:id"
                  element={<DetailReservasi />}
                />

              </Route>
            </Routes>
          </AuthBootstrap>
        </BrowserRouter>
      </Toaster>
    </ThemeProvider>
  </StrictMode>,
);
