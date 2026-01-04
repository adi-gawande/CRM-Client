// "use client";

// import React, { useState } from "react";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import { Moon, Sun } from "lucide-react";

// const themes = [
//   { name: "theme6", label: "Default" },
//   { name: "Amber Minimal", label: "Amber Minimal" },
//   { name: "Amethyst Haze", label: "Amethyst Haze" },
//   { name: "Bold Tech", label: "Bold Tech" },
//   { name: "Bubble Gum", label: "Bubble Gum" },
//   { name: "Doom 64", label: "Doom 64" },
// ];

// export default function Page() {
//   const [darkMode, setDarkMode] = useState(
//     typeof window !== "undefined" && localStorage.getItem("app-dark") === "true"
//   );

//   const [activeTheme, setActiveTheme] = useState(
//     typeof window !== "undefined"
//       ? localStorage.getItem("app-theme") || "theme6"
//       : "theme6"
//   );

//   const applyTheme = (theme, dark) => {
//     document.documentElement.setAttribute("data-theme", theme);
//     document.documentElement.classList.toggle("dark", dark);
//   };

//   const handleTheme = (theme) => {
//     setActiveTheme(theme);
//     localStorage.setItem("app-theme", theme);
//     applyTheme(theme, darkMode);
//   };

//   const handleMode = (value) => {
//     const isDark = value === "dark";
//     setDarkMode(isDark);
//     localStorage.setItem("app-dark", isDark);
//     applyTheme(activeTheme, isDark);
//   };

//   return (
//     <div className="p-8 space-y-6">
//       <h1 className="text-2xl font-bold">Pick Your Theme</h1>

//       <Tabs value={darkMode ? "dark" : "light"} onValueChange={handleMode}>
//         <TabsList>
//           <TabsTrigger value="light">
//             <Sun className="h-4 w-4 mr-1" /> Light
//           </TabsTrigger>
//           <TabsTrigger value="dark">
//             <Moon className="h-4 w-4 mr-1" /> Dark
//           </TabsTrigger>
//         </TabsList>
//       </Tabs>

//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//         {themes.map((t) => (
//           <Button
//             key={t.name}
//             variant={t.name === activeTheme ? "default" : "outline"}
//             onClick={() => handleTheme(t.name)}
//           >
//             {t.label}
//           </Button>
//         ))}
//       </div>
//     </div>
//   );
// }
"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const themes = [
  { name: "default", label: "Default" },
  { name: "Amber Minimal", label: "Amber Minimal" },
  { name: "Amethyst Haze", label: "Amethyst Haze" },
  { name: "Bold Tech", label: "Bold Tech" },
  { name: "Bubble Gum", label: "Bubble Gum" },
  { name: "Doom 64", label: "Doom 64" },
];

export default function Page() {
  const { theme, setTheme } = useTheme(); // dark / light
  const [activeTheme, setActiveTheme] = useState("theme6");

  /* Load saved palette theme */
  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") || "theme6";
    setActiveTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const applyPalette = (themeName) => {
    setActiveTheme(themeName);
    localStorage.setItem("app-theme", themeName);
    document.documentElement.setAttribute("data-theme", themeName);
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Pick Your Theme</h1>

      {/* 🌗 Dark / Light Tabs */}
      <Tabs value={theme} onValueChange={setTheme}>
        <TabsList>
          <TabsTrigger value="light">
            <Sun className="h-4 w-4 mr-2" />
            Light
          </TabsTrigger>
          <TabsTrigger value="dark">
            <Moon className="h-4 w-4 mr-2" />
            Dark
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 🎨 Palette Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {themes.map((t) => (
          <Button
            key={t.name}
            variant={t.name === activeTheme ? "default" : "outline"}
            onClick={() => applyPalette(t.name)}
          >
            {t.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
