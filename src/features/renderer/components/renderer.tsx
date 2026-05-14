"use client";

import * as React from "react";
import { useEditorStore } from "@/features/editor/stores/use-editor-store";
import { componentRegistry } from "./component-registry";
import { NodeId } from "@/features/editor/types/schema";

interface RendererProps {
  nodeId: NodeId;
}

export const Renderer: React.FC<RendererProps> = ({ nodeId }) => {
  const node = useEditorStore((state) => state.nodes[nodeId]);
  
  if (!node) {
    console.warn(`Node with id "${nodeId}" not found in store.`);
    return null;
  }

  const definition = componentRegistry[node.type] || componentRegistry.container;
  const Component = definition.renderer;

  return (
    <Component {...node.props} style={node.styles} data-node-id={node.id}>
      {node.children.map((childId) => (
        <Renderer key={childId} nodeId={childId} />
      ))}
    </Component>
  );
};
