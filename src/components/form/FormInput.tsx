'use client';

import * as React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;                // external error (e.g., from Zod)
  showBrowserTooltip?: boolean;  // default true. Set false to show inline instead
  id?: string;
};

export default function FormInput({
  label,
  error,
  showBrowserTooltip = true,
  id,
  className = '',
  ...rest
}: Props) {
  const [nativeError, setNativeError] = React.useState<string>('');

  const onInvalid = (e: React.InvalidEvent<HTMLInputElement>) => {
    // If we don't want the browser tooltip, stop it and store the message
    if (!showBrowserTooltip) {
      e.preventDefault();
      setNativeError(e.currentTarget.validationMessage);
    }
  };

  const onInput = () => {
    // Clear native error as the user types
    if (nativeError) setNativeError('');
  };

  const hasError = !!error || (!!nativeError && !showBrowserTooltip);

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1 block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        aria-invalid={hasError}
        onInvalid={onInvalid}
        onInput={onInput}
        className={[
          'w-full rounded-md border bg-card px-3 py-2 text-sm outline-none',
          'border-input focus:ring-2 focus:ring-ring/60',
          hasError ? 'border-red-500 focus:ring-red-400/40' : '',
        ].join(' ')}
        {...rest}  // ← this forwards required/pattern/min/max/title/etc.
      />

      {/* External error (e.g., Zod) takes priority; otherwise show native message inline */}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {!error && !showBrowserTooltip && nativeError && (
        <p className="mt-1 text-xs text-red-500">{nativeError}</p>
      )}
    </div>
  );
}
