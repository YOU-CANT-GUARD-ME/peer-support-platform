// src/components/DarkMode.jsx
import { useContext, useEffect } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

export default function DarkMode({ children }) {
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    if (darkMode) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  }, [darkMode]);

  return children;
}
