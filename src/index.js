import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// Uygulamanın kök elemanını oluştur
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

// Render işlemi
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
