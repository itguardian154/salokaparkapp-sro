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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="theme">
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
            </Route>
          </Routes>
        </AuthBootstrap>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
