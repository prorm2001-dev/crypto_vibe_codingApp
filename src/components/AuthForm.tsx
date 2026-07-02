"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Props = {
  mode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
  onBack: () => void;
};

export function AuthForm({ mode, onModeChange, onBack }: Props) {
  const { login, register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.98, transition: { duration: 0.3 } }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <motion.button
        type="button"
        onClick={onBack}
        whileHover={{ x: -3 }}
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition mb-6"
      >
        <span aria-hidden>←</span>
        Back to home
      </motion.button>

      <div className="login-card relative rounded-2xl p-[1px] overflow-hidden">
        <div className="login-card-glow" />
        <div className="relative glass-panel rounded-2xl p-6 sm:p-8 bg-[#0c0c12]/90">
          <div className="text-center mb-6">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="text-4xl mb-2"
            >
              🏇
            </motion.div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {mode === "login" ? "Welcome back" : "Join the race"}
            </h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={mode}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="text-center text-zinc-400 text-sm mb-6"
            >
              {mode === "login"
                ? "Sign in to enter the derby"
                : "Create your account and start racing"}
            </motion.p>
          </AnimatePresence>

          <div className="relative flex rounded-xl bg-black/50 p-1 mb-6 border border-white/5">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  onModeChange(m);
                  setError("");
                }}
                className={`relative flex-1 py-2.5 rounded-lg text-sm font-medium z-10 transition-colors duration-200 ${
                  mode === m ? "text-emerald-300" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {mode === m && (
                  <motion.div
                    layoutId="auth-tab"
                    className="absolute inset-0 rounded-lg bg-emerald-500/15 border border-emerald-500/25"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">
                  {m === "login" ? "Login" : "Register"}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {mode === "register" && (
                <motion.div
                  key="username"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <label className="text-xs text-zinc-500 mb-1.5 block font-medium">
                    Username
                  </label>
                  <input
                    className="input-field login-input"
                    placeholder="derby_racer"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block font-medium">
                Email
              </label>
              <input
                className="input-field login-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  className="input-field login-input w-full pr-11"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-5 h-5"
                      aria-hidden
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <path d="M1 1l22 22" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-5 h-5"
                      aria-hidden
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02, boxShadow: "0 0 30px rgba(16,185,129,0.35)" }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              disabled={loading}
              className="relative w-full py-3.5 rounded-xl font-semibold text-black overflow-hidden disabled:opacity-60 login-cta"
            >
              <span className="relative z-10">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                      className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                    />
                    Starting engines...
                  </span>
                ) : mode === "login" ? (
                  "Enter the Derby →"
                ) : (
                  "Create Account →"
                )}
              </span>
            </motion.button>
          </form>

          <p className="text-[11px] text-zinc-600 text-center mt-5">
            {mode === "login" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => onModeChange("register")}
                  className="text-emerald-500/90 hover:text-emerald-400 transition"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already racing?{" "}
                <button
                  type="button"
                  onClick={() => onModeChange("login")}
                  className="text-emerald-500/90 hover:text-emerald-400 transition"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
