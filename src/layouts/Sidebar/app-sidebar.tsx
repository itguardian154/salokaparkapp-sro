"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Grid2x2Check } from "lucide-react";
import {
  FaCalendarDays,
  FaChartPie,
  FaChartSimple,
  FaDatabase,
  FaFileInvoice,
  FaMapPin,
  FaTicket,
  FaUserGroup,
} from "react-icons/fa6";
import { NavMain } from "./nav-main";
import { NavLink } from "react-router-dom";
import { MdOutlineSettingsInputComponent } from "react-icons/md";

// This is sample data.
export const navMainItems: {
  title: string;
  url: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  items?: { title: string; url: string; permission?: string }[];
}[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <FaChartSimple />,
  },
  {
    title: "Master Data",
    url: "/master/produk",
    icon: <FaDatabase />,
    isActive: true,
    items: [
      {
        title: "Produk",
        url: "/master/produk",
        permission: "product.view",
      },
      {
        title: "Agen",
        url: "/master/agen",
      },
      {
        title: "Kategori Produk",
        url: "/master/kategori-produk",
      },
    ],
  },

  {
    title: "Konfigurasi",
    url: "/konfigurasi-tiket",
    icon: <MdOutlineSettingsInputComponent />,
    isActive: true,
    items: [
      {
        title: "Tiket",
        url: "/konfigurasi-tiket",
      },
      {
        title: "Hari Libur",
        url: "/konfigurasi-hari-libur",
      },
    ],
  },

  {
    title: "Customers",
    url: "/customers",
    icon: <FaUserGroup />,
  },
  {
    title: "Invoice",
    url: "/invoice",
    icon: <FaFileInvoice />,
  },
  {
    title: "Reservation",
    url: "/reservation",
    icon: <FaCalendarDays />,
  },
  {
    title: "Ticket Adjustment",
    url: "/ticket-adjustment",
    icon: <FaTicket />,
    isActive: true,
    items: [
      {
        title: "Refund",
        url: "/ticket-adjustment/refund",
      },
      {
        title: "Reschedule",
        url: "/ticket-adjustment/reschedule",
      },
      {
        title: "Deposit",
        url: "/ticket-adjustment/deposit",
      },
    ],
  },
  {
    title: "Arrival Control",
    url: "/arrival-control",
    icon: <FaMapPin />,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: <FaChartPie />,
  },

  {
    title: "Datatable",
    url: "/datatable",
    icon: <Grid2x2Check />,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props}>
      <SidebarHeader className="p-1 md:p-2">
        <div className="mb-3 mt-2 flex h-auto w-full items-center justify-center md:mt-4">
          <NavLink
            to="https://salokapark.app/salokaparkapp"
            title="Saloka Park"
            className="group-data-[collapsible=icon]:w-32 block w-28"
          >
            <img
              src="/img/logo-saloka.png"
              alt="Logo Saloka"
              className="block h-auto w-full object-contain object-center"
            />
          </NavLink>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
