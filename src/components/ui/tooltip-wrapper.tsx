
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

export const SafeTooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <TooltipProvider>{children}</TooltipProvider>;
};
