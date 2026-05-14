"use client";

import React from "react";
import { Typography } from "@/components/ui/typography"; 
import { cn } from "@/utils/cn";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-[#3c79d9]/20 blur-xl rounded-full" />
        
        <svg 
          width="22" 
          height="22" 
          viewBox="0 0 24 24" 
          fill="none" 
          className="relative drop-shadow-sm transition-transform hover:scale-105 duration-200"
          style={{
            stroke: "url(#logo-gradient)",
            strokeWidth: "2.5",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }}
        >
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3c79d9" />
              <stop offset="100%" stopColor="#6366f1" /> 
            </linearGradient>
          </defs>
          
          {/* Path hình hộp đầy đủ các nét dọc */}
          <path d="M21 16.0001V7.99992C20.9996 7.64917 20.9071 7.30467 20.7315 7.00137C20.556 6.69807 20.3033 6.44519 20 6.26992L13 2.26992C12.696 2.09419 12.3511 2.002 12 2.002C11.6489 2.002 11.304 2.09419 11 2.26992L4 6.26992C3.69671 6.44519 3.44404 6.69807 3.26846 7.00137C3.09289 7.30467 3.00037 7.64917 3 7.99992V16.0001C3.00037 16.3508 3.09289 16.6954 3.26846 16.9987C3.44404 17.302 3.69671 17.5548 4 17.7301L11 21.7301C11.304 21.9058 11.6489 21.998 12 21.998C12.3511 21.998 12.696 21.9058 13 21.7301L20 17.7301C20.3033 17.5548 20.556 17.302 20.7315 16.9987C20.9071 16.6954 20.9996 16.3508 21 16.0001Z"/>
          <path d="M12 22.0001V12.0001L21.36 6.84009"/>
          <path d="M3 6.84009L12 12.0001"/>
        </svg>
      </div>

      {/* Title với Gradient áp dụng panelTitle variant */}
      <div className="flex items-baseline font-extrabold">
        <Typography 
          variant="panelTitle" 
          as="span" 
          className="bg-gradient-to-br from-[#3c79d9] to-[#6366f1] bg-clip-text text-transparent tracking-tight normal-case text-[15px]"
        >
          Builder MVP
        </Typography>
      </div>
    </div>
  );
};