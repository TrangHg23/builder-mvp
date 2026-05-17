"use client";

import * as React from "react";
import { Renderer } from "@/features/renderer/components/renderer";
import { useEditorStore } from "@/features/editor/stores/use-editor-store";

export const Canvas: React.FC = () => {
  const { rootNodeId, selectNode } = useEditorStore();

  return (
    <div 
      className="min-h-full p-8 flex items-start justify-center"
      onClick={() => {
        selectNode(null);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }}
    >
      <div 
        className="w-full max-w-5xl bg-background shadow-xl min-h-[1000px] rounded-sm ring-1 ring-border relative"
        onClick={(e) => e.stopPropagation()}
      >
        <Renderer nodeId={rootNodeId} />
      </div>
    </div>
  );
};
