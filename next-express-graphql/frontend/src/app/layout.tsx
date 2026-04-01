"use client";

import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "@/lib/apollo";
import { useAuthStore } from "@/lib/store";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, logout, user } = useAuthStore();

  return (
    <html lang="en">
      <body>
        <ApolloProvider client={apolloClient}>
          <nav className="p-4 border-b">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-xl font-bold">
                mini-express-graphql
              </Link>
              <div className="flex gap-4 items-center">
                <Link href="/posts" className="hover:underline">
                  Posts
                </Link>
                <Link href="/products" className="hover:underline">
                  Products
                </Link>
                {isAuthenticated ? (
                  <>
                    <span className="text-gray-600">{user?.name}</span>
                    <button
                      onClick={logout}
                      className="text-red-500 hover:underline"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="hover:underline">
                    Login
                  </Link>
                )}
              </div>
            </div>
          </nav>
          <main className="container mx-auto p-4">{children}</main>
        </ApolloProvider>
      </body>
    </html>
  );
}
