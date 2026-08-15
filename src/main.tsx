import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import LoginPage from "./LoginPage";
import OnboardingPage from "./OnboardingPage";
import ScanPage from "./ScanPage";
import DashboardPage from "./DashboardPage";
import "./styles.css";

const path = window.location.pathname.replace(/\/$/, "") || "/";
const page = path === "/login" ? <LoginPage /> : path === "/onboarding" ? <OnboardingPage /> : path === "/scan" ? <ScanPage /> : path === "/app" ? <DashboardPage /> : <App />;

ReactDOM.createRoot(document.getElementById("root")!).render(
  path === "/scan" || path === "/app" ? page : <React.StrictMode>{page}</React.StrictMode>,
);
