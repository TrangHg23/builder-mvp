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
        "flex w-full items-center gap-3 px-2.5 py-1.5 border rounded-full transition-all group cursor-pointer touch-none relative overflow-hidden",
        isActive 
          ? "border-transparent shadow-[0_4px_12px_rgba(60,121,217,0.15)]" 
          : "bg-background border-border/60 hover:border-[#3c79d9]/30",
        isDragging && "opacity-50 cursor-grabbing"
      )}
    >
      {isActive && (
        <div className="absolute inset-0 p-[1.5px] rounded-full bg-gradient-to-r from-[#3c79d9] to-[#6366f1] -z-10">
          <div className="w-full h-full bg-card rounded-full" />
        </div>
      )}
      <div className={cn(
        "size-6 rounded-full flex items-center justify-center transition-all border",
        isActive
          ? "bg-gradient-to-br from-[#3c79d9] to-[#6366f1] text-white border-transparent shadow-md"
          : "bg-muted/50 text-muted-foreground group-hover:bg-background border-transparent group-hover:border-[#3c79d9]/30"
      )}>
        {icon}
      </div>
      <Typography 
        variant="small" 
        className={cn(
          "font-medium transition-colors",
          isActive ? "text-[#3c79d9]" : "text-foreground/80 group-hover:text-[#3c79d9]"
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
    <div className="flex flex-col h-full bg-card border-r border-border/50">
      {/* Top Navigation Tabs */}
      <Tabs defaultValue="library" className="w-full relative">
        {/* Logo-synced Gradient Line */}
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-[#3c79d9] to-[#6366f1]" />
        
        <TabsList className="w-full h-14 rounded-none border-b border-border/50 bg-muted/10 p-0">
          <TabsTrigger 
            value="library" 
            className="flex-1 h-full rounded-none border-b-1 border-transparent data-[state=active]:border-[#3c79d9] data-[state=active]:bg-muted/30 gap-2 relative group overflow-hidden"
          >
            {/* Active Gradient Indicator Overlay */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#3c79d9] to-[#6366f1] opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
            <LayoutGrid size={16} className="text-muted-foreground group-data-[state=active]:text-[#3c79d9]"/>
            <span className="text-sm font-bold text-muted-foreground group-data-[state=active]:text-[#3c79d9]">Library</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Sub Navigation Tabs */}
      <div className="flex border-b border-border/50 bg-muted/5 relative">
        <button className="flex-1 py-3 flex flex-col items-center gap-1 bg-gradient-to-b from-transparent to-indigo-500/5 group">
          <Layers size={20} className="text-[#3c79d9]" />
          <span className="text-[10px] font-bold text-[#3c79d9]">Elements</span>
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#3c79d9] to-[#6366f1]" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <section>
            <Typography variant="label" className="mb-4 block text-indigo-900/40 font-bold tracking-widest normal-case">
              Basic Elements
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
