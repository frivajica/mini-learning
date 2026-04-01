"use client";

import { useState } from "react";
import { useProfile, useSubscription } from "@/hooks";
import { updateProfile } from "@/actions/profile";
import { createCheckoutSession } from "@/actions/subscriptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function SettingsPage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: subscription, isLoading: subLoading } = useSubscription();

  const [fullName, setFullName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    const result = await updateProfile({ fullName });
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully!" });
    }
    setIsUpdating(false);
  };

  const handleSubscribe = async () => {
    const result = await createCheckoutSession("pro");
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result?.sessionId) {
      window.location.href = `https://checkout.stripe.com/pay/${result.sessionId}`;
    }
  };

  const isPro = subscription?.status === "active";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and subscription
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {message && (
              <div
                className={`rounded-md p-3 text-sm ${
                  message.type === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {message.text}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile?.email || ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName || profile?.full_name || ""}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <Button type="submit" disabled={isUpdating || profileLoading}>
              {isUpdating ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subLoading ? (
            <p className="text-muted-foreground">Loading subscription...</p>
          ) : isPro ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="default">Pro Plan</Badge>
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your Pro subscription is active. You have full access to all
                features.
              </p>
              <p className="text-sm">
                Current period ends:{" "}
                {subscription?.current_period_end
                  ? new Date(
                      subscription.current_period_end,
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
              <Button variant="outline">Manage Subscription</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Pro Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      Full access to all features
                    </p>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(9.99)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /mo
                    </span>
                  </p>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>✓ Unlimited tasks</li>
                  <li>✓ Real-time sync</li>
                  <li>✓ Priority support</li>
                </ul>
              </div>
              <Button onClick={handleSubscribe} className="w-full">
                Subscribe to Pro
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
