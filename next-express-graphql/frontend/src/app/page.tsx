"use client";

import { useQuery } from "@apollo/client";
import { GET_POSTS } from "@/lib/queries";
import Link from "next/link";

export default function HomePage() {
  const { data, loading } = useQuery(GET_POSTS, {
    variables: { offset: 0, limit: 5 },
  });

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Welcome to mini-express-graphql
      </h1>
      <p className="mb-4">
        A production-ready learning project for GraphQL with:
      </p>
      <ul className="list-disc pl-6 mb-6">
        <li>Backend: Express + Apollo Server 4 + Drizzle + SQLite</li>
        <li>Frontend: Next.js + Apollo Client 4 + Zustand + Tailwind</li>
        <li>Offset pagination (Posts)</li>
        <li>Cursor pagination (Products)</li>
        <li>JWT Authentication</li>
        <li>DataLoader for N+1 prevention</li>
        <li>GraphQL Subscriptions (Product stock updates)</li>
      </ul>

      <h2 className="text-xl font-semibold mb-3">Recent Posts</h2>
      {data?.posts?.items?.length > 0 ? (
        <div className="space-y-3">
          {data.posts.items.map(
            (post: { id: string; title: string; author: { name: string } }) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="block p-4 border rounded hover:bg-gray-50"
              >
                <h3 className="font-medium">{post.title}</h3>
                <p className="text-sm text-gray-500">by {post.author?.name}</p>
              </Link>
            ),
          )}
        </div>
      ) : (
        <p className="text-gray-500">
          No posts yet. Create one to get started!
        </p>
      )}

      <div className="mt-6 flex gap-4">
        <Link href="/posts" className="text-blue-500 hover:underline">
          View all posts →
        </Link>
        <Link href="/products" className="text-blue-500 hover:underline">
          View products →
        </Link>
      </div>
    </div>
  );
}
