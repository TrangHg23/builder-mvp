import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const typographyVariants = cva("text-foreground transition-colors", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      ul: "my-6 ml-6 list-disc [&>li]:mt-2",
      inlineCode: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
      // UI specific for Builder
      label: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80",
      panelTitle: "text-xs font-bold tracking-tight uppercase text-foreground/90",
      propLabel: "text-[12px] font-medium text-muted-foreground",
      propValue: "text-[12px] font-mono text-foreground font-medium",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    variant: "p",
    align: "left",
  },
});

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div" | "label";
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, align, as, ...props }, ref) => {
    // Map variants to appropriate HTML tags
    const variantTagMap: Record<string, string> = {
      h1: "h1",
      h2: "h2",
      h3: "h3",
      h4: "h4",
      blockquote: "blockquote",
      ul: "ul",
      inlineCode: "code",
    };

    const Component = (as || (variant && variantTagMap[variant]) || "p") as any;

    return (
      <Component
        className={cn(typographyVariants({ variant, align, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Typography.displayName = "Typography";

export { Typography, typographyVariants };
