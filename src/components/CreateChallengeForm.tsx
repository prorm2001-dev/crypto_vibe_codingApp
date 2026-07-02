"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Format Date for `<input type="datetime-local" />` in local timezone */
function toDatetimeLocalValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultStartDatetime() {
  const d = new Date(Date.now() + 5 * 60_000);
  d.setSeconds(0, 0);
  return toDatetimeLocalValue(d);
}

function formatPreview(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CreateChallengeForm({ onCreated }: { onCreated?: () => void }) {
  const { apiFetch } = useAuth();
  const [entryAmount, setEntryAmount] = useState(100);
  const [durationMins, setDurationMins] = useState(5);
  const [startDatetime, setStartDatetime] = useState(defaultStartDatetime);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const minDatetime = useMemo(() => {
    const d = new Date(Date.now() + 60_000);
    d.setSeconds(0, 0);
    return toDatetimeLocalValue(d);
  }, [open]);

  const startTimestamp = useMemo(() => {
    const ts = new Date(startDatetime).getTime();
    return Number.isFinite(ts) ? ts : 0;
  }, [startDatetime]);

  const endTimestamp = startTimestamp + durationMins * 60_000;

  const resetForm = useCallback(() => {
    setEntryAmount(100);
    setDurationMins(5);
    setStartDatetime(defaultStartDatetime());
    setError("");
  }, []);

  const close = () => {
    if (loading) return;
    setOpen(false);
    setError("");
  };

  const openModal = () => {
    resetForm();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, loading]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const startTime = new Date(startDatetime).getTime();
    const endTime = startTime + durationMins * 60_000;

    if (!Number.isFinite(startTime)) {
      setError("Please choose a valid start date and time");
      setLoading(false);
      return;
    }

    if (startTime <= Date.now() + 60_000) {
      setError("Start time must be at least 1 minute from now");
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch("/api/challenges/create", {
        method: "POST",
        body: JSON.stringify({ startTime, endTime, entryAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onCreated?.();
      setOpen(false);
      window.location.href = `/challenge/${data.challengeId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={openModal}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
      >
        <span className="text-base leading-none">+</span>
        New Challenge
      </motion.button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.button
              type="button"
              aria-label="Close modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-challenge-title"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-md glass-panel rounded-2xl p-6 shadow-2xl shadow-black/50"
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3
                    id="create-challenge-title"
                    className="text-lg font-semibold"
                  >
                    New Challenge
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Set entry fee, start time, and race duration
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  disabled={loading}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition disabled:opacity-40"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400">
                    Entry Amount ($)
                  </label>
                  <input
                    type="number"
                    className="input-field mt-1"
                    min={10}
                    max={5000}
                    value={entryAmount}
                    onChange={(e) => setEntryAmount(Number(e.target.value))}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400">
                    Start date &amp; time
                  </label>
                  <input
                    type="datetime-local"
                    className="input-field datetime-input mt-1"
                    value={startDatetime}
                    min={minDatetime}
                    onChange={(e) => setStartDatetime(e.target.value)}
                    required
                  />
                  <p className="text-[10px] text-zinc-600 mt-1.5">
                    Your local timezone · must be at least 1 min from now
                  </p>
                </div>

                <div>
                  <label className="text-xs text-zinc-400">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    className="input-field mt-1"
                    min={2}
                    max={30}
                    value={durationMins}
                    onChange={(e) => setDurationMins(Number(e.target.value))}
                  />
                </div>

                {startTimestamp > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 px-3 py-2.5 text-xs space-y-1"
                  >
                    <p className="text-zinc-400">
                      <span className="text-emerald-400/90 font-medium">Starts:</span>{" "}
                      {formatPreview(startTimestamp)}
                    </p>
                    <p className="text-zinc-400">
                      <span className="text-emerald-400/90 font-medium">Ends:</span>{" "}
                      {formatPreview(endTimestamp)}
                    </p>
                  </motion.div>
                )}

                {error && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={close}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm hover:bg-white/5 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 transition disabled:opacity-50"
                  >
                    {loading ? "Launching..." : "Launch"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
