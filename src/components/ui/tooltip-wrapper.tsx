
import React from "react";
import { TooltipProvider } from "@radix-ui/react-tooltip";

export const SafeTooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <TooltipProvider>{children}</TooltipProvider>;
};
