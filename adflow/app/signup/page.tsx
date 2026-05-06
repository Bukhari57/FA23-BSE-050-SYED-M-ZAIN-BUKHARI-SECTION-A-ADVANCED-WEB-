"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    // Insert user profile into users table
    const user = data.user;
    if (user) {
      const { error: insertError } = await supabase.from("users").insert({
        id: user.id,
        email: user.email,
        full_name: user.email,
        role: "client",
      });
      if (insertError) {
        setLoading(false);
        setError("Sign up succeeded but failed to create user profile: " + insertError.message);
        return;
      }
    }
    setLoading(false);
    router.push("/signin");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSignUp} className="w-full max-w-sm p-6 bg-white rounded shadow">
        <h1 className="mb-4 text-2xl font-bold">Sign Up</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        {error && <div className="mb-2 text-red-600">{error}</div>}
        <button
          type="submit"
          className="w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-700"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
