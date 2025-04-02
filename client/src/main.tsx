import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Importar configuración de i18n
import "./i18n/i18n";

createRoot(document.getElementById("root")!).render(<App />);
