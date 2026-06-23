"use client"

import * as React from "react"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,

} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  GalleryVerticalEndIcon,
  LayoutDashboardIcon,
  Package,
  ChevronRight,
} from "lucide-react"

export function AppSidebar({ user, handleLogout, onNavigate, activePage }) {
  const data = {
    user: {
      name: user?.name,
      email: user?.email,
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      { name: "DevOps HQ", logo: <GalleryVerticalEndIcon />, plan: "Enterprise" },
    ],
    navMain: [
      {
        title: "Metrics",
        url: "#",
        icon: <LayoutDashboardIcon />,
        isActive: activePage === 'metrics',
        onClick: () => onNavigate('metrics'),
        // items: [],
      },
      {
        title: "Inventario",
        url: "#",
        icon: <Package />,
        isActive: ['products','categories','suppliers','movements'].includes(activePage),
        items: [
          { title: "Productos",    url: "#", handleClick: () => onNavigate('products') },
          { title: "Categorías",   url: "#", handleClick: () => onNavigate('categories') },
          { title: "Proveedores",  url: "#", handleClick: () => onNavigate('suppliers') },
          { title: "Movimientos",  url: "#", handleClick: () => onNavigate('movements') },
        ],
      },
    ],
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {data?.navMain?.map((el, index) => {

            const noChildren = () => (
              <SidebarGroup key={index}>
                <SidebarMenuButton onClick={() => onNavigate('metrics')} asChild>
                  <a href="#">
                    {el?.icon}
                    <span>{ el?.title }</span>
                  </a>
                </SidebarMenuButton>
              </SidebarGroup>
            )

            const hasChildren = () => (
              <Collapsible key={index} asChild defaultOpen className="group/collapsible">
                <SidebarGroup>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={el.title}>
                        {el?.icon}
                        <span>{el.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {el.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton onClick={() => subItem?.handleClick()} asChild>
                              <a href={subItem.url}>
                                {/* ICON HERE */}
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            )

            return Object.hasOwn(el, 'items') ? hasChildren() : noChildren()
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} logOut={handleLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}