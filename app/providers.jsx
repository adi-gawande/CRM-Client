"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store/store";
import { Toaster } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Providers({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Only run client-side
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      // If no user or token and not already on login page → redirect
      if (!token && pathname !== "/login") {
        router.replace("/login");
      }
      // If user has both user and token but is on login page → redirect to dashboard
      else if (token && pathname === "/login") {
        router.replace("/");
      }

      // // Prevent flicker by waiting until check is done
      // setIsCheckingAuth(false);
    }
  }, [router, pathname]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {children}
        </PersistGate>
      </Provider>
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  );
}
