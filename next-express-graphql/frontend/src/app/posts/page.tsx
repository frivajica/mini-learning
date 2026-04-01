"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_POSTS } from "@/lib/queries";
import { CREATE_POST } from "@/lib/mutations";
import { useAuthStore } from "@/lib/store";
import Link from "next/link";

export default function PostsPage() {
  const [page, setPage] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const limit = 5;

  const { data, loading, refetch } = useQuery(GET_POSTS, {
    variables: { offset: page * limit, limit },
  });

  const [createPost] = useMutation(CREATE_POST);
  const { isAuthenticated } = useAuthStore();

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      await createPost({ variables: { input: { title, content } } });
      setTitle("");
      setContent("");
      refetch();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  const posts = data?.posts;
  const totalPages = posts ? Math.ceil(posts.totalCount / limit) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Posts (Offset Pagination)</h1>

      {isAuthenticated && (
        <form onSubmit={handleCreatePost} className="mb-8 p-4 border rounded">
          <h2 className="font-semibold mb-2">Create New Post</h2>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Create Post
          </button>
        </form>
      )}

      <div className="space-y-3 mb-4">
        {posts?.items?.map(
          (post: {
            id: string;
            title: string;
            content: string;
            author: { name: string };
          }) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="block p-4 border rounded hover:bg-gray-50"
            >
              <h3 className="font-medium">{post.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {post.content}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                by {post.author?.name}
              </p>
            </Link>
          ),
        )}
      </div>

      <div className="flex gap-2 items-center">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page + 1} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!posts?.hasMore}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
