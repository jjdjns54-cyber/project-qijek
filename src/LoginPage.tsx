import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, LoaderCircle } from "lucide-react";
import Brand from "./Brand";

function GoogleMark() {
  return (
    <svg className="google-mark" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.37l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.92A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.92V7.46H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.54l3.35-2.62Z" />
      <path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.88A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.46l3.35 2.62C7.18 7.71 9.39 5.95 12 5.95Z" />
    </svg>
  );
}

export default function LoginPage() {
  const [showReferral, setShowReferral] = useState(false);
  const [referral, setReferral] = useState("");
  const [referralState, setReferralState] = useState<"idle" | "error" | "saved">("idle");
  const [googleBusy, setGoogleBusy] = useState(false);

  const applyReferral = (event: FormEvent) => {
    event.preventDefault();
    if (!referral.trim()) {
      setReferralState("error");
      return;
    }
    setReferralState("saved");
  };

  const continueWithGoogle = () => {
    if (googleBusy) return;
    setGoogleBusy(true);
    window.setTimeout(() => window.location.assign("/onboarding"), 1500);
  };

  return (
    <main className="login-page">
      {googleBusy && (
        <div className="login-transition" role="status" aria-live="assertive" aria-label="Preparing your onboarding">
          <div className="login-transition__logo" aria-hidden="true">
            <LoaderCircle className="login-transition__spinner" strokeWidth={1} />
            <Brand href="/" />
          </div>
          <div className="login-transition__copy">
            <strong>Preparing your experience</strong>
            <span>Setting up your personal analysis</span>
          </div>
        </div>
      )}
      <header className="login-header">
        <Brand />
        <a className="login-back" href="/">
          <ArrowLeft size={16} /> Back to home
        </a>
      </header>

      <div className="login-layout">
        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-panel__heading">
            <h1 id="login-title">
              <span>Sign in to</span> <span>DOODEE</span>
            </h1>
          </div>

          <button
            className="google-button"
            type="button"
            onClick={continueWithGoogle}
            disabled={googleBusy}
            aria-busy={googleBusy}
          >
            <GoogleMark />
            <span className="google-button__label">
              <span>{googleBusy ? "Connecting..." : "Continue with Google"}</span>
            </span>
            <ArrowRight size={17} />
          </button>

          <div className={`referral ${showReferral ? "referral--open" : ""}`}>
            <button
              className="referral-toggle"
              type="button"
              onClick={() => {
                setShowReferral(!showReferral);
                setReferralState("idle");
              }}
              aria-expanded={showReferral}
              aria-controls="referral-form"
            >
              Have a referral code?
              <ChevronDown size={17} />
            </button>
            <form id="referral-form" onSubmit={applyReferral} aria-hidden={!showReferral}>
              <label htmlFor="referral-code">Referral code</label>
              <div className="referral-field">
                <input
                  id="referral-code"
                  value={referral}
                  onChange={(event) => {
                    setReferral(event.target.value.toUpperCase());
                    setReferralState("idle");
                  }}
                  placeholder="Enter code"
                  autoComplete="off"
                  disabled={!showReferral || referralState === "saved"}
                  aria-invalid={referralState === "error"}
                  aria-describedby="referral-message"
                />
                <button type="submit" disabled={!showReferral || referralState === "saved"}>
                  {referralState === "saved" ? <Check size={17} /> : "Apply"}
                </button>
              </div>
              <p
                id="referral-message"
                className={referralState === "error" ? "is-error" : referralState === "saved" ? "is-saved" : ""}
                role="status"
              >
                {referralState === "error"
                  ? "Enter your referral code."
                  : referralState === "saved"
                    ? "Referral code applied."
                    : "Your code will be linked to this account."}
              </p>
            </form>
          </div>

          <p className="login-legal">
            By continuing, you agree to the <a href="#terms">Terms</a> and acknowledge the <a href="#privacy">Privacy Policy</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
