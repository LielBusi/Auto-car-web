import React from "react";
import {
  FaGlobe,
  FaStop,
  FaWalking,
  FaParking,
  FaTrafficLight,
  FaCar,
  FaBullseye,
  FaExclamationTriangle,
  FaTrash,
  FaSave,
  FaFolderOpen,
  FaMap,
} from "react-icons/fa";
import styles from "./WorldEditor.module.css";

export type RegisterToolFn = (id: string, el: HTMLButtonElement | null) => void;

interface ToolbarProps {
  mode: string;
  enableEditor: (mode: string) => void;
  setOsmPanelVisible: (v: boolean) => void;
  onSave: () => void;
  onDispose: () => void;
  onFileLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
  registerTool: RegisterToolFn;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  mode,
  enableEditor,
  setOsmPanelVisible,
  onSave,
  onDispose,
  onFileLoad,
  registerTool,
}) => {
  const tools = [
    { id: "graph", icon: <FaGlobe />, title: "Graph" },
    { id: "stop", icon: <FaStop />, title: "Stop" },
    { id: "yield", icon: <FaExclamationTriangle />, title: "Yield" },
    { id: "crossing", icon: <FaWalking />, title: "Crossing" },
    { id: "parking", icon: <FaParking />, title: "Parking" },
    { id: "light", icon: <FaTrafficLight />, title: "Light" },
    { id: "start", icon: <FaCar />, title: "Start" },
    { id: "target", icon: <FaBullseye />, title: "Target" },
  ];

  return (
    <div className={styles.toolbar}>
      <button className={styles.iconButton} onClick={onDispose} title="Dispose">
        <FaTrash />
      </button>

      <button className={styles.iconButton} onClick={onSave} title="Save">
        <FaSave />
      </button>

      <label className={styles.iconButton} title="Load">
        <FaFolderOpen />
        <input
          type="file"
          accept=".world"
          style={{ display: "none" }}
          onChange={onFileLoad}
        />
      </label>

      <button
        className={styles.iconButton}
        onClick={() => setOsmPanelVisible(true)}
        title="Import OSM"
      >
        <FaMap />
      </button>

      {tools.map((tool) => (
        <button
          key={tool.id}
          ref={(el) => registerTool(tool.id, el)}
          className={`${styles.iconButton} ${
            mode === tool.id ? styles.active : ""
          }`}
          onClick={() => enableEditor(tool.id)}
          title={tool.title}
          type="button"
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
};
