import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EditorState, NodeId, NodeSchema } from "../types/schema";

interface EditorActions {
  addNode: (node: NodeSchema, parentId: NodeId, index?: number) => void;
  removeNode: (id: NodeId) => void;
  updateNodeProps: (id: NodeId, props: Record<string, any>) => void;
  updateNodeStyles: (id: NodeId, styles: Record<string, any>) => void;
  selectNode: (id: NodeId | null) => void;
  moveNode: (id: NodeId, targetParentId: NodeId, index: number) => void;
  updateNodePosition: (id: NodeId, x: number, y: number) => void;
  setMode: (mode: "edit" | "preview") => void;
  setDnDStatus: (isDragging: boolean, isOver: boolean) => void;
}

const initialState: EditorState = {
  nodes: {
    root: {
      id: "root",
      type: "container",
      props: {},
      styles: { 
        minHeight: "100vh", 
        width: "100%", 
        backgroundColor: "hsl(var(--background))",
        padding: "1rem" 
      },
      children: [],
      parentId: null,
    },
  },
  rootNodeId: "root",
  selectedNodeId: null,
  draggedNodeId: null,
  isDraggingNode: false,
  isOverDroppable: false,
  mode: "edit",
};

export const useEditorStore = create<EditorState & EditorActions>()(
  persist(
    (set) => ({
      ...initialState,

      addNode: (node, parentId, index) =>
        set((state) => {
          const parent = state.nodes[parentId];
          if (!parent) return state;

          const newChildren = [...parent.children];
          if (typeof index === "number") {
            newChildren.splice(index, 0, node.id);
          } else {
            newChildren.push(node.id);
          }

          return {
            nodes: {
              ...state.nodes,
              [parentId]: { ...parent, children: newChildren },
              [node.id]: { ...node, parentId },
            },
          };
        }),

      removeNode: (id) =>
        set((state) => {
          const node = state.nodes[id];
          if (!node || id === state.rootNodeId) return state;

          const remainingNodes = { ...state.nodes };
          
          // Recursive helper to collect all descendant IDs
          const getAllDescendantIds = (nodeId: string): string[] => {
            const childIds = remainingNodes[nodeId]?.children || [];
            return childIds.reduce((acc: string[], childId: string) => {
              return [...acc, childId, ...getAllDescendantIds(childId)];
            }, []);
          };

          const idsToDelete = [id, ...getAllDescendantIds(id)];
          
          // Delete all identified nodes
          idsToDelete.forEach((nodeId) => {
            delete remainingNodes[nodeId];
          });
          
          // Remove from parent's children list
          if (node.parentId) {
            const parent = remainingNodes[node.parentId];
            if (parent) {
              remainingNodes[node.parentId] = {
                ...parent,
                children: parent.children.filter((childId) => childId !== id),
              };
            }
          }

          return {
            nodes: remainingNodes,
            selectedNodeId: idsToDelete.includes(state.selectedNodeId as string) ? null : state.selectedNodeId,
          };
        }),

      updateNodeProps: (id, props) =>
        set((state) => {
          const node = state.nodes[id];
          if (!node) return state;

          return {
            nodes: {
              ...state.nodes,
              [id]: { ...node, props: { ...node.props, ...props } },
            },
          };
        }),

      updateNodeStyles: (id, styles) =>
        set((state) => {
          const node = state.nodes[id];
          if (!node) return state;

          return {
            nodes: {
              ...state.nodes,
              [id]: { ...node, styles: { ...node.styles, ...styles } },
            },
          };
        }),

      selectNode: (id) => set({ selectedNodeId: id }),

      moveNode: (id, targetParentId, index) =>
        set((state) => {
          const node = state.nodes[id];
          if (!node || id === state.rootNodeId) return state;

          const nodes = { ...state.nodes };
          
          // Remove from old parent
          if (node.parentId) {
            const oldParent = nodes[node.parentId];
            nodes[node.parentId] = {
              ...oldParent,
              children: oldParent.children.filter((childId) => childId !== id),
            };
          }

          // Add to new parent
          const newParent = nodes[targetParentId];
          const newChildren = [...newParent.children];
          newChildren.splice(index, 0, id);
          
          nodes[targetParentId] = { ...newParent, children: newChildren };
          nodes[id] = { ...node, parentId: targetParentId };

          return { nodes };
        }),

      updateNodePosition: (id, x, y) =>
        set((state) => {
          const node = state.nodes[id];
          if (!node) return state;

          return {
            nodes: {
              ...state.nodes,
              [id]: { ...node, x, y },
            },
          };
        }),

      setDnDStatus: (isDragging, isOver) => set({ 
        isDraggingNode: isDragging, 
        isOverDroppable: isOver 
      }),

      setMode: (mode) => set({ mode }),
    }),
    {
      name: "editor-storage",
      partialize: (state) => ({ nodes: state.nodes, rootNodeId: state.rootNodeId }),
    }
  )
);
