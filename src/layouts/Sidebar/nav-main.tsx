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
import { useSidebar } from "@/components/ui/sidebar";
import { useState } from "react";

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
  const { state, isMobile } = useSidebar();
  const [collapsedOpen, setCollapsedOpen] = useState<string | null>(null);
  const [pinnedOpen, setPinnedOpen] = useState<string | null>(null);
  const [popupTop, setPopupTop] = useState(0);
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

          if (!isMobile && state === "collapsed") {
            const hasChildren = Boolean(visibleSubItems?.length);
            const isCurrent = item.url === pathname || pathname.startsWith(`${item.url}/`) || visibleSubItems?.some((subItem) => pathname === subItem.url || pathname.startsWith(`${subItem.url}/`));
            return (
              <SidebarMenuItem
                key={item.title}
                className={cn("w-full p-0", isCurrent && "menuActive")}
                style={{ width: "var(--sidebar-width-icon)" }}
              >
                {hasChildren ? (
                  <button
                    type="button"
                    aria-label={item.title}
                    aria-expanded={collapsedOpen === item.title}
                    onMouseEnter={(event) => {
                      setPopupTop(event.currentTarget.getBoundingClientRect().top);
                      setCollapsedOpen(item.title);
                    }}
                    onFocus={(event) => {
                      setPopupTop(event.currentTarget.getBoundingClientRect().top);
                      setCollapsedOpen(item.title);
                    }}
                    onClick={(event) => {
                      setPopupTop(event.currentTarget.getBoundingClientRect().top);
                      setPinnedOpen((open) => {
                        const next = open === item.title ? null : item.title;
                        setCollapsedOpen(next);
                        return next;
                      });
                    }}
                    className={cn("flex h-12 w-full! min-w-full! items-center justify-center border-0 bg-transparent p-0 text-slate-900 transition-colors hover:bg-sekunder-20 hover:text-sekunder-60 [&_svg]:size-5 dark:text-white dark:hover:bg-sekunder-100/30", isCurrent && "item-menuActive")}
                  >{item.icon}</button>
                ) : (
                  <NavLink
                    to={item.url}
                    aria-label={item.title}
                    title={item.title}
                    onClick={() => { setCollapsedOpen(null); setPinnedOpen(null); }}
                    onMouseEnter={(event) => {
                      setPopupTop(event.currentTarget.getBoundingClientRect().top);
                      setCollapsedOpen(item.title);
                    }}
                    onFocus={(event) => {
                      setPopupTop(event.currentTarget.getBoundingClientRect().top);
                      setCollapsedOpen(item.title);
                    }}
                    className={cn("flex h-12 w-full! min-w-full! items-center justify-center text-slate-900 transition-colors hover:bg-sekunder-20 hover:text-sekunder-60 [&_svg]:size-5 dark:text-white dark:hover:bg-sekunder-100/30", isCurrent && "item-menuActive")}
                  >{item.icon}</NavLink>
                )}
                {collapsedOpen === item.title && (
                  <div
                    onMouseEnter={() => setCollapsedOpen(item.title)}
                    className="fixed z-50 w-44 rounded-r-lg border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                    style={{ left: "var(--sidebar-width-icon)", top: popupTop }}
                  >
                    {hasChildren ? (
                      <p className="mb-2 text-xs font-bold uppercase text-slate-900 dark:text-white">{item.title}</p>
                    ) : (
                      <NavLink to={item.url} onClick={() => { setCollapsedOpen(null); setPinnedOpen(null); }} className="block rounded px-2 py-1 text-sm font-bold uppercase text-slate-900 dark:text-white dark:hover:bg-slate-800">
                        {item.title}
                      </NavLink>
                    )}
                    {hasChildren && <div className="flex flex-col gap-1">
                      {visibleSubItems?.map((subItem) => (
                        <NavLink key={subItem.title} to={subItem.url} onClick={() => { setCollapsedOpen(null); setPinnedOpen(null); }} className={({ isActive }) => cn("rounded px-2 py-1.5 text-sm text-slate-500 hover:text-sekunder-60 dark:text-slate-300 dark:hover:bg-sekunder-100/30", isActive && "font-semibold text-sekunder-60 dark:text-sekunder-60")}>
                          {subItem.title}
                        </NavLink>
                      ))}
                    </div>}
                  </div>
                )}
              </SidebarMenuItem>
            );
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
