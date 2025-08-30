import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import styles from "./OsmPanel.module.css";

interface OsmPanelProps {
  osmDataValue: string;
  setOsmDataValue: (val: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export const OsmPanel: React.FC<OsmPanelProps> = ({
  osmDataValue,
  setOsmDataValue,
  onConfirm,
  onClose,
}) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Import OSM Data</h2>
        <textarea
          className={styles.textarea}
          rows={10}
          placeholder="Paste OSM JSON here..."
          value={osmDataValue}
          onChange={(e) => setOsmDataValue(e.target.value)}
        />
        <div className={styles.buttonRow}>
          <button
            className={styles.confirmBtn}
            onClick={onConfirm}
            title="Parse OSM"
          >
            <FaCheck />
            <span>Confirm</span>
          </button>
          <button className={styles.cancelBtn} onClick={onClose} title="Close">
            <FaTimes />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
