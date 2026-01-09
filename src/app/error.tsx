"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-y-4 bg-[var(--bg)] text-foreground">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-[var(--muted-text)]">
        Please try again or refresh the page.
      </p>
      <Button onClick={reset} className="bg-[var(--gold)] text-black hover:opacity-90">
        Try again
      </Button>
    </div>
  );
}
