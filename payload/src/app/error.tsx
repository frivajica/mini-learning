"use client";

import { useState } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  if (hasError && error) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 border border-red-200 rounded-lg bg-red-50 max-w-md">
          <h2 className="text-xl font-bold text-red-700 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-600 mb-4">{error.message}</p>
          <button
            onClick={() => {
              setHasError(false);
              setError(null);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 border border-red-200 rounded-lg bg-red-50 max-w-md">
            <h2 className="text-xl font-bold text-red-700 mb-2">
              Something went wrong
            </h2>
            <p className="text-red-600 mb-4">
              {error.message || "An unexpected error occurred"}
            </p>
            {error.digest && (
              <p className="text-xs text-red-400 mb-4">
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
