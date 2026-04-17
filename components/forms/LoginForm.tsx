"use client";

import { useState } from "react";
import { signIn } from "@/lib/actions/auth";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const email    = fd.get("email")    as string;
    const password = fd.get("password") as string;

    const result = await signIn(email, password);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="form-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="nombre@armglobal.com"
          className="form-input"
        />
      </div>

      <div>
        <label className="form-label" htmlFor="password">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="form-input pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                       hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full justify-center py-2.5"
      >
        {loading ? (
          <><Loader2 size={14} className="animate-spin" /> Ingresando...</>
        ) : (
          "Ingresar"
        )}
      </button>
    </form>
  );
}
