"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/history", label: "History" },
] as const;

function formatWallet(balance: number) {
  return `$${balance.toLocaleString()}`;
}

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <motion.nav
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl"
    >
      <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 shrink-0 mr-4"
        >
          <span className="text-xl sm:text-2xl leading-none">🏇</span>
          <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Crypto Derby
          </span>
        </Link>

        {/* Right cluster — wallet + nav grouped together */}
        {user && (
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition"
            >
              <span className="text-emerald-400 text-sm">💰</span>
              <span className="font-mono text-sm font-semibold text-emerald-300">
                {formatWallet(user.walletBalance)}
              </span>
            </Link>

            {/* Mobile wallet only */}
            <Link
              href="/profile"
              className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
            >
              <span className="text-xs">💰</span>
              <span className="font-mono text-xs font-semibold text-emerald-300">
                {user.walletBalance >= 1000
                  ? `$${(user.walletBalance / 1000).toFixed(0)}k`
                  : `$${user.walletBalance}`}
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm transition ${
                    pathname === link.href
                      ? "bg-white/10 text-emerald-400 font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => logout()}
                className="ml-1 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition"
              >
                Logout
              </button>
            </div>

            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg border border-white/10 hover:bg-white/5 transition"
            >
              <span
                className={`block w-4 h-0.5 bg-zinc-300 transition-all duration-200 ${
                  menuOpen ? "rotate-45 translate-y-1" : ""
                }`}
              />
              <span
                className={`block w-4 h-0.5 bg-zinc-300 my-0.5 transition-all duration-200 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-4 h-0.5 bg-zinc-300 transition-all duration-200 ${
                  menuOpen ? "-rotate-45 -translate-y-1" : ""
                }`}
              />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {user && menuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="md:hidden fixed inset-0 top-14 bg-black/60 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute left-0 right-0 top-full z-50 border-b border-white/10 bg-[#0a0a0f]/98 backdrop-blur-xl shadow-xl"
            >
              <div className="max-w-6xl mx-auto px-4 py-3 space-y-1">
                <p className="text-xs text-zinc-500 px-3 py-2">
                  Signed in as <span className="text-zinc-300">@{user.username}</span>
                </p>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      pathname === link.href
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => logout()}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-400/90 hover:bg-red-500/10 transition"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
