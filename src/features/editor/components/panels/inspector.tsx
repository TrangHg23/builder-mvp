"use client";

import * as React from "react";
import { Typography } from "@/components/ui/typography";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/features/editor/stores/use-editor-store";

export const Inspector: React.FC = () => {
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const node = useEditorStore((state) => (selectedNodeId ? state.nodes[selectedNodeId] : null));

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Typography variant="panelTitle">Inspector</Typography>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          {node ? (
            <div className="space-y-4">
              <Typography variant="small" className="font-bold">
                Type: <span className="font-mono font-normal">{node.type}</span>
              </Typography>
              <Typography variant="small" className="font-bold">
                ID: <span className="font-mono font-normal text-[10px]">{node.id}</span>
              </Typography>
              
              <div className="pt-4 border-t">
                <Typography variant="label" className="mb-2 block">Properties</Typography>
                {/* Prop editors will go here */}
                <Typography variant="muted" className="italic">
                  Select a property to edit.
                </Typography>
              </div>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-center p-4">
              <Typography variant="muted">
                Select an element on the canvas to edit its properties.
              </Typography>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
