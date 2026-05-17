import * as React from "react";

export type ControlType = "text" | "number" | "color" | "select" | "switch" | "toggle-group";

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
  level: string;
  style?: React.CSSProperties;
}> = ({ text, level = "h2", style, ...props }) => {
  const Tag = (level.toLowerCase() || "h2") as any;
  
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

// 4. Image Renderer
const ImageRenderer: React.FC<{
  src: string;
  alt: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ src, alt, style, children, ...props }) => (
  <img 
    src={src || "https://placehold.co/600x400?text=Image"} 
    alt={alt} 
    style={{ ...style, maxWidth: "100%", height: "auto" }} 
    {...props} 
  />
);

// 5. Button Renderer
const ButtonRenderer: React.FC<{
  text: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ text, style, children, ...props }) => (
  <button style={style} {...props}>
    {text}
    {children}
  </button>
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
      text: "Heading",
      level: "H1",
    },
    defaultStyles: {
      width: "200px",
      height: "51px",
      fontSize: "42px",
      fontWeight: "800",
      fontFamily: "Montserrat",
      lineHeight: "1.2",
      letterSpacing: "-0.5px",
      textAlign: "left",
      color: "#000000",
      margin: "0px",
      display: "flex",
      alignItems: "center",
    },
    renderer: HeadingRenderer,
    inspectorTabs: {
      design: [
        {
          title: "Size",
          controls: [
            { label: "Width", propName: "width", type: "text", isStyle: true },
            { label: "Height", propName: "height", type: "text", isStyle: true },
          ],
        },
        {
          title: "Content",
          controls: [
            { 
              label: "", 
              propName: "level", 
              type: "select", 
              options: ["H1", "H2", "H3", "H4", "H5", "H6"] 
            },
          ],
        },
        {
          title: "Typography",
          controls: [
            { label: "Font Family", propName: "fontFamily", type: "select", options: ["Inter", "Roboto", "Montserrat", "Playfair Display", "Merriweather", "JetBrains Mono"], isStyle: true },
            { label: "Weight", propName: "fontWeight", type: "select", options: ["Light", "Regular", "Medium", "Semi Bold", "Bold", "Extra Bold"], isStyle: true },
            { label: "Size", propName: "fontSize", type: "text", isStyle: true },
            { label: "Line Height", propName: "lineHeight", type: "text", isStyle: true },
            { label: "Letter Spacing", propName: "letterSpacing", type: "text", isStyle: true },
            { label: "Alignment", propName: "textAlign", type: "toggle-group", options: ["left", "center", "right", "justify"], isStyle: true },
          ],
        },
      ],
    },
  },
  text: {
    type: "text",
    label: "Text Block",
    defaultProps: {
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ultrices non orci nec eleifend. Sed scelerisque lobortis neque eget feugiat. Curabitur ullamcorper ex at porttitor mollis. Curabitur varius lorem nisl, non egestas leo feugiat at. Curabitur volutpat sagittis arcu, ut blandit velit sagittis vel. Vivamus erat mauris, mattis a neque vel, pretium varius ipsum. Phasellus non mauris in dolor luctus suscipit vel ac massa. Sed fringilla lorem sed metus bibendum faucibus.",
    },
    defaultStyles: {
      fontSize: "16px",
      fontWeight: "400",
      fontFamily: "Inter",
      lineHeight: "1.5",
      textAlign: "left",
      color: "inherit",
    },
    renderer: TextRenderer,
    inspectorTabs: {
      design: [
        {
          title: "Typography",
          controls: [
            { label: "Font Family", propName: "fontFamily", type: "select", options: ["Inter", "Roboto", "Montserrat", "Playfair Display", "Merriweather", "JetBrains Mono"], isStyle: true },
            { label: "Weight", propName: "fontWeight", type: "select", options: ["Light", "Regular", "Medium", "Semi Bold", "Bold", "Extra Bold"], isStyle: true },
            { label: "Size", propName: "fontSize", type: "text", isStyle: true },
            { label: "Line Height", propName: "lineHeight", type: "text", isStyle: true },
            { label: "Letter Spacing", propName: "letterSpacing", type: "text", isStyle: true },
            { label: "Alignment", propName: "textAlign", type: "toggle-group", options: ["left", "center", "right", "justify"], isStyle: true },
            { label: "Color", propName: "color", type: "color", isStyle: true },
          ],
        },
      ],
    },
  },
  image: {
    type: "image",
    label: "Image",
    defaultProps: {
      src: "https://placehold.co/600x400?text=Image",
      alt: "Placeholder image",
    },
    defaultStyles: {
      borderRadius: "8px",
      width: "100%",
    },
    renderer: ImageRenderer,
    inspectorTabs: {
      design: [
        {
          title: "Source",
          controls: [
            { label: "Image URL", propName: "src", type: "text" },
            { label: "Alt Text", propName: "alt", type: "text" },
          ],
        },
        {
          title: "Size & Style",
          controls: [
            { label: "Width", propName: "width", type: "text", isStyle: true },
            { label: "Border Radius", propName: "borderRadius", type: "text", isStyle: true },
          ],
        },
      ],
    },
  },
  button: {
    type: "button",
    label: "Button",
    defaultProps: {
      text: "Click me",
    },
    defaultStyles: {
      padding: "10px 20px",
      backgroundColor: "#3c79d9",
      color: "white",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      fontFamily: "Inter",
      textAlign: "center",
    },
    renderer: ButtonRenderer,
    inspectorTabs: {
      design: [
        {
          title: "Appearance",
          controls: [
            { label: "Background", propName: "backgroundColor", type: "color", isStyle: true },
            { label: "Text Color", propName: "color", type: "color", isStyle: true },
            { label: "Padding", propName: "padding", type: "text", isStyle: true },
            { label: "Radius", propName: "borderRadius", type: "text", isStyle: true },
          ],
        },
        {
          title: "Typography",
          controls: [
            { label: "Font Family", propName: "fontFamily", type: "select", options: ["Inter", "Roboto", "Montserrat", "Playfair Display", "Merriweather", "JetBrains Mono"], isStyle: true },
            { label: "Weight", propName: "fontWeight", type: "select", options: ["300", "400", "500", "600", "700", "800"], isStyle: true },
            { label: "Size", propName: "fontSize", type: "text", isStyle: true },
            { label: "Alignment", propName: "textAlign", type: "toggle-group", options: ["left", "center", "right", "justify"], isStyle: true },
          ],
        },
      ],
    },
  },
};


