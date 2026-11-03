import React from "react";
import ReactDOM from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "./styles/base.css";
import "./styles/shell.css";
import "./features/dashboard/Dashboard.css";
import "./features/auth/auth-shell.css";
import "./features/employees/Employees.css";
import "./styles/workspace.css";
import "./features/attendance/Attendance.css";
import "./styles/themes.css";
import "./styles/responsive.css";
import App from "./app/App";
import { BrowserRouter } from "react-router-dom";
import ThemeProvider from "@/shared/components/ThemeProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);