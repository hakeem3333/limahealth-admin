"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext(undefined);

export const THEMES = ["bright", "semi-bright", "dark"];
const STORAGE_KEY = "lh_ui_theme";
const DEFAULT_THEME = "bright";

function applyTheme(value) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", value);
  }
}

// A display preference for the signed-in admin's own browser — not an
// org-wide policy, so it lives in localStorage rather than the backend.
// The blocking script in app/layout.jsx sets the attribute before paint;
// this provider just picks up that same value so React state matches the DOM.
export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(DEFAULT_THEME);

  useEffect(() => {
    let stored;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {}
    setThemeName(THEMES.includes(stored) ? stored : DEFAULT_THEME);
  }, []);

  const setTheme = useCallback((value) => {
    if (!THEMES.includes(value)) return;
    setThemeName(value);
    applyTheme(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {}
  }, []);

  return (
    <ThemeContext.Provider value={{ themeName, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
