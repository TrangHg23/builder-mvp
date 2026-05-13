import * as React from "react";

export interface ComponentDefinition {
  type: string;
  component: React.ComponentType<any>;
  label: string;
  icon?: React.ReactNode;
  defaultProps?: Record<string, any>;
}

const Placeholder = ({ children, ...props }: any) => (
  <div {...props} className="p-4 border border-dashed border-muted-foreground/30 rounded min-h-[50px]">
    {children}
  </div>
);

const Box = ({ children, className, ...props }: any) => (
  <div className={className} {...props}>
    {children}
  </div>
);

const Text = ({ content, className, ...props }: any) => (
  <span className={className} {...props}>
    {content || "Text Block"}
  </span>
);

export const componentRegistry: Record<string, ComponentDefinition> = {
  container: {
    type: "container",
    component: Box,
    label: "Container",
    defaultProps: { className: "p-4 min-h-[100px] w-full" },
  },
  text: {
    type: "text",
    component: Text,
    label: "Text",
    defaultProps: { content: "New Text Block", className: "text-base" },
  },
  placeholder: {
    type: "placeholder",
    component: Placeholder,
    label: "Placeholder",
  },
};
