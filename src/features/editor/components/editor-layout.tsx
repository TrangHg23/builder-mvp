"use client";

import * as React from "react";
import { Typography } from "@/components/ui/typography";
import { ComponentLibrary } from "./panels/component-library";
import { Canvas } from "./panels/canvas";
import { Inspector } from "./panels/inspector";
import { useEditorStore } from "../stores/use-editor-store";
import { Edit2, Eye, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export const EditorLayout: React.FC = () => {
  const { mode, setMode, nodes } = useEditorStore();

  const handleSave = () => {
    const dataStr = JSON.stringify(nodes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'site-schema.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background" data-mode={mode}>
      {/* Header */}
      <header className="h-14 border-b flex items-center px-4 bg-card shrink-0 shadow-sm z-50">
        <div className="w-1/4 flex items-center gap-4">
          <Typography variant="panelTitle">My Builder MVP</Typography>
        </div>
          
        <div className="flex-1 flex justify-center">
          <div className="flex items-center bg-muted/50 rounded-lg p-1 gap-1">
            <button
              onClick={() => setMode("edit")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                mode === "edit" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Edit2 size={14} />
              Edit
            </button>
            <button
              onClick={() => setMode("preview")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                mode === "preview" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Eye size={14} />
              Preview
            </button>
          </div>
        </div>

        <div className="w-1/4 flex items-center justify-end gap-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleSave}
            className="bg-[#3c79d9] hover:bg-[#3c79d9]/90 text-white font-medium gap-2 px-4"
          >
            <Save size={16} />
            Save
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Panel */}
        <aside className={cn(
          "w-72 border-r bg-card shrink-0 flex flex-col overflow-hidden transition-all duration-300",
          mode === "preview" && "-ml-72 opacity-0"
        )}>
          <ComponentLibrary />
        </aside>

        {/* Center Panel */}
        <main className="flex-1 bg-muted/20 relative overflow-auto">
          <Canvas />
        </main>

        {/* Right Panel */}
        <aside className={cn(
          "w-72 border-l bg-card shrink-0 flex flex-col overflow-hidden transition-all duration-300",
          mode === "preview" && "-mr-72 opacity-0"
        )}>
          <Inspector />
        </aside>
      </div>
    </div>
  );
};
