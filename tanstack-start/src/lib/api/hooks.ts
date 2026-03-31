import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface UsersResponse {
  success: boolean;
  data: UserPublic[];
}

async function fetchUsers(): Promise<UserPublic[]> {
  const response = await fetch("/api/users", {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch users");
  const data: UsersResponse = await response.json();
  return data.data;
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
}

export function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["users"] });
}
