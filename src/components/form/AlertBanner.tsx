'use client';

import * as React from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

type Variant = 'success' | 'error';

export type AlertBannerProps = {
  open: boolean;
  onClose?: () => void;
  variant?: Variant;
  title?: string;
  description?: string;
  details?: string[]; // bullet list (e.g., Zod errors)
  className?: string;
};

export default function AlertBanner({
  open,
  onClose,
  variant = 'success',
  title,
  description,
  details,
  className = '',
}: AlertBannerProps) {
  if (!open) return null;

  const isSuccess = variant === 'success';

  const wrap = isSuccess
    ? [
        'bg-alert-success-bg text-alert-success-text border-alert-success-border',
      ].join(' ')
    : [
        'bg-alert-error-bg text-alert-error-text border-alert-error-border',
      ].join(' ');

  const icon = isSuccess ? (
    <CheckCircle2 className="mt-[2px] h-5 w-5 text-emerald-600 dark:text-emerald-400" />
  ) : (
    <XCircle className="mt-[2px] h-5 w-5 text-rose-600 dark:text-rose-400" />
  );

  return (
    <div
      className={[
        'rounded-lg border mb-4 px-4 py-3 shadow-sm',
        'flex items-start gap-3',
        wrap,
        className,
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      {icon}
      <div className="flex-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="mt-1 text-sm">{description}</div>}
        {details && details.length > 0 && (
          <ul className="mt-2 list-disc pl-5 text-sm">
            {details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          title="Dismiss"
          className="ml-2 text-current/70 hover:text-current"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
