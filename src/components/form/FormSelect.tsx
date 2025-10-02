'use client';

import * as React from 'react';

type Option = { value: string; label: string };

type Props = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> & {
  label?: string;
  value: string | undefined;
  onChange: (val: string) => void;
  options: Array<Option | string>;
  optionLabel?: string;          
  error?: string;                
  showBrowserTooltip?: boolean;  
};

export default function FormSelect({
  label,
  value,
  onChange,
  options,
  optionLabel = 'Select…',
  error,
  showBrowserTooltip = true,
  className = '',
  id,
  onInvalid,
  onInput,
  ...rest
}: Props) {
  const opts: Option[] = options.map(o =>
    typeof o === 'string' ? { value: o, label: o } : o
  );
  const [nativeError, setNativeError] = React.useState('');

  const handleInvalid = (e: React.InvalidEvent<HTMLSelectElement>) => {
    if (!showBrowserTooltip) {
      e.preventDefault();
      setNativeError(e.currentTarget.validationMessage);
    }
    onInvalid?.(e);
  };

  const handleInput = (e: React.FormEvent<HTMLSelectElement>) => {
    if (nativeError) setNativeError('');
    onInput?.(e);
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

      <div className="relative">
        <select
          id={id}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onInvalid={handleInvalid}
          onInput={handleInput}
          aria-invalid={hasError}
          className={[
            'w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none',
            'focus:ring-2 focus:ring-ring/60',
            hasError ? 'border-red-500 focus:ring-red-400/40' : '',
          ].join(' ')}
          {...rest}
        >
          {/* Placeholder: shown when nothing selected, hidden in dropdown */}
          <option value="" disabled hidden>
            {optionLabel}
          </option>

          {opts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {!error && !showBrowserTooltip && nativeError && (
        <p className="mt-1 text-xs text-red-500">{nativeError}</p>
      )}
    </div>
  );
}
