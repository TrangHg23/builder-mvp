export type NodeId = string;

export interface ResponsiveValue<T> {
  base: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}

export type PropertyValue = string | number | boolean | ResponsiveValue<any>;

export interface NodeSchema {
  id: NodeId;
  type: string;
  props: Record<string, PropertyValue>;
  styles: Record<string, PropertyValue>;
  children: NodeId[];
  parentId: NodeId | null;
  x?: number;
  y?: number;
}

export interface EditorState {
  nodes: Record<NodeId, NodeSchema>;
  rootNodeId: NodeId;
  selectedNodeId: NodeId | null;
  draggedNodeId: NodeId | null;
  isDraggingNode: boolean;
  isOverDroppable: boolean;
  mode: "edit" | "preview";
}
