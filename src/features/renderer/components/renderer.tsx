"use client";

import * as React from "react";
import { useEditorStore } from "@/features/editor/stores/use-editor-store";
import { componentRegistry } from "./component-registry";
import { NodeId } from "@/features/editor/types/schema";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { cn } from "@/utils/cn";
import { Trash2, Copy, Ban } from "lucide-react";
import { ResizeHandle } from "./resize-handle";

interface RendererProps {
  nodeId: NodeId;
}

const fontWeightMap: Record<string, number> = {
  thin: 100,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

export const Renderer: React.FC<RendererProps> = ({ nodeId }) => {
  const { 
    nodes, 
    selectedNodeId, 
    selectNode, 
    mode, 
    removeNode,
    updateNodeProps,
    updateNodeStyles,
    isDraggingNode,
    isOverDroppable
  } = useEditorStore();
  const node = nodes[nodeId];
  const isSelected = selectedNodeId === nodeId;
  const isEditMode = mode === "edit";
  const [isEditing, setIsEditing] = React.useState(false);
  const componentRef = React.useRef<HTMLElement>(null);

  // Auto-focus when entering edit mode
  React.useEffect(() => {
    if (isEditing && componentRef.current) {
      componentRef.current.focus();
      
      // Di chuyển con trỏ xuống cuối văn bản
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(componentRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);



  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: nodeId,
    disabled: !isEditMode || (node?.type !== "container" && nodeId !== "root"),
  });

  const { 
    attributes, 
    listeners, 
    setNodeRef: setDraggableRef, 
    transform,
    isDragging 
  } = useDraggable({
    id: nodeId,
    disabled: !isEditMode || nodeId === "root",
    data: {
      type: "canvas-node",
      nodeId,
    }
  });

  const combinedRef = (element: HTMLElement | null) => {
    setDroppableRef(element);
    setDraggableRef(element);
  };
  
  if (!node) {
    return null;
  }

  const definition = componentRegistry[node.type];
  if (!definition) return null;
  
  const Component = definition.renderer;

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    selectNode(nodeId);
    
    // Đảm bảo focus không bị kẹt ở các input khác (như trong Inspector) 
    // để các phím tắt (Delete, Backspace) có thể hoạt động.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const dragStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={combinedRef}
      onClick={handleClick}
      {...attributes}
      {...listeners}
      className={cn(
        "relative group",
        !isDraggingNode && "transition-all duration-200",
        isEditMode && "hover:outline hover:outline-1 hover:outline-primary/50",
        isSelected && "z-30 cursor-pointer",
        isOver && node.type === "container" && "bg-primary/5 ring-2 ring-primary ring-inset",
        node.x !== undefined && "absolute",
        isDragging && "z-50 pointer-events-none cursor-grabbing",
        isDragging && !isOverDroppable && "bg-destructive/20 ring-2 ring-destructive ring-inset",
        isEditMode && !isEditing && "select-none"
      )}
      style={{
        width: node.styles.width as any,
        height: node.styles.height as any,
        // Typography styles on wrapper for inheritance
        fontSize: node.styles.fontSize as any,
        fontWeight: (node.styles.fontWeight && typeof node.styles.fontWeight === 'string' && fontWeightMap[node.styles.fontWeight.toLowerCase()]) 
          ? fontWeightMap[node.styles.fontWeight.toLowerCase()] 
          : node.styles.fontWeight as any,
        fontFamily: node.styles.fontFamily as any,
        lineHeight: node.styles.lineHeight as any,
        textAlign: node.styles.textAlign as any,
        color: node.styles.color as any,
        ...(node.x !== undefined ? {
          left: `${node.x}px`,
          top: `${node.y}px`,
        } : {}),
        ...dragStyle
      }}
      data-wrapper-id={nodeId}
    >
      {/* Corner Markers for Selection */}
      {isSelected && isEditMode && (
        <>
          <ResizeHandle nodeId={nodeId} direction="tl" />
          <ResizeHandle nodeId={nodeId} direction="tr" />
          <ResizeHandle nodeId={nodeId} direction="bl" />
          <ResizeHandle nodeId={nodeId} direction="br" />
          <ResizeHandle nodeId={nodeId} direction="l" />
          <ResizeHandle nodeId={nodeId} direction="r" />
          
          <div className={cn(
            "absolute inset-0 border pointer-events-none",
            !isDraggingNode && "transition-all duration-200",
            isDragging ? "border-solid border-primary border-2" : "border-dashed border-primary"
          )} />
        </>
      )}

      {/* Floating Toolbar */}
      {isSelected && isEditMode && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background border shadow-xl rounded-full px-2 py-1.5 z-50 animate-in fade-in zoom-in duration-200">
          <button className="p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
            <Copy size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); removeNode(nodeId); }}
            className="p-1.5 hover:bg-destructive/10 rounded-full transition-colors text-muted-foreground hover:text-destructive"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {(isSelected || isDragging) && isEditMode && (
        <div 
          className={cn(
            "absolute -top-6 left-0 text-primary-foreground text-[9px] px-2 py-0.5 rounded-t-sm font-bold tracking-wider shadow-sm flex items-center gap-1 z-50 whitespace-nowrap",
            isDragging && !isOverDroppable ? "bg-destructive" : "bg-primary"
          )}
        >
          {isDragging && !isOverDroppable && <Ban size={10} />}
          {definition.label}
        </div>
      )}
      <Component 
        {...node.props} 
        ref={componentRef as any}
        style={{
          width: '100%',
          height: '100%',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          fontFamily: 'inherit',
          lineHeight: 'inherit',
          textAlign: 'inherit',
          color: 'inherit',
          cursor: isEditMode ? (isEditing ? "text" : "pointer") : "inherit",
        } as React.CSSProperties} 
        data-node-id={node.id}
        contentEditable={isEditMode && isEditing && node.type !== "container" && node.type !== "image"}
        suppressContentEditableWarning={true}
        onDoubleClick={(e: React.MouseEvent) => {
          if (!isEditMode || node.type === "container" || node.type === "image") return;
          e.stopPropagation();
          setIsEditing(true);
        }}
        onInput={(e: React.SyntheticEvent<HTMLElement>) => {
          // Chỉ cập nhật chiều cao khi đang gõ để khung bao giãn nở mượt mà
          const measuredHeight = e.currentTarget.scrollHeight;
          updateNodeStyles(nodeId, { height: `${measuredHeight}px` });
        }}
        onBlur={(e: React.FocusEvent<HTMLElement>) => {
          setIsEditing(false);
          // Chỉ lưu nội dung text vào Store khi người dùng đã gõ xong (click ra ngoài)
          const newText = e.currentTarget.innerText;
          const propName = node.type === "text" ? "content" : "text";
          updateNodeProps(nodeId, { [propName]: newText });
        }}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Escape") {
            (e.currentTarget as HTMLElement).blur();
          }
          // Ngăn chặn sự kiện lan ra ngoài khi đang gõ chữ (tránh kích hoạt các phím tắt của Editor)
          e.stopPropagation();
        }}
        onMouseDown={(e: React.MouseEvent) => {
          // Nếu đang edit chữ, ngăn chặn sự kiện mousedown để không kích hoạt Drag của dnd-kit
          if (isEditMode && document.activeElement === e.currentTarget) {
            e.stopPropagation();
          }
        }}
      >
        {node.children.length === 0 && node.type === "container" && isEditMode && (
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/20 rounded-lg text-muted-foreground/40 text-sm italic">
            Drop components here
          </div>
        )}
        {node.children.map((childId) => (
          <Renderer key={childId} nodeId={childId} />
        ))}
      </Component>
    </div>
  );
};
