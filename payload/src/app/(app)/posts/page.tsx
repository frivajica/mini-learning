import Link from "next/link";
import { getPayload } from "@/lib/payload";
import { PostCard } from "@/components/PostCard";

export const metadata = {
  title: "Posts - Mini Payload CMS",
  description: "Browse all published blog posts",
};

async function getPublishedPosts() {
  try {
    const payload = await getPayload();

    const { docs: posts } = await payload.find({
      collection: "posts",
      where: {
        status: {
          equals: "published",
        },
      },
      depth: 2,
      sort: "-publishedAt",
    });

    return posts;
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return [];
  }
}

export default async function PostsPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Mini Payload CMS
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/posts" className="text-sm font-medium">
              Posts
            </Link>
            <Link
              href="/admin"
              className="text-sm px-4 py-2 bg-black text-white rounded-md"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-12">All Posts</h1>

        {posts.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            No posts published yet.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
