import React from "react";
import { EkinProvider } from "@/context/EkinContext";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function DefaultProviders({ children }: { children: React.ReactNode }) {
  return (
    <EkinProvider>
      <TooltipProvider delayDuration={200}>
        <Toaster position="top-right" richColors />
        {children}
      </TooltipProvider>
    </EkinProvider>
  );
}
