import * as React from "react";
import { useEditorStore } from "../stores/use-editor-store";

export const useEditorShortcuts = () => {
  const { selectedNodeId, removeNode } = useEditorStore();

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
};
