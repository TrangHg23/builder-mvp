"use client";

import * as React from "react";
import { Typography } from "@/components/ui/typography";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/features/editor/stores/use-editor-store";
import { componentRegistry } from "@/features/renderer/components/component-registry";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import { cn } from "@/utils/cn";

const WEIGHT_MAP: Record<string, string> = {
  "Light": "300",
  "Regular": "400",
  "Medium": "500",
  "Semi Bold": "600",
  "Bold": "700",
  "Extra Bold": "800",
};

const REVERSE_WEIGHT_MAP: Record<string, string> = Object.entries(WEIGHT_MAP).reduce(
  (acc, [label, value]) => ({ ...acc, [value]: label }),
  {}
);

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
    let finalValue = value;
    
    // Map weight label to number if needed
    if (propName === "fontWeight" && WEIGHT_MAP[value]) {
      finalValue = WEIGHT_MAP[value];
    }

    if (isStyle) {
      updateNodeStyles(node.id, { [propName]: finalValue });
    } else {
      updateNodeProps(node.id, { [propName]: finalValue });
      
      if (node.type === "heading" && propName === "level") {
        const presets: Record<string, any> = {
          H1: { fontSize: "42px", fontWeight: "800", lineHeight: "1.1", letterSpacing: "-0.8px", height: "auto" },
          H2: { fontSize: "32px", fontWeight: "800", lineHeight: "1.2", letterSpacing: "-0.5px", height: "auto" },
          H3: { fontSize: "24px", fontWeight: "600", lineHeight: "1.3", letterSpacing: "0px", height: "auto" },
          H4: { fontSize: "20px", fontWeight: "600", lineHeight: "1.4", letterSpacing: "0px", height: "auto" },
          H5: { fontSize: "18px", fontWeight: "500", lineHeight: "1.4", letterSpacing: "0px", height: "auto" },
          H6: { fontSize: "16px", fontWeight: "500", lineHeight: "1.5", letterSpacing: "0px", height: "auto" },
        };
        
        const newStyles = presets[value as string] || presets.H2;
        updateNodeStyles(node.id, newStyles);

        requestAnimationFrame(() => {
          const el = document.querySelector(`[data-node-id="${node.id}"]`);
          if (el) {
            const rect = el.getBoundingClientRect();
            updateNodeStyles(node.id, { 
              height: `${rect.height.toFixed(2)}px` 
            });
          }
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-border/50">
      {/* Brand-linked Header */}
      <div className="relative p-4 border-b border-border/50 bg-muted/10">
        {/* Logo-synced Gradient Line */}
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-[#3c79d9] to-[#6366f1]" />
        
        <div className="flex items-center justify-between">
          <Typography 
            variant="panelTitle" 
            className="text-[14px] font-extrabold tracking-tight bg-gradient-to-br from-[#3c79d9] to-[#6366f1] bg-clip-text text-transparent normal-case"
          >
            {definition?.label || node.type}
          </Typography>
          
          <div className="size-1.5 rounded-full bg-[#3c79d9] shadow-[0_0_8px_rgba(60,121,217,0.5)]" />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-7">
          {definition?.inspectorTabs.design.map((group) => (
            <div key={group.title} className="space-y-3.5">
              <div className="flex items-center gap-2.5">
                <Typography variant="label" className="text-[12px] text-foreground/70 font-extrabold uppercase tracking-[0.12em]">
                  {group.title}
                </Typography>
                <div className="h-[1px] flex-1 bg-border/40" />
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                {group.controls.map((control) => {
                  const value = control.isStyle 
                    ? (node.styles[control.propName] as string) 
                    : (node.props[control.propName] as string);

                  const isFullWidth = control.propName === "fontFamily" || control.propName === "backgroundColor" || control.propName === "color";

                  return (
                    <div 
                      key={control.propName} 
                      className={cn(
                        "flex flex-col gap-1",
                        isFullWidth ? "col-span-2" : "col-span-1"
                      )}
                    >
                      {control.label && (
                        <Typography variant="muted" className="text-[12px] font-semibold text-foreground/50 capitalize">
                          {control.label}
                        </Typography>
                      )}
                      
                      {control.type === "text" && (
                        <Input 
                          value={value || ""} 
                          onChange={(e) => handlePropChange(control.propName, e.target.value, control.isStyle)}
                          className="h-7 text-[11px] bg-muted/30 border-border/40 focus:border-indigo-500/40 focus:ring-0 transition-colors px-2 rounded-sm"
                        />
                      )}

                      {control.type === "toggle-group" && (
                        <div className="col-span-2 mt-0.5">
                          <SegmentedControl 
                            value={value} 
                            onChange={(v) => handlePropChange(control.propName, v, control.isStyle)}
                            options={[
                              { value: "left", icon: <AlignLeft size={14} />, label: "Left" },
                              { value: "center", icon: <AlignCenter size={14} />, label: "Center" },
                              { value: "right", icon: <AlignRight size={14} />, label: "Right" },
                              { value: "justify", icon: <AlignJustify size={14} />, label: "Justify" },
                            ]}
                          />
                        </div>
                      )}

                      {control.type === "color" && (
                        <div className="flex items-center gap-2 bg-muted/30 rounded-sm p-1 border border-border/40 focus-within:border-indigo-500/40 transition-colors">
                          <div 
                            className="size-4 rounded-sm shadow-sm shrink-0 border border-black/20" 
                            style={{ backgroundColor: value }} 
                          />
                          <Input 
                            type="text"
                            value={value || ""} 
                            onChange={(e) => handlePropChange(control.propName, e.target.value, control.isStyle)}
                            className="h-4 text-[10px] bg-transparent border-none shadow-none focus-visible:ring-0 p-0 font-mono text-foreground/70"
                          />
                        </div>
                      )}

                      {control.type === "select" && (
                        <Select 
                          value={control.propName === "fontWeight" ? (REVERSE_WEIGHT_MAP[value] || value) : value} 
                          onValueChange={(v) => handlePropChange(control.propName, v, control.isStyle)}
                        >
                          <SelectTrigger className="h-8 text-[13px] bg-muted/30 border-border/40 focus:border-[#3c79d9]/40 focus:ring-0 transition-colors px-2 rounded-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border/50 shadow-2xl p-1 min-w-[140px]">
                            {control.options?.map((opt) => (
                              <SelectItem 
                                key={opt} 
                                value={opt} 
                                className="text-[13px] py-2 rounded-sm focus:bg-[#3c79d9]/10 focus:text-[#3c79d9] transition-all cursor-pointer font-normal"
                              >
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
