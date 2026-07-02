"use client";

import { motion } from "framer-motion";
import { DERBY_COINS } from "@/lib/constants";

const FEATURES = [
  {
    icon: "⚡",
    title: "Live crypto races",
    desc: "8 top coins race in real time",
  },
  {
    icon: "💰",
    title: "$10,000 wallet",
    desc: "Virtual bankroll on signup",
  },
  {
    icon: "📈",
    title: "Market data",
    desc: "Powered by CoinGecko",
  },
  {
    icon: "🏆",
    title: "Multiplayer",
    desc: "Challenge friends, win the pot",
  },
];

const STEPS = [
  { n: "01", label: "Pick a coin", icon: "🪙" },
  { n: "02", label: "Race the market", icon: "🏁" },
  { n: "03", label: "Win the pot", icon: "💎" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

type Props = {
  onLogin: () => void;
  onRegister: () => void;
};

export function LandingHero({ onLogin, onRegister }: Props) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -20, transition: { duration: 0.35 } }}
      className="w-full max-w-4xl mx-auto text-center px-2"
    >
      <motion.div variants={item} className="mb-8">
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 mb-6 shadow-lg shadow-emerald-500/10"
          animate={{ y: [0, -10, 0], rotate: [0, 4, -4, 0] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
        >
          <span className="text-5xl">🏇</span>
        </motion.div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-4">
          <span className="bg-gradient-to-r from-emerald-300 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
            Crypto Derby
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-zinc-400 max-w-lg mx-auto leading-relaxed">
          Pick a coin. Race the market.{" "}
          <motion.span
            className="text-emerald-400 font-medium"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          >
            Win the pot.
          </motion.span>
        </p>
      </motion.div>

      <motion.div
        variants={item}
        className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mb-10"
      >
        {STEPS.map((step, i) => (
          <div key={step.n} className="flex items-center gap-2 sm:gap-3">
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/8 backdrop-blur-sm"
            >
              <span className="text-lg">{step.icon}</span>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-emerald-500/80">
                  {step.n}
                </p>
                <p className="text-sm font-medium text-zinc-200">{step.label}</p>
              </div>
            </motion.div>
            {i < STEPS.length - 1 && (
              <span className="text-zinc-600 text-sm hidden sm:inline">→</span>
            )}
          </div>
        ))}
      </motion.div>

      <motion.div
        variants={item}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10 max-w-2xl mx-auto"
      >
        {FEATURES.map((f) => (
          <motion.div
            key={f.title}
            whileHover={{ y: -3, borderColor: "rgba(52,211,153,0.3)" }}
            className="p-4 rounded-2xl bg-black/30 border border-white/6 text-left transition-colors"
          >
            <span className="text-2xl mb-2 block">{f.icon}</span>
            <p className="text-sm font-semibold text-zinc-200">{f.title}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        variants={item}
        className="flex flex-wrap justify-center gap-2 mb-10"
      >
        {DERBY_COINS.map((coin, i) => (
          <motion.span
            key={coin.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + i * 0.05, type: "spring", stiffness: 260 }}
            whileHover={{ scale: 1.1, y: -3 }}
            className="px-3 py-1.5 rounded-full text-xs font-bold border bg-black/40 cursor-default"
            style={{
              color: coin.color,
              borderColor: `${coin.color}55`,
            }}
          >
            {coin.symbol}
          </motion.span>
        ))}
      </motion.div>

      <motion.div
        variants={item}
        className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
      >
        <motion.button
          type="button"
          onClick={onRegister}
          whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(16,185,129,0.35)" }}
          whileTap={{ scale: 0.97 }}
          className="w-full sm:w-auto min-w-[200px] px-8 py-4 rounded-2xl font-semibold text-black login-cta text-base"
        >
          Get Started Free →
        </motion.button>
        <motion.button
          type="button"
          onClick={onLogin}
          whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.08)" }}
          whileTap={{ scale: 0.97 }}
          className="w-full sm:w-auto min-w-[200px] px-8 py-4 rounded-2xl font-semibold text-zinc-200 border border-white/15 bg-white/5 backdrop-blur-sm text-base transition-colors"
        >
          Sign In
        </motion.button>
      </motion.div>

      <motion.p
        variants={item}
        className="text-xs text-zinc-600 mt-8 flex items-center justify-center gap-2"
      >
        <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
        No real money · Digitally secured · $10k virtual wallet
        <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
      </motion.p>
    </motion.div>
  );
}
