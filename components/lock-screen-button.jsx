"use client";

import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LockScreenButton() {
  const router = useRouter();

  const handleLockScreen = () => {
    router.push("/lock");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleLockScreen}
      title="Lock Screen"
      className="hover:bg-accent text-foreground"
    >
      <Lock className="h-5 w-5" />
      <span className="sr-only">Lock Screen</span>
    </Button>
  );
}
