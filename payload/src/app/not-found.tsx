import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Mini Payload CMS
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Go Home
        </Link>
      </main>
    </div>
  );
}
