import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // ملف التنسيق الأساسي (اللي فيه Tailwind)
import "./App.css";   // ملف التنسيق الخاص بالـ Cyberpunk Vibe

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);