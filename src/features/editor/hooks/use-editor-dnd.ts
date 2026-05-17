import * as React from "react";
import { 
  DragStartEvent, 
  DragEndEvent, 
  DragOverEvent,
  MouseSensor, 
  TouchSensor, 
  useSensor, 
  useSensors 
} from "@dnd-kit/core";
import { nanoid } from "nanoid";
import { useEditorStore } from "../stores/use-editor-store";
import { componentRegistry } from "@/features/renderer/components/component-registry";
import { formatNumber } from "@/utils/number";
import { MIN_HORIZONTAL_WIDTH, MIN_DIAGONAL_WIDTH, MIN_DIAGONAL_HEIGHT, MIN_FONT_SIZE } from "../constants";

export const useEditorDnd = () => {
  const { 
    nodes, 
    addNode, 
    selectNode, 
    updateNodePosition, 
    updateNodeStyles,
    setDnDStatus
  } = useEditorStore();

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [isOverDroppable, setIsOverDroppable] = React.useState(false);

  const resizeRef = React.useRef<{
    id: string;
    initialWidth: number;
    initialHeight: number;
    initialX: number;
    initialY: number;
    initialFontSize: number;
    aspectRatio: number;
    fontRatio: number;
    direction: string;
    // Transient session state
    currentScale: number;
    translateX: number;
    translateY: number;
    lastStoreUpdate: number | null;
    lastRafId: number | null;
  } | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const [active, setActive] = React.useState<any>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active: activeItem } = event;
    setActive(activeItem);
    setActiveId(activeItem.id as string);
    setIsOverDroppable(false);
    
    // Set global cursor to grabbing only if we are moving a node, not resizing
    if (activeItem.data.current?.type !== "resize-handle") {
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      setDnDStatus(true, false);
    }
    
    // console.log('active====== ', activeItem)

    if (activeItem.data.current?.type === "resize-handle") {
      const nodeId = activeItem.data.current.nodeId;
      const node = nodes[nodeId];
      if (node) {
        const currentWidth = parseInt(String(node.styles.width || "0"));
        let currentHeight = parseInt(String(node.styles.height || "0"));
        const currentFontSize = parseInt(String(node.styles.fontSize || "0"));

        const width = isNaN(currentWidth) ? 0 : currentWidth;
        const height = isNaN(currentHeight) ? 0 : currentHeight;
        const fontSize = isNaN(currentFontSize) ? 0 : currentFontSize;

        resizeRef.current = {
          id: nodeId,
          initialWidth: width,
          initialHeight: height,
          initialX: node.x || 0,
          initialY: node.y || 0,
          initialFontSize: fontSize,
          aspectRatio: width / height || 1,
          fontRatio: fontSize / height || 0.8,
          direction: activeItem.data.current.direction,
          currentScale: 1,
          translateX: 0,
          translateY: 0,
          lastStoreUpdate: null,
          lastRafId: null,
        };

        // Layer promotion for GPU acceleration
        const wrapper = document.querySelector(`[data-wrapper-id="${nodeId}"]`) as HTMLElement;
        const element = document.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement;
        if (wrapper) wrapper.style.willChange = 'transform, width, height, top, left';
        if (element) element.style.willChange = 'transform, width, height';
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const isOver = !!event.over;
    setIsOverDroppable(isOver);
    setDnDStatus(true, isOver);
  };

  const handleDragMove = (event: any) => {
    if (!resizeRef.current) return;

    const { delta } = event;
    const { 
      id, 
      initialWidth, 
      initialHeight, 
      initialX, 
      initialY, 
      initialFontSize,
      aspectRatio, 
      fontRatio,
      direction 
    } = resizeRef.current;
    
    let newWidth = initialWidth;
    let newHeight = initialHeight;
    let newX = initialX;
    let newY = initialY;
    
    const isHorizontalOnly = direction === "l" || direction === "r";
    const isDiagonal = !isHorizontalOnly;
    
    // Performance Optimization: Batch DOM mutations in requestAnimationFrame
    if (resizeRef.current.lastRafId) cancelAnimationFrame(resizeRef.current.lastRafId);
    
    resizeRef.current.lastRafId = requestAnimationFrame(() => {
      const wrapper = document.querySelector(`[data-wrapper-id="${id}"]`) as HTMLElement;
      const element = document.querySelector(`[data-node-id="${id}"]`) as HTMLElement;
      
      let constrainedWidth = initialWidth;
      let constrainedHeight = initialHeight;
      let constrainedFontSize = initialFontSize;
      let translateX = 0;
      let translateY = 0;

      if (isHorizontalOnly) {
        const dx = direction === "l" ? -delta.x : delta.x;
        constrainedWidth = Math.max(MIN_HORIZONTAL_WIDTH, initialWidth + dx);
        
        if (direction === "l") {
          translateX = initialWidth - constrainedWidth;
        }
      } else {
        const dx = direction.includes("l") ? -delta.x : delta.x;
        const dy = direction.includes("t") ? -delta.y : delta.y;

        if (Math.abs(dx) > Math.abs(dy)) {
          constrainedWidth = Math.max(MIN_DIAGONAL_WIDTH, initialWidth + dx);
          constrainedHeight = constrainedWidth / aspectRatio;
          
          if (constrainedHeight < MIN_DIAGONAL_HEIGHT) {
            constrainedHeight = MIN_DIAGONAL_HEIGHT;
            constrainedWidth = constrainedHeight * aspectRatio;
          }
        } else {
          constrainedHeight = Math.max(MIN_DIAGONAL_HEIGHT, initialHeight + dy);
          constrainedWidth = constrainedHeight * aspectRatio;
          
          if (constrainedWidth < MIN_DIAGONAL_WIDTH) {
            constrainedWidth = MIN_DIAGONAL_WIDTH;
            constrainedHeight = constrainedWidth / aspectRatio;
          }
        }
        
        const scale = constrainedWidth / initialWidth;
        constrainedFontSize = Math.max(MIN_FONT_SIZE, initialFontSize * scale);

        if (direction.includes("l")) translateX = initialWidth - constrainedWidth;
        if (direction.includes("t")) translateY = initialHeight - constrainedHeight;
      }

      // Lưu trạng thái tạm thời
      resizeRef.current!.currentScale = constrainedWidth / initialWidth;
      resizeRef.current!.translateX = translateX;
      resizeRef.current!.translateY = translateY;

      // 1. THAO TÁC TRỰC TIẾP TRÊN DOM (60FPS Visuals)
      if (wrapper) {
        wrapper.style.transform = 'none'; // Đảm bảo không bị dính transform cũ
        wrapper.style.width = `${constrainedWidth}px`;
        wrapper.style.height = isHorizontalOnly ? 'auto' : `${constrainedHeight}px`;
        wrapper.style.fontSize = `${constrainedFontSize}px`;
        
        // Di chuyển vị trí thực tế để giữ điểm neo
        if (translateX !== 0) wrapper.style.left = `${initialX + translateX}px`;
        if (translateY !== 0) wrapper.style.top = `${initialY + translateY}px`;
      }
      
      if (element) {
        element.style.width = '100%';
        element.style.height = '100%';
        element.style.fontSize = 'inherit';
      }

      // 2. THROTTLED STORE UPDATE (Cập nhật số trên Inspector không gây lag)
      const now = Date.now();
      if (!resizeRef.current!.lastStoreUpdate || now - resizeRef.current!.lastStoreUpdate > 32) {
        updateNodeStyles(id, {
          width: `${formatNumber(constrainedWidth)}px`,
          height: isHorizontalOnly ? (element?.scrollHeight ? `${element.scrollHeight}px` : 'auto') : `${formatNumber(constrainedHeight)}px`,
          fontSize: `${formatNumber(constrainedFontSize)}px`,
        });
        
        if (translateX !== 0 || translateY !== 0) {
          updateNodePosition(id, initialX + translateX, initialY + translateY);
        }
        
        resizeRef.current!.lastStoreUpdate = now;
      }
      
      if (resizeRef.current) resizeRef.current.lastRafId = null;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active: activeItem, over } = event;
    setActive(null);
    setActiveId(null);
    setIsOverDroppable(false);
    // Reset global cursor and selection
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    // Final Commit Phase for Resize
    if (resizeRef.current) {
      const { id, initialWidth, initialHeight, initialFontSize, initialX, initialY, currentScale, translateX, translateY, lastRafId, direction } = resizeRef.current;
      if (lastRafId) cancelAnimationFrame(lastRafId);

      const finalWidth = initialWidth * currentScale;
      let finalHeight = initialHeight * currentScale;
      let finalFontSize = initialFontSize;
      const finalX = initialX + translateX;
      const finalY = initialY + translateY;

      // Reset layer promotion only - let React handle style updates atomically
      const wrapper = document.querySelector(`[data-wrapper-id="${id}"]`) as HTMLElement;
      const element = document.querySelector(`[data-node-id="${id}"]`) as HTMLElement;
      if (wrapper) wrapper.style.willChange = '';
      if (element) element.style.willChange = '';

      // Diagonal resize scales font
      if (direction.length > 1) {
        finalFontSize = Math.max(MIN_FONT_SIZE, initialFontSize * currentScale);
      } else {
        // Horizontal resize needs actual height measurement for text wrapping
        if (element) {
          const originalWidth = element.style.width;
          element.style.width = `${formatNumber(finalWidth)}px`;
          finalHeight = element.scrollHeight;
          // Don't reset width here, let React rerender take over
        }
      }

      updateNodeStyles(id, {
        width: `${formatNumber(finalWidth)}px`,
        height: `${formatNumber(finalHeight)}px`,
        fontSize: `${formatNumber(finalFontSize)}px`,
      });
      
      if (translateX !== 0 || translateY !== 0) {
        updateNodePosition(id, finalX, finalY);
      }
      
      resizeRef.current = null;
    }

    if (over && activeItem.data.current?.type === "library-item") {
      const componentType = activeItem.data.current.componentType;
      const definition = componentRegistry[componentType];
      
      if (definition) {
        const newNodeId = nanoid();
        const overRect = over.rect;
        const activeRect = activeItem.rect.current.translated;
        
        let x = 0;
        let y = 0;
        
        if (activeRect && overRect) {
          x = Math.max(0, activeRect.left - overRect.left);
          y = Math.max(0, activeRect.top - overRect.top);
          
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
    } else if (over && activeItem.data.current?.type === "canvas-node") {
      const nodeId = activeItem.data.current.nodeId;
      const node = nodes[nodeId];
      const overRect = over.rect;
      const activeRect = activeItem.rect.current.translated;

      if (node && overRect && activeRect) {
        let newX = activeRect.left - overRect.left;
        let newY = activeRect.top - overRect.top;
        
        newX = Math.max(0, newX);
        newY = Math.max(0, newY);
        
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

  return {
    sensors,
    active,
    activeId,
    isOverDroppable,
    handleDragStart,
    handleDragOver,
    handleDragMove,
    handleDragEnd,
  };
};
