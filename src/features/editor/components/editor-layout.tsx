"use client";

import * as React from "react";
import { ComponentLibrary } from "./panels/component-library";
import { Canvas } from "./panels/canvas";
import { Inspector } from "./panels/inspector";
import { useEditorStore } from "../stores/use-editor-store";
import { Edit2, Eye, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { 
  DndContext, 
  DragEndEvent, 
  MouseSensor, 
  TouchSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragOverEvent
} from "@dnd-kit/core";
import { nanoid } from "nanoid";
import { componentRegistry } from "@/features/renderer/components/component-registry";
import { Ban } from "lucide-react";
import { Logo } from "@/components/header/logo";

export const EditorLayout: React.FC = () => {
  const { mode, setMode, nodes, addNode, selectNode, updateNodePosition, removeNode, selectedNodeId } = useEditorStore();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [isOverDroppable, setIsOverDroppable] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea/editable field
      const isTyping = 
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable;

      if (isTyping) return;

      if ((e.key === "Delete" || e.key === "Backspace") && selectedNodeId) {
        removeNode(selectedNodeId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodeId, removeNode]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsOverDroppable(false);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setIsOverDroppable(!!event.over);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setIsOverDroppable(false);

    if (over && active.data.current?.type === "library-item") {
      const componentType = active.data.current.componentType;
      const definition = componentRegistry[componentType];
      
      if (definition) {
        const newNodeId = nanoid();
        
        // Calculate position relative to the 'over' element
        const overRect = over.rect;
        const activeRect = active.rect.current.translated;
        
        let x = 0;
        let y = 0;
        
        if (activeRect && overRect) {
          x = Math.max(0, activeRect.left - overRect.left);
          y = Math.max(0, activeRect.top - overRect.top);
          
          // Clamp to right/bottom edges for new items
          if (activeRect.width && overRect.width) {
            x = Math.min(x, overRect.width - activeRect.width);
          }
          if (activeRect.height && overRect.height) {
            y = Math.min(y, overRect.height - activeRect.height);
          }
        }

        const newNode = {
          id: newNodeId,
          type: componentType,
          props: { ...definition.defaultProps },
          styles: { ...definition.defaultStyles },
          children: [],
          parentId: over.id as string,
          x,
          y,
        };

        addNode(newNode, over.id as string);
        selectNode(newNodeId);
      }
    } else if (over && active.data.current?.type === "canvas-node") {
      const nodeId = active.data.current.nodeId;
      const node = nodes[nodeId];
      const overRect = over.rect;
      const activeRect = active.rect.current.translated;

      if (node && overRect && activeRect) {
        // Calculate new position relative to the drop target
        let newX = activeRect.left - overRect.left;
        let newY = activeRect.top - overRect.top;
        
        // Clamping logic: Prevent moving outside the container
        // We ensure x and y are at least 0
        newX = Math.max(0, newX);
        newY = Math.max(0, newY);
        
        // Optional: Prevent moving past the right/bottom edge 
        // (This requires knowing the active element width/height)
        if (activeRect.width && overRect.width) {
          newX = Math.min(newX, overRect.width - activeRect.width);
        }
        if (activeRect.height && overRect.height) {
          newY = Math.min(newY, overRect.height - activeRect.height);
        }

        updateNodePosition(nodeId, newX, newY);
      }
    }
  };

  const handleSave = () => {
    const dataStr = JSON.stringify(nodes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'site-schema.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (!mounted) return <div className="h-screen bg-background" />;

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
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
        {activeId ? (
          <div className={cn(
            "px-4 py-2 rounded-md shadow-lg transition-all duration-200 border flex items-center gap-2",
            isOverDroppable 
              ? "bg-primary text-primary-foreground border-primary-foreground/20 cursor-grabbing" 
              : "bg-destructive/20 text-destructive border-destructive/50 cursor-no-drop backdrop-blur-sm"
          )}>
            {!isOverDroppable && <Ban size={14} />}
            <span className="font-medium text-sm">{activeId}</span>
          </div>
        ) : null}
      </DragOverlay>
      </div>
    </DndContext>
  );
};
