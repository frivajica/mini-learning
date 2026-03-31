import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { Users, Shield } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">mini-tanstack</h1>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 text-slate-900">
            TanStack Start Mini Project
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            A production-ready reference implementation for learning TanStack
            Start, file-based routing, and server functions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <Users className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">User Management</h3>
            <p className="text-slate-600">
              JWT authentication with httpOnly cookies, protected routes, and
              user listing with TanStack Query.
            </p>
          </div>
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <Shield className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Security First</h3>
            <p className="text-slate-600">
              Short-lived access tokens, token rotation, rate limiting, and
              server-side validation.
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-slate-600 mb-4">
            Built with TypeScript, TanStack Query, and modern React patterns.
          </p>
          <Link to="/register">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
