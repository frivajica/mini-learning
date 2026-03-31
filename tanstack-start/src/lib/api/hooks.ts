import { useQuery } from "@tanstack/react-query";

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  role: string;
}

async function fetchUsers(): Promise<UserPublic[]> {
  const response = await fetch("/api/users", {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch users");
  const data = await response.json();
  return data.data as UserPublic[];
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
}
