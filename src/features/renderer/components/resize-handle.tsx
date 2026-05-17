"use client";

import * as React from "react";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/utils/cn";
import { NodeId } from "@/features/editor/types/schema";

interface ResizeHandleProps {
  nodeId: NodeId;
  direction: "tl" | "tr" | "bl" | "br" | "l" | "r";
}

const POSITION_CLASSES = {
  tl: "-top-1.5 -left-1.5 cursor-nwse-resize",
  tr: "-top-1.5 -right-1.5 cursor-nesw-resize",
  bl: "-bottom-1.5 -left-1.5 cursor-nesw-resize",
  br: "-bottom-1.5 -right-1.5 cursor-nwse-resize",
  l: "top-1/2 -translate-y-1/2 -left-1.5 cursor-ew-resize",
  r: "top-1/2 -translate-y-1/2 -right-1.5 cursor-ew-resize",
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
        "absolute size-3 bg-background border-2 border-primary rounded-sm z-50 hover:bg-primary transition-all flex items-center justify-center group",
        POSITION_CLASSES[direction],
        isDragging && "bg-primary scale-125"
      )}
    >
      {(direction === "l" || direction === "r") && (
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-0 h-0 border-y-[3px] border-y-transparent border-r-[4px] border-r-primary group-hover:border-r-white" />
          <div className="w-0 h-0 border-y-[3px] border-y-transparent border-l-[4px] border-l-primary group-hover:border-l-white" />
        </div>
      )}
    </div>
  );
};
