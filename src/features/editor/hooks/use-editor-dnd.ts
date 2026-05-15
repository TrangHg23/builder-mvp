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
import { MIN_NODE_WIDTH, MIN_NODE_HEIGHT, MIN_FONT_SIZE } from "../constants";

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
  } | null>(null);

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

  const [active, setActive] = React.useState<any>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active: activeItem } = event;
    setActive(activeItem);
    setActiveId(activeItem.id as string);
    setIsOverDroppable(false);
    
    // Set global cursor to grabbing only if we are moving a node, not resizing
    if (activeItem.data.current?.type !== "resize-handle") {
      document.body.style.cursor = 'grabbing';
      setDnDStatus(true, false);
    }
    
    // console.log('active====== ', activeItem)

    if (activeItem.data.current?.type === "resize-handle") {
      const nodeId = activeItem.data.current.nodeId;
      const node = nodes[nodeId];
      if (node) {
        const currentWidth = parseInt(String(node.styles.width || "0"));
        const currentHeight = parseInt(String(node.styles.height || "0"));
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
          direction: activeItem.data.current.direction,   // hướng kéo (tl, tr, bl, br)
        };
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
      aspectRatio, 
      fontRatio,
      direction 
    } = resizeRef.current;
    
    // Tạm thời vô hiệu hóa logic cho kéo ngang (l, r) 
    // để không bị dùng nhầm logic resize chéo
    if (direction === "l" || direction === "r") return;
    
    let newWidth = initialWidth;
    let newHeight = initialHeight;
    let newX = initialX;
    let newY = initialY;

    const dx = direction.includes("l") ? -delta.x : delta.x;
    const dy = direction.includes("t") ? -delta.y : delta.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      newWidth = Math.max(MIN_NODE_WIDTH, initialWidth + dx);
      newHeight = newWidth / aspectRatio;
    } else {
      newHeight = Math.max(MIN_NODE_HEIGHT, initialHeight + dy);
      newWidth = newHeight * aspectRatio;
    }

    if (direction.includes("l")) {
      newX = initialX + (initialWidth - newWidth);
    }
    if (direction.includes("t")) {
      newY = initialY + (initialHeight - newHeight);
    }

    const newFontSize = Math.max(MIN_FONT_SIZE, formatNumber(newHeight * fontRatio));
    
    updateNodeStyles(id, { 
      width: `${formatNumber(newWidth)}px`, 
      height: `${formatNumber(newHeight)}px`,
      fontSize: `${newFontSize}px`
    });

    if (newX !== initialX || newY !== initialY) {
      updateNodePosition(id, newX, newY);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active: activeItem, over } = event;
    setActive(null);
    setActiveId(null);
    setIsOverDroppable(false);
    resizeRef.current = null;
    setDnDStatus(false, false);
    
    // Reset global cursor
    document.body.style.cursor = '';

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
