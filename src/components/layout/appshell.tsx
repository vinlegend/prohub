"use client";

import * as React from "react";
import Head from "next/head";

import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/topbar";
import Footer from "@/components/layout/footer";
import { SidebarProvider } from "@/components/ui/sidebar-context";

type AppShellProps = {
  title: string;
  rightExtra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export default function AppShell({
  title,
  rightExtra,
  children,
  className = "",
}: AppShellProps) {
  return (
    <SidebarProvider>
      <Head>
        <title>{title}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-dvh bg-background text-foreground flex flex-col">
        <div className="flex flex-1 items-stretch">
          <Sidebar />

          <div className="flex min-h-dvh w-full flex-1 flex-col">
            <Header
              title={title}
              className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur"
              rightExtra={rightExtra}
            />
            <main className={`flex-1 px-6 pt-6 pb-0 ${className}`}>
              {children}
            </main>
          </div>
        </div>

        <Footer className="border-t border-border/60 bg-muted/30" />
      </div>
    </SidebarProvider>
  );
}
