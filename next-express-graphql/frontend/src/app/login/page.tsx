"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN, REGISTER } from "@/lib/mutations";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const { setAuth } = useAuthStore();
  const router = useRouter();

  const [login] = useMutation(LOGIN);
  const [register] = useMutation(REGISTER);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const mutation = isLogin ? login : register;
      const variables = isLogin
        ? { input: { email, password } }
        : { input: { email, password, name } };

      const { data } = await mutation({ variables });

      if (data?.login || data?.register) {
        const result = data.login || data.register;
        localStorage.setItem("token", result.token);
        setAuth(result.token, result.user);
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {isLogin ? "Login" : "Register"}
      </h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required={!isLogin}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          {isLogin ? "Login" : "Register"}
        </button>
      </form>

      <p className="mt-4 text-center">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-500 hover:underline"
        >
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
}
