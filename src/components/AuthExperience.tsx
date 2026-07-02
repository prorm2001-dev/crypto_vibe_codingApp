"use client";

import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { AuthForm } from "@/components/AuthForm";
import { LandingHero } from "@/components/LandingHero";
import { LoginBackground } from "@/components/LoginBackground";

type Screen = "landing" | "auth";

export function AuthExperience() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [mode, setMode] = useState<"login" | "register">("login");

  const openAuth = (nextMode: "login" | "register") => {
    setMode(nextMode);
    setScreen("auth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 sm:py-14 relative overflow-hidden login-page">
      <LoginBackground intensity={screen === "landing" ? "full" : "subtle"} />

      <div className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {screen === "landing" ? (
            <LandingHero
              key="landing"
              onLogin={() => openAuth("login")}
              onRegister={() => openAuth("register")}
            />
          ) : (
            <AuthForm
              key="auth"
              mode={mode}
              onModeChange={setMode}
              onBack={() => setScreen("landing")}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
