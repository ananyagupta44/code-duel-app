"use client";
import { createPortal } from "react-dom";
import "../lobby.css";

export default function HelpDialog({
  onCancel,
  onStart,
  onMouseEnter,
  onMouseLeave,
  position,
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="help-popover"
      style={{ top: position.top, left: position.left }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <h2 className="help-popover-title">Need some help?</h2>
      <p className="help-popover-text">
        Would you like a guided walkthrough of the lobby?
      </p>
      <div className="help-popover-actions">
        <button className="help-popover-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button className="help-popover-start" onClick={onStart}>
          Start Tutorial
        </button>
      </div>
    </div>,
    document.body,
  );
}
