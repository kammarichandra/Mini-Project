import { useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./ThemeContext";

const themeStorageKey = "employeeManagementTheme";

function getInitialTheme() {
  try {
    return window.localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const updateTheme = (nextTheme) => {
    setTheme(nextTheme);

    try {
      window.localStorage.setItem(themeStorageKey, nextTheme);
      return true;
    } catch {
      return false;
    }
  };

  const value = useMemo(() => ({ theme, setTheme: updateTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export default ThemeProvider;
