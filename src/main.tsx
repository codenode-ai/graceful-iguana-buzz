import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import "./test-supabase-integration";

createRoot(document.getElementById("root")!).render(<App />);
