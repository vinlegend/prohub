'use client';
import * as React from 'react';

export interface FormFileUploadProps {
  label?: string;
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  error?: string;
  showBrowserTooltip?: boolean;
  right?: React.ReactNode;
  accept?: string; // e.g. "image/*,.pdf,.doc,.docx"
}

export default function FormFileUpload({
  label,
  value,
  onChange,
  maxFiles = 5,
  error,
  showBrowserTooltip = false,
  right,
  accept,
}: FormFileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const inputId = React.useId();

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const next = [...value, ...files].slice(0, maxFiles);
    onChange(next);
    // allow selecting the same file again
    if (inputRef.current) inputRef.current.value = '';
  }

  const selectedText =
    value.length === 0
      ? 'No file chosen'
      : `${value.length} file${value.length > 1 ? 's' : ''} selected (max ${maxFiles})`;

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">{label}</label>
          {right}
        </div>
      )}

      {/* Row: button + selected text */}
      <div className="flex items-center gap-3">
        {/* Native input hidden, triggered by the label */}
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFiles}
          className="sr-only"
          title={showBrowserTooltip ? undefined : ''}
        />

        {/* Button that opens the file dialog */}
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer select-none items-center rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/80"
        >
          Choose Files
        </label>

        {/* Custom right-side text */}
        <span className="text-sm text-muted-foreground">{selectedText}</span>
      </div>

      {/* Previews (images get a thumbnail; non-images show filename) */}
      {value.length > 0 && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {value.map((f, idx) => {
            const isImage = f.type.startsWith('image/');
            const url = isImage ? URL.createObjectURL(f) : '';
            return (
              <div
                key={`${f.name}-${idx}`}
                className="overflow-hidden rounded-lg border border-border bg-card"
              >
                {isImage ? (
                  <img src={url} alt={f.name} className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 items-center justify-center px-3 text-center text-xs text-muted-foreground">
                    {f.name}
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-border px-3 py-2">
                  <span className="truncate text-xs text-muted-foreground">{f.name}</span>
                  <button
                    type="button"
                    className="text-xs text-destructive hover:underline"
                    onClick={() => {
                      const next = value.slice();
                      next.splice(idx, 1);
                      onChange(next);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
