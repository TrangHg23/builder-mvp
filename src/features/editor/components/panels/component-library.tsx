"use client";

import * as React from "react";
import { Typography } from "@/components/ui/typography";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Type, 
  Image as ImageIcon, 
  Star,  
  MousePointer2, 
  Box,
  Heading,
  LayoutGrid,
  Layers
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils/cn";
import { useDraggable } from "@dnd-kit/core";

interface LibraryItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const LibraryItem = ({ icon, label, isActive, onClick, componentType }: LibraryItemProps & { componentType: string }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: label,
    data: {
      type: "library-item",
      componentType,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <button 
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      style={style}
      className={cn(
        "flex w-full items-center gap-3 px-2 py-1 border rounded-full transition-all shadow-sm group cursor-pointer touch-none",
        isActive 
          ? "border-primary bg-primary/10 shadow-primary/20" 
          : "bg-background border-border/60 hover:border-primary hover:bg-primary/5",
        isDragging && "opacity-50 cursor-grabbing"
      )}
    >
      <div className={cn(
        "size-6 rounded-full flex items-center justify-center transition-colors border",
        isActive
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-muted/50 text-muted-foreground group-hover:bg-background border-transparent group-hover:border-primary/30"
      )}>
        {icon}
      </div>
      <Typography 
        variant="small" 
        className={cn(
          "font-medium transition-colors",
          isActive ? "text-primary" : "text-foreground/80 group-hover:text-primary"
        )}
      >
        {label}
      </Typography>
    </button>
  );
};

export const ComponentLibrary: React.FC = () => {
  const [activeType, setActiveType] = React.useState<string | null>(null);

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Top Navigation Tabs */}
      <Tabs defaultValue="library" className="w-full">
        <TabsList className="w-full h-12 rounded-none border-b bg-transparent p-0">
          <TabsTrigger 
            value="library" 
            className="flex-1 h-full rounded-none border-b-1 border-transparent data-[state=active]:border-primary data-[state=active]:bg-muted/30 gap-2"
          >
            <LayoutGrid size={16} className="text-primary"/>
            <span className="text-sm font-bold text-primary">Library</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Sub Navigation Tabs */}
      <div className="flex border-b">
        <button className="flex-1 py-3 flex flex-col items-center gap-1 border-b-1 border-primary bg-muted/20">
          <Layers size={20} className="text-primary" />
          <span className="text-[10px] font-bold text-primary">Elements</span>
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <section>
            <Typography variant="label" className="mb-4 block text-muted-foreground/60 font-bold tracking-wider">
              BASIC ELEMENTS
            </Typography>
            <div className="space-y-2">
              <LibraryItem 
                icon={<Heading size={14} />} 
                label="Heading" 
                isActive={activeType === "heading"}
                onClick={() => setActiveType("heading")}
                componentType="heading"
              />
              <LibraryItem 
                icon={<Type size={14} />} 
                label="Text Block" 
                isActive={activeType === "text"}
                onClick={() => setActiveType("text")}
                componentType="text"
              />
              <LibraryItem 
                icon={<ImageIcon size={14} />} 
                label="Image" 
                isActive={activeType === "image"}
                onClick={() => setActiveType("image")}
                componentType="image"
              />
              <LibraryItem 
                icon={<Star size={14} />} 
                label="Icon" 
                isActive={activeType === "icon"}
                onClick={() => setActiveType("icon")}
                componentType="icon"
              />
              <LibraryItem 
                icon={<MousePointer2 size={14} />} 
                label="Button" 
                isActive={activeType === "button"}
                onClick={() => setActiveType("button")}
                componentType="button"
              />
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};

