import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import App from "./App.jsx";
import "./index.css";
import "./i18n/config";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <ThemeProvider defaultTheme="light">
      <App />
    </ThemeProvider>
  </AuthProvider>
);
