"use client";

import React, { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationButton } from "@/components/notification-button";
import { LockScreenButton } from "@/components/lock-screen-button";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  // ✅ Memoize the sidebar so it’s not recreated on every route change
  const memoizedSidebar = useMemo(() => <AppSidebar />, []);

  return (
    <SidebarProvider>
      {memoizedSidebar}
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1 text-lg font-semibold text-foreground">
            CRM Made Simplified
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationButton />
            <LockScreenButton />
          </div>
        </header>

        <main className="flex flex-1 flex-col overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={
                typeof window !== "undefined"
                  ? window.location.pathname
                  : "static"
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
