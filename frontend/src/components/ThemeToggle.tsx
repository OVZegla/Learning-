"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icons";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("lp-theme") : null;
    const initial = saved === "dark";
    document.documentElement.setAttribute("data-theme", initial ? "dark" : "light");
    setDark(initial);
  }, []);

  const toggle = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("lp-theme", next);
    setDark(!dark);
  };

  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Basculer le thème">
      {dark ? <Icon.sun width={16} height={16} /> : <Icon.moon width={16} height={16} />}
    </button>
  );
}
