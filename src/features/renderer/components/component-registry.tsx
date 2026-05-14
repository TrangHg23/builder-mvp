import * as React from "react";

export type ControlType = "text" | "number" | "color" | "select" | "switch";

export interface ControlDefinition {
  label: string;
  propName: string;
  type: ControlType;
  options?: string[];
  isStyle?: boolean;
}

export interface ControlGroup {
  title: string;
  controls: ControlDefinition[];
}

export interface InspectorTabs {
  design: ControlGroup[];
  events?: ControlGroup[];
  effects?: ControlGroup[];
}

export interface NodeDefinition<TProps = any> {
  type: string;
  label: string;
  defaultProps: TProps;
  defaultStyles: React.CSSProperties;
  renderer: React.ComponentType<TProps & { style?: React.CSSProperties; children?: React.ReactNode }>;
  icon?: React.ReactNode;
  inspectorTabs: InspectorTabs;
}

// RENDERERS

// Heading Renderer
const HeadingRenderer: React.FC<{
  text: string;
  level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  style?: React.CSSProperties;
}> = ({ text, level = "h2", style, ...props }) => {
  const Tag = level;
  return (
    <Tag style={style} {...props}>
      {text}
    </Tag>
  );
};

// 2. Box/Container Renderer
const BoxRenderer: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({ 
  children, 
  style, 
  ...props 
}) => (
  <div style={style} {...props}>
    {children}
  </div>
);

// 3. Text Renderer
const TextRenderer: React.FC<{
  content: string;
  style?: React.CSSProperties;
}> = ({ content, style, ...props }) => (
  <span style={style} {...props}>
    {content}
  </span>
);

// Registry
export const componentRegistry: Record<string, NodeDefinition> = {
  container: {
    type: "container",
    label: "Container",
    defaultProps: {},
    defaultStyles: {
      padding: "20px",
      minHeight: "100px",
      backgroundColor: "transparent",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      width: "100%",
    },
    renderer: BoxRenderer,
    inspectorTabs: {
      design: [
        {
          title: "Layout",
          controls: [
            { label: "Padding", propName: "padding", type: "text", isStyle: true },
            { label: "Gap", propName: "gap", type: "text", isStyle: true },
          ],
        },
        {
          title: "Appearance",
          controls: [
            { label: "Background", propName: "backgroundColor", type: "color", isStyle: true },
          ],
        },
      ],
    },
  },
  heading: {
    type: "heading",
    label: "Heading",
    defaultProps: {
      text: "Đây là tiêu đề",
      level: "h2",
    },
    defaultStyles: {
      fontSize: "24px",
      fontWeight: "bold",
      margin: "0px",
      color: "inherit",
    },
    renderer: HeadingRenderer,
    inspectorTabs: {
      design: [
        {
          title: "Content",
          controls: [
            { label: "Text", propName: "text", type: "text" },
            { 
              label: "Level", 
              propName: "level", 
              type: "select", 
              options: ["h1", "h2", "h3", "h4", "h5", "h6"] 
            },
          ],
        },
        {
          title: "Typography",
          controls: [
            { label: "Size", propName: "fontSize", type: "text", isStyle: true },
            { label: "Color", propName: "color", type: "color", isStyle: true },
            { label: "Weight", propName: "fontWeight", type: "select", options: ["normal", "bold", "500", "600"], isStyle: true },
          ],
        },
      ],
    },
  },
  text: {
    type: "text",
    label: "Text Block",
    defaultProps: {
      content: "Nhập nội dung văn bản tại đây...",
    },
    defaultStyles: {
      fontSize: "16px",
      color: "inherit",
    },
    renderer: TextRenderer,
    inspectorTabs: {
      design: [
        {
          title: "Content",
          controls: [
            { label: "Text", propName: "content", type: "text" },
          ],
        },
        {
          title: "Typography",
          controls: [
            { label: "Size", propName: "fontSize", type: "text", isStyle: true },
            { label: "Color", propName: "color", type: "color", isStyle: true },
          ],
        },
      ],
    },
  },
};


