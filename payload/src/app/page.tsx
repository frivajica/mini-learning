import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Mini Payload CMS</h1>
          <nav className="flex items-center gap-4">
            <Link href="/posts" className="text-sm hover:underline">
              All Posts
            </Link>
            <Link
              href="/admin"
              className="text-sm px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Learn Payload CMS
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            A production-ready reference implementation for understanding
            Payload CMS patterns with Next.js 16.
          </p>

          <div className="grid gap-4 mt-12">
            <Link
              href="/posts"
              className="block p-6 border rounded-lg hover:border-black transition-colors"
            >
              <h3 className="text-lg font-semibold mb-2">Browse Posts</h3>
              <p className="text-sm text-muted-foreground">
                View published blog posts
              </p>
            </Link>

            <Link
              href="/admin"
              className="block p-6 border rounded-lg hover:border-black transition-colors"
            >
              <h3 className="text-lg font-semibold mb-2">Admin Panel</h3>
              <p className="text-sm text-muted-foreground">
                Manage posts, categories, tags, and media
              </p>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          Built with Payload CMS + Next.js 16
        </div>
      </footer>
    </div>
  );
}
