import * as React from "react";
import { cn } from "@/utils/cn";

interface SegmentedControlProps {
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    icon: React.ReactNode;
    label?: string;
  }[];
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  value,
  onChange,
  options,
}) => {
  return (
    <div className="flex p-1 bg-muted/40 rounded-md gap-1 w-fit border border-border/20">
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            title={option.label || option.value}
            className={cn(
              "flex items-center justify-center size-7 rounded-sm transition-all duration-200",
              isActive 
                ? "bg-background shadow-sm text-[#3c79d9]" 
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            {option.icon}
          </button>
        );
      })}
    </div>
  );
};
