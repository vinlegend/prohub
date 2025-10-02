'use client';

export default function Error({
  error,
  reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-lg font-semibold text-rose-600">/ops crashed</h1>
      <pre className="whitespace-pre-wrap text-sm text-slate-700">
        {error?.message || String(error)}
      </pre>
      <button
        onClick={() => reset()}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-white"
      >
        Try again
      </button>
    </div>
  );
}
