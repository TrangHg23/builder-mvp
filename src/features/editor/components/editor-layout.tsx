"use client";

import * as React from "react";
import { ComponentLibrary } from "./panels/component-library";
import { Canvas } from "./panels/canvas";
import { Inspector } from "./panels/inspector";
import { useEditorStore } from "../stores/use-editor-store";
import { Edit2, Eye, Save, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { 
  DndContext, 
  DragOverlay,
} from "@dnd-kit/core";
import { Logo } from "@/components/header/logo";
import { useEditorDnd } from "../hooks/use-editor-dnd";
import { useEditorShortcuts } from "../hooks/use-editor-shortcuts";
import { useEditorActions } from "../hooks/use-editor-actions";

export const EditorLayout: React.FC = () => {
  const { mode, setMode } = useEditorStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  useEditorShortcuts();
  const { handleSave } = useEditorActions();
  const {
    sensors,
    active,
    activeId,
    isOverDroppable,
    handleDragStart,
    handleDragOver,
    handleDragMove,
    handleDragEnd,
  } = useEditorDnd();

  if (!mounted) return <div className="h-screen bg-background" />;

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen overflow-hidden bg-background" data-mode={mode}>
      {/* Header */}
      <header className="h-14 border-b flex items-center px-4 bg-card shrink-0 shadow-sm z-50">
        <div className="w-1/4 flex items-center gap-2 px-2 select-none">
          <Logo/>
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
      <DragOverlay dropAnimation={null}>
        {active && active.data.current?.type === "library-item" ? (
          <div className={cn(
            "px-4 py-2 rounded-md shadow-lg transition-all duration-200 border flex items-center gap-2",
            isOverDroppable 
              ? "bg-primary text-primary-foreground border-primary-foreground/20 cursor-grabbing" 
              : "bg-destructive/20 text-destructive border-destructive/50 cursor-no-drop backdrop-blur-sm"
          )}>
            {!isOverDroppable && <Ban size={14} />}
            <span className="font-medium text-sm capitalize">
              {active.data.current.componentType}
            </span>
          </div>
        ) : null}
      </DragOverlay>
      </div>
    </DndContext>
  );
};
