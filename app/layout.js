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
