// "use client";

// import { ThemeProvider } from "@/components/theme-provider";
// import { Provider } from "react-redux";
// import { persistor, store } from "@/store/store";
// import { Toaster } from "sonner";
// import "./globals.css";
// import { PersistGate } from "redux-persist/integration/react";

// // function ThemeInitializer() {
// //   if (typeof window !== "undefined") {
// //     const theme = localStorage.getItem("app-theme") || "theme6";
// //     const dark = localStorage.getItem("app-dark") === "true";

// //     document.documentElement.setAttribute("data-theme", theme);
// //     document.documentElement.classList.toggle("dark", dark);
// //   }
// //   return null;
// // }

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       {/* <head>
//         <script
//           dangerouslySetInnerHTML={{
//             __html: `
// (function () {
//   try {
//     const dark = localStorage.getItem("app-dark") === "true";
//     if (dark) document.documentElement.classList.add("dark");
//   } catch (e) {}
// })();
// `,
//           }}
//         />
//       </head> */}
//       <body>
//         {/* <ThemeInitializer /> */}
//         <ThemeProvider
//           attribute="class"
//           defaultTheme="light"
//           enableSystem={false}
//           disableTransitionOnChange
//         >
//           <Provider store={store}>
//             <PersistGate loading={null} persistor={persistor}>
//               <>{children}</>
//             </PersistGate>
//           </Provider>
//           <Toaster position="top-right" richColors />
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }

import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "CRM Made Simplified",
  description: "CRM Dashboard",
};

export default function RootLayout({ children }) {
  const themeScript = `
    (function () {
      try {
        const theme = localStorage.getItem("app-theme") || "theme6";
        const dark = localStorage.getItem("app-dark") === "true";

        const root = document.documentElement;
        root.setAttribute("data-theme", theme);
        if (dark) root.classList.add("dark");
        else root.classList.remove("dark");
      } catch (e) {}
    })();
  `;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
