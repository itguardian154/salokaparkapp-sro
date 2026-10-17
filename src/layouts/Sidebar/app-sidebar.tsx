"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
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

// This is sample data.
export const navMainItems: {
  title: string;
  url: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  items?: { title: string; url: string }[];
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
          title: "Master Produk",
          url: "/master/produk",
        },
        {
          title: "Master Agen",
          url: "/master/agen",
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
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props}>
      <SidebarHeader>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="w-full relative flex items-center justify-center mb-3 mt-4">
                {/* LOGO */}
                <div className="w-28 h-auto flex items-center justify-center">
                  <NavLink to={"/salokaparkapp"}>
                    <img
                      src="/img/logo-saloka.png"
                      alt="Logo Saloka"
                      className="w-full h-full object-cover object-center"
                    />
                  </NavLink>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
