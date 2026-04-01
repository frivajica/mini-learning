"use client";

import { useQuery } from "@apollo/client";
import { GET_POSTS } from "@/lib/queries";
import { useAuthStore } from "@/lib/store";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { isAuthenticated } = useAuthStore();
  const [comment, setComment] = useState("");
  const router = useRouter();

  const { data, loading, refetch } = useQuery(GET_POSTS, {
    variables: { offset: 0, limit: 100 },
  });

  const post = data?.posts?.items?.find((p: { id: string }) => p.id === id);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation CreateComment($input: CreateCommentInput!) {
              createComment(input: $input) {
                id
              }
            }
          `,
          variables: { input: { postId: id, content: comment } },
        }),
      });
      setComment("");
      refetch();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!post) return <p>Post not found</p>;

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="mb-4 text-blue-500 hover:underline"
      >
        ← Back
      </button>

      <article className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
        <p className="text-sm text-gray-500 mb-4">by {post.author?.name}</p>
        <div className="prose">{post.content}</div>
      </article>

      <section>
        <h2 className="text-lg font-semibold mb-3">
          Comments ({post.comments?.length || 0})
        </h2>

        {isAuthenticated && (
          <form onSubmit={handleAddComment} className="mb-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-2 border rounded mb-2"
              rows={2}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Comment
            </button>
          </form>
        )}

        <div className="space-y-3">
          {post.comments?.map(
            (c: { id: string; content: string; author: { name: string } }) => (
              <div key={c.id} className="p-3 border rounded">
                <p>{c.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  by {c.author?.name}
                </p>
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
