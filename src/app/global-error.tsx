"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[var(--bg)] text-foreground">
        <div className="min-h-screen flex flex-col items-center justify-center gap-y-4">
          <h1 className="text-2xl font-semibold">Application error</h1>
          <p className="text-sm text-[var(--muted-text)]">
            Please refresh or try again later.
          </p>
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 rounded-[var(--r1)] bg-[var(--gold)] text-black font-semibold"
          >
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}
