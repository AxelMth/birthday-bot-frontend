"use client";

import { useState, useEffect } from "react";

const themes = ["light", "dark", "ocean", "forest"] as const;
type Theme = (typeof themes)[number];

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<Theme>("light");

  useEffect(() => {
    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme && themes.includes(savedTheme)) {
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const switchTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  return (
    <div className="flex items-center gap-1">
      {themes.map((theme) => (
        <button
          key={theme}
          onClick={() => switchTheme(theme)}
          className={`
            px-2 py-1 text-xs rounded-md transition-colors capitalize
            ${
              currentTheme === theme
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted/50 text-muted"
            }
          `}
          title={`Switch to ${theme} theme`}
        >
          {theme}
        </button>
      ))}
    </div>
  );
}
