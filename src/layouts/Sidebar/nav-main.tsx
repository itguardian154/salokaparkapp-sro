"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "cn";

import { ChevronRightIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { getAuthSession } from "@/features/auth/utils/auth-storage";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
      permission?: string;
    }[];
  }[];
}) {
  const { pathname } = useLocation();
  const permissions = getAuthSession()?.permissions ?? [];

  return (
    <SidebarGroup>
      <SidebarMenu className="w-full">
        {items.map((item) => {
          const visibleSubItems = item.items?.filter(
            (subItem) =>
              !subItem.permission || permissions.includes(subItem.permission),
          );

          if (item.items && visibleSubItems?.length === 0) {
            return null;
          }

          // MENU TANPA SUBMENU
          if (!visibleSubItems || visibleSubItems.length === 0) {
            return (
              <SidebarMenuItem key={item.title} className="p-0">
                <NavLink
                  to={item.url}
                  className={({ isActive }) =>
                    cn("block w-full", isActive && "menuActive")
                  }
                >
                  {({ isActive }) => (
                    <SidebarMenuButton
                      size="lg"
                      tooltip={item.title}
                      className={cn(
                        "rounded-none bg-transparent hover:bg-transparent px-6",
                        isActive && "item-menuActive",
                      )}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            );
          }

          // MENU DENGAN SUBMENU
          const hasActiveSubItem = visibleSubItems.some(
            (subItem) =>
              pathname === subItem.url ||
              pathname.startsWith(`${subItem.url}/`),
          );

          return (
            <Collapsible
              key={item.title}
              defaultOpen={item.isActive || hasActiveSubItem}
              className="group/collapsible"
              render={<SidebarMenuItem className="p-0" />}
            >
              <CollapsibleTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    tooltip={item.title}
                    className={cn(
                      "rounded-none bg-transparent hover:bg-transparent px-6",
                      hasActiveSubItem && "menuActive item-menuActive",
                    )}
                  />
                }
              >
                {item.icon}

                <span>{item.title}</span>

                <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
              </CollapsibleTrigger>

              <CollapsibleContent>
                <SidebarMenuSub>
                  {visibleSubItems.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <NavLink
                        to={subItem.url}
                        className={({ isActive }) =>
                          isActive ? "item-sub-menuActive" : "item-sub-menuBase"
                        }
                      >
                        {subItem.title}
                      </NavLink>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
