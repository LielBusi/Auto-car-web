import React from "react";

interface BaseEnvironmentProps {
  onDispose: () => void;
  onSave: () => void;
  onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenOsmPanel: () => void;
  onSetMode: (mode: string) => void;
  osmPanelVisible: boolean;
  onCloseOsmPanel: () => void;
  onParseOsmData: () => void;
  // Refs to buttons and textarea for the logic component
  refs: {
    graphBtn: React.RefObject<HTMLButtonElement>;
    stopBtn: React.RefObject<HTMLButtonElement>;
    yieldBtn: React.RefObject<HTMLButtonElement>;
    crossingBtn: React.RefObject<HTMLButtonElement>;
    parkingBtn: React.RefObject<HTMLButtonElement>;
    lightBtn: React.RefObject<HTMLButtonElement>;
    startBtn: React.RefObject<HTMLButtonElement>;
    targetBtn: React.RefObject<HTMLButtonElement>;
    osmDataContainer: React.RefObject<HTMLTextAreaElement>;
    osmPanel: React.RefObject<HTMLDivElement>;
  };
}

export const BaseEnvironment: React.FC<BaseEnvironmentProps> = ({
  onDispose,
  onSave,
  onLoad,
  onOpenOsmPanel,
  onSetMode,
  osmPanelVisible,
  onCloseOsmPanel,
  onParseOsmData,
  refs,
}) => {
  return (
    <>
      <h1>World Editor</h1>
      <canvas id="myCanvas" width={600} height={600} />
      <div id="controls">
        <button onClick={onDispose}>🗑️</button>
        <button onClick={onSave}>💾</button>
        <label htmlFor="fileInput" className="file-input-label">
          📁
          <input type="file" id="fileInput" accept=".world" onChange={onLoad} />
        </label>
        <button onClick={onOpenOsmPanel}>🗺️</button>
        &nbsp;
        <button ref={refs.graphBtn} onClick={() => onSetMode("graph")}>
          🌐
        </button>
        <button ref={refs.stopBtn} onClick={() => onSetMode("stop")}>
          🛑
        </button>
        <button ref={refs.yieldBtn} onClick={() => onSetMode("yield")}>
          ⚠️
        </button>
        <button ref={refs.crossingBtn} onClick={() => onSetMode("crossing")}>
          🚶
        </button>
        <button ref={refs.parkingBtn} onClick={() => onSetMode("parking")}>
          🅿️
        </button>
        <button ref={refs.lightBtn} onClick={() => onSetMode("light")}>
          🚦
        </button>
        <button ref={refs.startBtn} onClick={() => onSetMode("start")}>
          🚙
        </button>
        <button ref={refs.targetBtn} onClick={() => onSetMode("target")}>
          🎯
        </button>
        <div
          id="osmPanel"
          ref={refs.osmPanel}
          style={{ display: osmPanelVisible ? "block" : "none" }}
        >
          <textarea
            id="osmDataContainer"
            ref={refs.osmDataContainer}
            rows={10}
            cols={50}
            placeholder="Paste OSM data here"
          />
          <div>
            <button onClick={onParseOsmData}>✔️</button>
            <button onClick={onCloseOsmPanel}>❌</button>
          </div>
        </div>
      </div>
    </>
  );
};
