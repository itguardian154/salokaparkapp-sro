import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import "./index.css";

import { ThemeProvider } from "./components/theme-provider";
import Layout from "./layouts/Sidebar/layout";
import DashboardPage from "./features/dashboard/pages/dashboard";
import MasterProdukPage from "./features/master/master-produk/pages/master-produk";
import MasterAgentPage from "./features/master/master-agen/pages/master-agen";
import AuthBootstrap from "./features/auth/components/auth";
import { Toaster } from "./components/ui/toast";

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
                  path="/master/agen"
                  element={<MasterAgentPage />}
                />
              </Route>
            </Routes>
          </AuthBootstrap>
        </BrowserRouter>
      </Toaster>
    </ThemeProvider>
  </StrictMode>,
);
