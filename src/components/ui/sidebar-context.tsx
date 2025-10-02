'use client';
import * as React from 'react';

type SidebarCtx = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Ctx = React.createContext<SidebarCtx | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // lock body scroll when mobile drawer is open
  React.useEffect(() => {
    const { body } = document;
    const prev = body.style.overflow;
    if (mobileOpen) body.style.overflow = 'hidden';
    else body.style.overflow = prev || '';
    return () => { body.style.overflow = prev || ''; };
  }, [mobileOpen]);

  return (
    <Ctx.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSidebar() {
  const v = React.useContext(Ctx);
  if (!v) throw new Error('useSidebar must be used within <SidebarProvider>');
  return v;
}
