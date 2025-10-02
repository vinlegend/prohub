// src/components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Mode = "light" | "dark" | "system";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem("theme") as Mode) || "system";
    setMode(saved);
  }, []);

  // ✅ While not mounted, render a stable markup so SSR = CSR
  if (!mounted) {
    return (
      <Button variant="ghost"  className="h-9 w-9" aria-label="Toggle theme">
        <Sun className="h-4 w-4 transition-all rotate-0 scale-100" />
      </Button>
    );
  }

  // Client-only logic
  const effective =
    mode === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : mode;

  const apply = (next: Mode) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    const final =
      next === "system"
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : next;
    root.classList.add(final);
    localStorage.setItem("theme", next);
    setMode(next);
  };

  const cycle = () => apply(mode === "light" ? "dark" : mode === "dark" ? "system" : "light");

  return (
    <Button variant="ghost"  className="h-9 w-9" onClick={cycle} aria-label="Toggle theme">
      <Sun className={`h-4 w-4 transition-all ${effective === "dark" ? "-rotate-90 scale-0" : "rotate-0 scale-100"}`} />
      <Moon className={`absolute h-4 w-4 transition-all ${effective === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0"}`} />
    </Button>
  );
}
