// "use client";

// import * as React from "react";
// import { Moon, Sun } from "lucide-react";
// import { Switch } from "@/components/ui/switch";

// export function ThemeToggle() {
//   const [dark, setDark] = React.useState(false);

//   // sync on mount
//   React.useEffect(() => {
//     const isDark = localStorage.getItem("app-dark") === "true";
//     setDark(isDark);
//   }, []);

//   const handleToggle = (checked) => {
//     setDark(checked);
//     localStorage.setItem("app-dark", checked);
//     document.documentElement.classList.toggle("dark", checked);
//   };

//   return (
//     <div className="flex items-center gap-2">
//       <Sun className={`h-4 w-4 ${dark ? "text-muted-foreground" : ""}`} />

//       <Switch
//         checked={dark}
//         onCheckedChange={handleToggle}
//         aria-label="Toggle dark mode"
//       />

//       <Moon className={`h-4 w-4 ${dark ? "" : "text-muted-foreground"}`} />
//     </div>
//   );
// }

"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
}
