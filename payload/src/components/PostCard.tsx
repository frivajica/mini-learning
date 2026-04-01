import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    publishedAt?: string | null;
    author?: {
      name?: string | null;
      email?: string;
    } | null;
    category?: {
      name: string;
    } | null;
    featuredImage?: {
      url?: string;
      alt?: string;
    } | null;
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {post.featuredImage &&
        typeof post.featuredImage === "object" &&
        post.featuredImage.url && (
          <div className="aspect-video bg-gray-100">
            <img
              src={post.featuredImage.url}
              alt={post.featuredImage.alt || post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      <div className="p-6">
        {post.category && typeof post.category === "object" && (
          <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
            {post.category.name}
          </span>
        )}
        <h2 className="text-xl font-semibold mt-2 mb-3">
          <Link href={`/posts/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </h2>
        {post.excerpt && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {post.author && typeof post.author === "object" && (
            <span>{post.author.name || post.author.email}</span>
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
      </div>
    </article>
  );
}
