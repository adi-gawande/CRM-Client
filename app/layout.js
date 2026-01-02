"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { Toaster } from "sonner";
import "./globals.css";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function RootLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Only run client-side
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      // If no user or token and not already on login page → redirect
      if ((!user || !token) && pathname !== "/login") {
        router.replace("/login");
      }
      // If user has both user and token but is on login page → redirect to dashboard
      else if (user && token && pathname === "/login") {
        router.replace("/");
      }

      // Prevent flicker by waiting until check is done
      setIsCheckingAuth(false);
    }
  }, [router, pathname]);

  // ⏳ Optional: show nothing (or a loader) while checking auth
  if (isCheckingAuth) return null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Provider store={store}>
            <>{children}</>
          </Provider>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
