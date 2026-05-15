import { useEditorStore } from "../stores/use-editor-store";

export const useEditorActions = () => {
  const { nodes } = useEditorStore();

  const handleSave = () => {
    const dataStr = JSON.stringify(nodes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'site-schema.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return {
    handleSave,
  };
};
