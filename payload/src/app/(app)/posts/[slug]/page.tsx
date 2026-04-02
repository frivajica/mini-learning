import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPayload } from "@/lib/payload";
import { formatDate } from "@/lib/utils";
import { lexicalToHtml } from "@/lib/lexical";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPostBySlug(slug: string) {
  try {
    const payload = await getPayload();

    const { docs: posts } = await payload.find({
      collection: "posts",
      where: {
        slug: {
          equals: slug,
        },
        status: {
          equals: "published",
        },
      },
      depth: 2,
    });

    return posts[0] || null;
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.excerpt || undefined,
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Mini Payload CMS
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/posts" className="text-sm font-medium">
              All Posts
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

      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <article>
          <header className="mb-12">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {post.author && typeof post.author === "object" && (
                <span>By {post.author.name || post.author.email}</span>
              )}
              {post.publishedAt && (
                <>
                  <span>•</span>
                  <time dateTime={post.publishedAt}>
                    {formatDate(post.publishedAt)}
                  </time>
                </>
              )}
            </div>
            {post.category && typeof post.category === "object" && (
              <div className="mt-4">
                <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {post.category.name}
                </span>
              </div>
            )}
          </header>

          {post.featuredImage && typeof post.featuredImage === "object" && (
            <figure className="mb-12">
              <img
                src={post.featuredImage.url || "/placeholder.jpg"}
                alt={post.featuredImage.alt || post.title}
                className="w-full rounded-lg"
              />
            </figure>
          )}

          <div className="prose prose-lg max-w-none">
            {typeof post.content === "object" && post.content && (
              <div
                dangerouslySetInnerHTML={{
                  __html: await lexicalToHtml(post.content),
                }}
              />
            )}
            {typeof post.content === "string" && <p>{post.content}</p>}
          </div>

          {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
            <footer className="mt-12 pt-8 border-t">
              <div className="flex gap-2 flex-wrap">
                {post.tags
                  .filter(
                    (tag): tag is { name: string; slug: string } =>
                      typeof tag === "object",
                  )
                  .map((tag) => (
                    <span
                      key={tag.slug}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      #{tag.name}
                    </span>
                  ))}
              </div>
            </footer>
          )}
        </article>
      </main>
    </div>
  );
}
