import React from "react";
import ReactDOM from "react-dom/client";
import SettingsApp from "./SettingsApp";
import { ThemeProvider } from "./components/ThemeProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <SettingsApp />
    </ThemeProvider>
  </React.StrictMode>
);
