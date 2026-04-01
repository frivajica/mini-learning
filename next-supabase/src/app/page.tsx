import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-6xl">
            Mini Next Supabase
          </h1>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">
            A production-ready reference implementation for learning Supabase
            patterns with Next.js 15. Featuring authentication, real-time
            subscriptions, and Stripe payments.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg">
                Create Account
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Supabase Auth</CardTitle>
              <CardDescription>
                Email/password authentication with secure httpOnly cookies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Learn how to implement secure authentication using Supabase Auth
                with Server Actions and middleware protection.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Real-time</CardTitle>
              <CardDescription>
                Live task updates with Supabase subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                See how to use Supabase Realtime to instantly sync changes
                across all connected clients.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stripe Subscriptions</CardTitle>
              <CardDescription>
                Monthly subscription payments with Stripe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Learn to integrate Stripe for handling recurring payments and
                subscription lifecycle management.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
