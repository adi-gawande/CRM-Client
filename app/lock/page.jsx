"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Fingerprint, KeyRound, Lock, LogOut } from "lucide-react";

const LockScreen = () => {
  const router = useRouter();
  const [blur, setBlur] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [time, setTime] = useState(new Date());
  const timeoutRef = useRef(null);

  const clientName = useSelector(
    (state) => state.company.company?.ClientName || "Client"
  );

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Start or reset the timeout whenever showInput is true
  const startResetTimeout = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setShowInput(false);
      setBlur(false);
    }, 10000); // 5 seconds
  };

  const handleClick = () => {
    setBlur(true);
    setShowInput(true);
    startResetTimeout();
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    clearTimeout(timeoutRef.current);
    router.push("/"); // redirect on unlock
  };

  const handleLogout = () => {
    clearTimeout(timeoutRef.current);
    // Add your logout logic here
    router.push("/logout");
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div
      onClick={handleClick}
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-gray-950 text-white cursor-pointer"
    >
      {/* Darker Background with subtle pattern */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-950 to-black"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div> */}

      {/* Main info */}
      <AnimatePresence>
        {!showInput && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: blur ? 0.3 : 1 }}
            exit={{ opacity: 0 }}
            className="z-10 flex flex-col items-center justify-center space-y-6 sm:space-y-8 px-4 w-full max-w-3xl"
          >
            {/* Product Name - Hero */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center space-y-2 sm:space-y-3"
            >
              <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-br from-white via-gray-200 to-gray-400 bg-clip-text text-transparent tracking-tight leading-tight px-4">
                Made Simplified
              </h2>
              <div className="h-1 w-16 sm:w-24 mx-auto bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full" />
            </motion.div>

            {/* Client Name */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="px-4 py-2 sm:px-6 sm:py-3 text-xl sm:text-2xl md:text-3xl font-semibold border-white/20 bg-white/5 backdrop-blur-sm"
              >
                {clientName}
              </Badge>
            </motion.div>

            {/* Time and Date */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="space-y-3 w-full max-w-md px-4"
            >
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 shadow-2xl">
                <CardContent className="p-4 sm:p-6 space-y-2">
                  <div className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-center tabular-nums">
                    {time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="text-sm sm:text-base md:text-lg text-gray-400 text-center font-medium">
                    {time.toLocaleDateString([], {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Unlock Prompt */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: "easeInOut",
              }}
              className="pt-2 sm:pt-4"
            >
              <div className="flex items-center gap-2 text-gray-500">
                <Lock className="w-4 h-4" />
                <p className="text-sm font-medium">Click anywhere to unlock</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PIN input */}
      {showInput && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="z-20 w-full max-w-[95vw] sm:max-w-md px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="w-full bg-gray-900/90 backdrop-blur-xl border-white/10 shadow-2xl">
            <CardHeader className="space-y-3 pb-4 sm:pb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center border border-white/10 shadow-lg"
              >
                <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-300" />
              </motion.div>
              <CardTitle className="text-center text-xl sm:text-2xl font-bold">
                Enter PIN
              </CardTitle>
              <CardDescription className="text-center text-sm sm:text-base text-gray-400">
                Enter your 6-digit PIN to unlock
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 pb-6 sm:pb-8">
              <form onSubmit={handleUnlock} className="space-y-4 sm:space-y-6">
                <FieldGroup>
                  <Field>
                    <InputOTP maxLength={6} id="pin" required>
                      <InputOTPGroup className="gap-1.5 sm:gap-2 md:gap-3 justify-center w-full">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className="w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-14 text-xl sm:text-2xl font-bold rounded-lg sm:rounded-xl border-2 border-white/20 bg-gray-800/50 backdrop-blur-sm transition-all duration-200 hover:border-indigo-400/50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 focus:bg-gray-800/70"
                            style={{
                              WebkitTextSecurity: "disc",
                              textSecurity: "disc",
                            }}
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </Field>

                  <div className="space-y-3 mt-6 sm:mt-8">
                    <Button
                      type="submit"
                      className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold  transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Unlock
                    </Button>

                    <Separator className="bg-white/10" />

                    <div className="text-center text-xs sm:text-sm text-gray-500">
                      Forgot your PIN?{" "}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="text-indigo-400 font-medium hover:text-indigo-300 transition-all duration-200 hover:underline inline-flex items-center gap-1"
                      >
                        Logout <LogOut className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </FieldGroup>
              </form>

              {/* Alternative unlock options */}
              <div className="pt-3 sm:pt-4 border-t border-white/5">
                <p className="text-xs text-center text-gray-600 mb-2 sm:mb-3">
                  Alternative unlock methods
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  {/* <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto bg-gray-800/50 border-white/10 hover:bg-gray-800/70 hover:border-white/20 text-gray-300 text-xs sm:text-sm"
                  >
                    <Fingerprint className="w-4 h-4 mr-2" />
                    Biometric
                  </Button> */}
                  <Button
                    variant="outline"
                    size="sm"
                    // className="w-full sm:w-auto bg-gray-800/50 border-white/10 hover:bg-gray-800/70 hover:border-white/20 text-gray-300 text-xs sm:text-sm"
                  >
                    <KeyRound className="w-4 h-4 mr-2" />
                    Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default LockScreen;
