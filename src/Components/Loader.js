import React from "react";
import "./Loader.css";
import api from "../utils/axios.js";
export default function Loader() {
  return (
    <div className="loader-wrapper">
      <div className="loader-ring"></div>
      <div className="loader-text">Loading...</div>
    </div>
  );
}
