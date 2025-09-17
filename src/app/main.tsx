import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "../styles/globals.css";
import "../shared/lib/test-supabase-integration.ts";

createRoot(document.getElementById("root")!).render(<App />);
