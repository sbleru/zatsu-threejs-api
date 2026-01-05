import { createRoot } from "react-dom/client";

import { App } from "./features/App";
import "./index.css";

const container = document.getElementById("container");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
