import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Users as UsersIcon, ArrowRight } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const Route = createFileRoute("/_authed/users")({
  loader: async () => {
    const response = await fetch("/api/users", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch users");
    const data = await response.json();
    return data.data as User[];
  },
  component: Users,
});

function Users() {
  const users = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <p className="text-muted-foreground">Manage your application users.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users?.map((user) => (
          <Card key={user.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <UsersIcon className="h-4 w-4 mr-2 inline" />
                {user.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                {user.email}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {user.role}
                </span>
                <Link to="/users/$userId" params={{ userId: user.id }}>
                  <Button variant="ghost" size="sm">
                    View <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
