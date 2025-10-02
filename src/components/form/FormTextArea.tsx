'use client';

import * as React from 'react';

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;                 // external error (e.g., zod)
  showBrowserTooltip?: boolean;   // default true
};

export default function FormTextArea({
  label,
  error,
  showBrowserTooltip = true,
  className = '',
  id,
  onInvalid,
  onInput,
  ...rest
}: Props) {
  const [nativeError, setNativeError] = React.useState('');

  const handleInvalid = (e: React.InvalidEvent<HTMLTextAreaElement>) => {
    if (!showBrowserTooltip) {
      e.preventDefault();
      setNativeError(e.currentTarget.validationMessage);
    }
    onInvalid?.(e);
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    if (nativeError) setNativeError('');
    onInput?.(e);
  };

  const hasError = !!error || (!!nativeError && !showBrowserTooltip);

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <textarea
        id={id}
        aria-invalid={hasError}
        onInvalid={handleInvalid}
        onInput={handleInput}
        className={[
          'w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-sm outline-none',
          'focus:ring-2 focus:ring-ring/60',
          hasError ? 'border-red-500 focus:ring-red-400/40' : '',
        ].join(' ')}
        {...rest}  // forwards required, minLength, maxLength, etc.
      />

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {!error && !showBrowserTooltip && nativeError && (
        <p className="mt-1 text-xs text-red-500">{nativeError}</p>
      )}
    </div>
  );
}
