import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AssetGate, { RouteLoader } from "./AssetGate";
import "./styles.css";

const LoginPage = lazy(() => import("./LoginPage"));
const OnboardingPage = lazy(() => import("./OnboardingPage"));
const ScanPage = lazy(() => import("./ScanPage"));
const DashboardPage = lazy(() => import("./DashboardPage"));

const path = window.location.pathname.replace(/\/$/, "") || "/";
const onboardingComplete = Boolean(window.sessionStorage.getItem("doodee:onboarding"));
const authenticated = window.sessionStorage.getItem("doodee:authenticated") === "1";
const redirectTo =
  path === "/login" && !onboardingComplete
    ? "/onboarding"
    : path === "/scan" && !onboardingComplete
      ? "/onboarding"
      : path === "/scan" && !authenticated
        ? "/login"
        : null;

if (redirectTo) window.location.replace(redirectTo);

const page = redirectTo
  ? null
  : path === "/login"
    ? <LoginPage />
    : path === "/onboarding"
      ? <OnboardingPage />
      : path === "/scan"
        ? <ScanPage />
        : path === "/app"
          ? <DashboardPage />
          : <App />;

const renderedPage =
  path === "/scan" || path === "/app" ? page : <React.StrictMode>{page}</React.StrictMode>;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AssetGate>
    <Suspense fallback={<RouteLoader />}>{renderedPage}</Suspense>
  </AssetGate>,
);
