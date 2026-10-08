import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";

import { ThemeProvider } from "./components/theme-provider";
import Layout from "./layouts/Sidebar/layout";
import DashboardPage from "./features/dashboard/pages/dashboard";
import DatatablePage from "./features/datatable/pages/data-tablelist";
import MasterProdukPage from "./features/master/master-produk/pages/master-produk";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />

            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

             <Route
              path="/master/produk"
              element={<MasterProdukPage />}
            />
            
           <Route
              path="/datatable"
              element={<DatatablePage />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);