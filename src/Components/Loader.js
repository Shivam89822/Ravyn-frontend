import React from "react";
import "./Loader.css";

export default function Loader() {
  return (
    <div className="loader-wrapper">
      <div className="loader-ring"></div>
      <div className="loader-text">Loading...</div>
    </div>
  );
}
