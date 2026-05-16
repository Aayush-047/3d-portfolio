import React from "react";

export default function MuseumLoader({ label = "Preparing gallery", fixed = false }) {
  return (
    <div className={fixed ? "museum-loader museum-loader--fixed" : "museum-loader"} role="status" aria-live="polite">
      <div className="museum-loader__plaque">
        <div className="museum-loader__arch" aria-hidden="true">
          <span />
        </div>
        <div className="museum-loader__text">{label}</div>
        <div className="museum-loader__rail" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
