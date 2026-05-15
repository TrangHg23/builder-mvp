"use client";

import * as React from "react";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/utils/cn";
import { NodeId } from "@/features/editor/types/schema";

interface ResizeHandleProps {
  nodeId: NodeId;
  direction: "tl" | "tr" | "bl" | "br";
}

const POSITION_CLASSES = {
  tl: "-top-1.5 -left-1.5 cursor-nwse-resize",
  tr: "-top-1.5 -right-1.5 cursor-nesw-resize",
  bl: "-bottom-1.5 -left-1.5 cursor-nesw-resize",
  br: "-bottom-1.5 -right-1.5 cursor-nwse-resize",
};

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ nodeId, direction }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `resize-${direction}-${nodeId}`,
    data: {
      type: "resize-handle",
      nodeId,
      direction,
    }
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "absolute size-3 bg-background border-2 border-primary rounded-sm z-50 hover:bg-primary transition-colors",
        POSITION_CLASSES[direction],
        isDragging && "bg-primary scale-125"
      )}
    />
  );
};
