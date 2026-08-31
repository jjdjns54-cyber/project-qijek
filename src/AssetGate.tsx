import { ReactNode, useEffect, useState } from "react";
import { waitForAssets } from "./assetReadiness";

type GateState = "loading" | "exiting" | "ready";

const imageCache = new Map<string, Promise<void>>();
const LOADER_DURATION_MS = 560;
const EXIT_DURATION_MS = 260;

const routeAssets = {
  landing: {
    critical: [],
  },
  onboarding: {
    critical: [],
  },
  scan: {
    critical: ["/assets/scan/capture-angles-reference.png"],
  },
  app: {
    critical: ["/assets/sample-face-front.webp"],
  },
  login: {
    critical: [],
  },
} as const;

function routeConfig(pathname: string) {
  if (pathname === "/onboarding") return routeAssets.onboarding;
  if (pathname === "/scan") return routeAssets.scan;
  if (pathname === "/app") return routeAssets.app;
  if (pathname === "/login") return routeAssets.login;
  return routeAssets.landing;
}

function loadImage(src: string) {
  const cached = imageCache.get(src);
  if (cached) return cached;

  const request = new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => image.decode().catch(() => undefined).then(resolve);
    image.onerror = () => reject(new Error(`Unable to preload ${src}`));
    image.src = src;
  });

  imageCache.set(src, request);
  request.catch(() => imageCache.delete(src));
  return request;
}

function GateBrand() {
  return (
    <div className="asset-gate__brand" aria-label="DOODEE">
      <svg viewBox="0 0 42 50" aria-hidden="true">
        <g className="asset-gate__mark-base">
          <path d="M7 4v38M7 4h7c12 0 21 9 21 19s-9 19-21 19" />
          <path d="M17 13v33M17 13h4c10 0 18 7 18 16s-8 17-18 17" />
        </g>
        <g className="asset-gate__mark-trace">
          <path d="M7 4v38M7 4h7c12 0 21 9 21 19s-9 19-21 19" />
          <path d="M17 13v33M17 13h4c10 0 18 7 18 16s-8 17-18 17" />
        </g>
      </svg>
      <span>DOODEE</span>
    </div>
  );
}

function LoadingMeter({ progress, indeterminate = false }: { progress?: number; indeterminate?: boolean }) {
  const value = Math.max(0, Math.min(100, progress ?? 0));
  return (
    <div className="asset-gate__meter">
      <div className="asset-gate__meter-copy">
        <strong>{indeterminate ? "0%" : `${Math.floor(value)}%`}</strong>
      </div>
      <div
        className="asset-gate__progress"
        role="progressbar"
        aria-label="Loading essential assets"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : value}
      >
        <span
          className={indeterminate ? "is-indeterminate" : ""}
          style={indeterminate ? undefined : { transform: `scaleX(${value / 100})` }}
        />
      </div>
    </div>
  );
}

function LoadingStage({ progress, indeterminate = false }: { progress?: number; indeterminate?: boolean }) {
  return (
    <div className="asset-gate__stage">
      <GateBrand />
      <LoadingMeter progress={progress} indeterminate={indeterminate} />
    </div>
  );
}

export function RouteLoader() {
  return (
    <main className="asset-gate" aria-live="polite" aria-busy="true">
      <LoadingStage indeterminate />
    </main>
  );
}

export default function AssetGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>("loading");
  const [visualProgress, setVisualProgress] = useState(0);

  useEffect(() => {
    const hideBrokenImage = (event: Event) => {
      if (event.target instanceof HTMLImageElement) {
        event.target.classList.add("asset-load-failed");
      }
    };
    document.addEventListener("error", hideBrokenImage, true);
    return () => document.removeEventListener("error", hideBrokenImage, true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let animationFrame = 0;
    let minimumTimer = 0;
    let exitTimer = 0;
    const config = routeConfig(window.location.pathname);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startedAt = performance.now();

    document.documentElement.classList.add("asset-gate-active");
    delete document.documentElement.dataset.assetsReady;
    setState("loading");
    setVisualProgress(reduceMotion ? 100 : 0);

    const animateProgress = (now: number) => {
      if (cancelled) return;
      const next = Math.min(100, ((now - startedAt) / LOADER_DURATION_MS) * 100);
      setVisualProgress(next);
      if (next < 100) animationFrame = window.requestAnimationFrame(animateProgress);
    };

    if (!reduceMotion) animationFrame = window.requestAnimationFrame(animateProgress);

    const prepare = async () => {
      await Promise.all([
        waitForAssets(config.critical.map(loadImage)),
        new Promise<void>((resolve) => {
          minimumTimer = window.setTimeout(resolve, reduceMotion ? 0 : LOADER_DURATION_MS);
        }),
      ]);

      if (cancelled) return;
      window.cancelAnimationFrame(animationFrame);
      setVisualProgress(100);
      document.documentElement.dataset.assetsReady = "true";
      setState("exiting");

      await new Promise<void>((resolve) => {
        exitTimer = window.setTimeout(resolve, reduceMotion ? 0 : EXIT_DURATION_MS);
      });

      if (cancelled) return;
      document.documentElement.classList.remove("asset-gate-active");
      setState("ready");
    };

    void prepare();
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(minimumTimer);
      window.clearTimeout(exitTimer);
      document.documentElement.classList.remove("asset-gate-active");
    };
  }, []);

  return (
    <>
      <div className={`asset-gate__content ${state === "exiting" ? "is-entering" : state === "ready" ? "is-ready" : ""}`}>
        {children}
      </div>
      {state !== "ready" && (
        <main className={`asset-gate ${state === "exiting" ? "is-exiting" : ""}`} aria-live="polite" aria-busy={state === "loading"}>
          <LoadingStage progress={visualProgress} />
        </main>
      )}
    </>
  );
}
