'use client';

import React from "react";
import {
  ChevronLeft,
  MoveUpRight,
  PanelLeftOpen,
  PanelLeft
} from "lucide-react";
import { useSidebar } from "./../ui/sidebar-context";
import ThemeSwitch from "./../ui/ThemeSwitch";

type HeaderProps = {
  title: string;
  onBack?: () => void;
  onLogout?: () => void;
  rightExtra?: React.ReactNode;
  className?: string;
};

export default function Header({
  title,
  onBack,
  onLogout,
  rightExtra,
  className,
}: HeaderProps) {
  const { collapsed, setCollapsed, setMobileOpen } = useSidebar();
  const [visible, setVisible] = React.useState(true);
  const [atTop, setAtTop] = React.useState(true);
  const lastScroll = React.useRef(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      // hide on scroll down, show on scroll up
      if (y > lastScroll.current && y > 20) setVisible(false);
      else setVisible(true);
      lastScroll.current = y;

      // detect top
      setAtTop(y <= 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleSidebarButton() {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
      setCollapsed(v => !v);
    } else {
      setMobileOpen(true);
    }
  }

  return (
    <header
      className={[
        "sticky top-0 z-50 transition-all duration-300 will-change-transform",
        visible ? "translate-y-0" : "-translate-y-full",
        atTop
          ? "bg-card border-b border-border"                 
          : "bg-card/80 backdrop-blur dark:bg-secondary/60", 
        "flex items-center justify-between h-24",
        "border-b border-border",
        className || "",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 pl-2">
        <button
          onClick={handleSidebarButton}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
        </button>

        {onBack && (
          <button
            onClick={onBack}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-secondary"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      <div className="ml-auto flex items-center gap-2 px-4">
        <ThemeSwitch />
        {rightExtra}
        {onLogout && (
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-foreground hover:bg-accent"
          >
            <MoveUpRight className="h-4 w-4" />
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
