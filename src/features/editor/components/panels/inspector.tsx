"use client";

import * as React from "react";
import { Typography } from "@/components/ui/typography";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/features/editor/stores/use-editor-store";
import { componentRegistry } from "@/features/renderer/components/component-registry";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export const Inspector: React.FC = () => {
  const { selectedNodeId, nodes, updateNodeProps, updateNodeStyles } = useEditorStore();
  const node = selectedNodeId ? nodes[selectedNodeId] : null;

  if (!node) {
    return (
      <div className="flex flex-col h-full bg-card">
        <div className="p-4 border-b">
          <Typography variant="panelTitle">Inspector</Typography>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Typography variant="muted" className="text-2xl">?</Typography>
          </div>
          <Typography variant="small" className="text-muted-foreground font-medium">
            No element selected
          </Typography>
          <Typography variant="muted" className="mt-1">
            Click on an element in the canvas to edit its properties.
          </Typography>
        </div>
      </div>
    );
  }

  const definition = componentRegistry[node.type];

  const handlePropChange = (propName: string, value: any, isStyle?: boolean) => {
    if (isStyle) {
      updateNodeStyles(node.id, { [propName]: value });
    } else {
      updateNodeProps(node.id, { [propName]: value });
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b flex items-center justify-between bg-muted/30">
        <div className="flex flex-col">
          <Typography variant="panelTitle">{definition?.label || node.type}</Typography>
          <Typography variant="muted" className="text-[10px] font-mono uppercase tracking-tighter opacity-70">
            {node.id.slice(0, 8)}...
          </Typography>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {definition?.inspectorTabs.design.map((group, groupIdx) => (
            <div key={group.title} className="space-y-4">
              <div className="flex items-center gap-2">
                <Typography variant="label" className="text-primary font-bold text-[11px] uppercase tracking-widest">
                  {group.title}
                </Typography>
                <Separator className="flex-1" />
              </div>
              
              <div className="space-y-3">
                {group.controls.map((control) => {
                  const value = control.isStyle 
                    ? (node.styles[control.propName] as string) 
                    : (node.props[control.propName] as string);

                  return (
                    <div key={control.propName} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Typography variant="small" className="text-foreground/70 font-medium">
                          {control.label}
                        </Typography>
                      </div>
                      
                      {control.type === "text" && (
                        <Input 
                          value={value || ""} 
                          onChange={(e) => handlePropChange(control.propName, e.target.value, control.isStyle)}
                          className="h-8 text-xs bg-background/50 focus:bg-background"
                        />
                      )}

                      {control.type === "color" && (
                        <div className="flex gap-2">
                          <div 
                            className="size-8 rounded border shadow-sm shrink-0" 
                            style={{ backgroundColor: value }} 
                          />
                          <Input 
                            type="text"
                            value={value || ""} 
                            onChange={(e) => handlePropChange(control.propName, e.target.value, control.isStyle)}
                            className="h-8 text-xs bg-background/50 font-mono"
                          />
                        </div>
                      )}

                      {control.type === "select" && (
                        <Select 
                          value={value} 
                          onValueChange={(v) => handlePropChange(control.propName, v, control.isStyle)}
                        >
                          <SelectTrigger className="h-8 text-xs bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {control.options?.map((opt) => (
                              <SelectItem key={opt} value={opt} className="text-xs">
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
