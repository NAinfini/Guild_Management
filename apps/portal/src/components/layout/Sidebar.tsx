"use client";
import { cn } from "@/lib/utils";

import * as React from "react";
import { 
  Box, 
  IconButton, 
  Typography, 
  Drawer as MuiDrawer, 
  Fade,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider
} from "@mui/material";
import { MenuOpen, KeyboardArrowDown } from "@mui/icons-material";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../feedback/Tooltip";

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: any) {
  const [open, _setOpen] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);
  
  // Real check for mobile would go here, simplified for now
  const isMobile = false; 

  const setOpen = React.useCallback((value: boolean) => {
    _setOpen(value);
    setOpenProp?.(value);
  }, [setOpenProp]);

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((prev) => !prev) : setOpen(!open);
  }, [isMobile, open, setOpen]);

  const state = open ? "expanded" : "collapsed";

  return (
    <SidebarContext.Provider value={{ state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar }}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={{ "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-width-icon": SIDEBAR_WIDTH_ICON, ...style } as any}
          className={cn("group/sidebar-wrapper flex min-h-svh w-full", className)}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: any) {
  const { isMobile, state, openMobile, setOpenMobile, open } = useSidebar();

  if (isMobile) {
    return (
      <MuiDrawer
        open={openMobile}
        onClose={() => setOpenMobile(false)}
        anchor={side}
        PaperProps={{
          className: "bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0",
          sx: { backgroundImage: 'none', backgroundColor: 'var(--sidebar)' }
        }}
      >
        <div className="flex h-full w-full flex-col">{children}</div>
      </MuiDrawer>
    );
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      <div
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          !open && collapsible === "offcanvas" && "w-0",
          !open && collapsible === "icon" && "w-(--sidebar-width-icon)",
        )}
      />
      <div
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left" && !open && collapsible === "offcanvas" && "left-[calc(var(--sidebar-width)*-1)]",
          side === "left" && open && "left-0",
          side === "left" && !open && collapsible === "icon" && "left-0 w-(--sidebar-width-icon) border-r",
          className
        )}
        {...props}
      >
        <div className="bg-sidebar flex h-full w-full flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({ className, ...props }: any) {
  const { toggleSidebar } = useSidebar();
  return (
    <IconButton
      onClick={toggleSidebar}
      className={cn("size-7", className)}
      sx={{ color: 'inherit' }}
      {...props}
    >
      <MenuOpen className="size-4" />
    </IconButton>
  );
}

function SidebarContent({ className, ...props }: any) {
  return (
    <div
      className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto", className)}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: any) {
  return (
    <div className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props} />
  );
}

function SidebarGroupLabel({ className, ...props }: any) {
  return (
    <div
      className={cn(
        "text-sidebar-foreground/70 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium transition-opacity duration-200",
        className
      )}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: any) {
  return (
    <ul className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />
  );
}

function SidebarMenuItem({ className, ...props }: any) {
  return <li className={cn("group/menu-item relative", className)} {...props} />;
}

function SidebarMenuButton({
  isActive = false,
  className,
  children,
  ...props
}: any) {
  const { open } = useSidebar();
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
        !open && "justify-center p-2!",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function SidebarInset({ className, ...props }: any) {
  return (
    <main
      className={cn("bg-background relative flex w-full flex-1 flex-col", className)}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: any) {
  return (
    <div className={cn("flex flex-col gap-2 p-2", className)} {...props} />
  );
}

function SidebarFooter({ className, ...props }: any) {
  return (
    <div className={cn("flex flex-col gap-2 p-2", className)} {...props} />
  );
}

const SidebarSeparator = ({ className, ...props }: any) => (
  <Divider className={cn("mx-2", className)} sx={{ borderColor: 'var(--sidebar-border)' }} {...props} />
);

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
