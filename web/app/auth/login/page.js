"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginDonor } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await loginDonor({ email, password });
      saveAuth(token, user);
      router.push("/portal");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-gray-500 mt-1">Sign in to your donor account</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-emerald-600 font-medium hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
