// components/ui/ConfirmDialog.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLoading?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  onCancel,
  onConfirm,
  confirmLoading,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />

      {/* Panel */}
      <div className="relative z-10 w-[20%] max-w-md rounded-xl border border-border bg-card p-5 shadow-xl">
        <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{message}</p>

        <div className="mt-4 flex items-center gap-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} isLoading={confirmLoading}>
            {confirmLoading ? "Confirming…" : "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  );
}
