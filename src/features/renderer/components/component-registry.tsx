import * as React from "react";

export type ControlType = "text" | "number" | "color" | "select" | "switch";

export interface ControlDefinition {
  label: string;
  propName: string;
  type: ControlType;
  options?: string[]; 
}

export interface ComponentDefinition {
  type: string;
  component: React.ComponentType<any>;
  label: string;
  icon?: React.ReactNode;
  defaultProps?: Record<string, any>;
  controls?: ControlDefinition[];
}

const Placeholder = ({ children, ...props }: any) => (
  <div {...props} className="p-4 border border-dashed border-muted-foreground/30 rounded min-h-[50px]">
    {children}
  </div>
);

const Box = ({ children, className, style, ...props }: any) => (
  <div className={className} style={style} {...props}>
    {children}
  </div>
);

const Text = ({ content, className, style, ...props }: any) => (
  <span className={className} style={style} {...props}>
    {content || "Text Block"}
  </span>
);

export const componentRegistry: Record<string, ComponentDefinition> = {
  container: {
    type: "container",
    component: Box,
    label: "Container",
    defaultProps: { 
      props: {},
      styles: { padding: "1rem", minHeight: "100px", width: "100%" }
    },
    controls: [
      { label: "Background Color", propName: "backgroundColor", type: "color" },
      { label: "Padding", propName: "padding", type: "text" },
    ],
  },
  text: {
    type: "text",
    component: Text,
    label: "Text",
    defaultProps: { 
      props: { content: "New Text Block" },
      styles: { fontSize: "16px", color: "inherit" }
    },
    controls: [
      { label: "Content", propName: "content", type: "text" },
      { label: "Font Size", propName: "fontSize", type: "text" },
      { label: "Text Color", propName: "color", type: "color" },
    ],
  },
  placeholder: {
    type: "placeholder",
    component: Placeholder,
    label: "Placeholder",
  },
};


