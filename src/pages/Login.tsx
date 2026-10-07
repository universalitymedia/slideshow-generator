import { useAuth } from "../auth";
import logo from "../assets/brand/logo.png";

const ERRORS: Record<string, string> = {
  not_configured: "Discord login isn't set up on the server yet.",
  denied: "You cancelled the Discord login.",
  state: "That login link expired. Please try again.",
  not_allowed: "Your Discord account doesn't have access. Ask an admin to add you.",
  token: "Discord rejected the login. Please try again.",
  profile: "Couldn't read your Discord profile. Please try again.",
  failed: "Something went wrong signing in. Please try again.",
};

function DiscordMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.32 4.37A19.8 19.8 0 0 0 15.43 2.9a.07.07 0 0 0-.08.04c-.21.38-.45.87-.61 1.26a18.3 18.3 0 0 0-5.49 0c-.17-.4-.4-.88-.62-1.26a.08.08 0 0 0-.08-.04c-1.7.3-3.33.8-4.89 1.47a.07.07 0 0 0-.03.03C.5 9.05-.32 13.6.1 18.1a.08.08 0 0 0 .03.06 19.9 19.9 0 0 0 6 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.23-2a.08.08 0 0 0-.04-.1c-.65-.25-1.27-.55-1.87-.9a.08.08 0 0 1 0-.13l.37-.29a.07.07 0 0 1 .08-.01c3.93 1.8 8.18 1.8 12.07 0a.07.07 0 0 1 .08.01l.37.29a.08.08 0 0 1 0 .13c-.6.35-1.22.65-1.87.9a.08.08 0 0 0-.04.1c.36.7.77 1.37 1.23 2a.08.08 0 0 0 .08.03 19.8 19.8 0 0 0 6.01-3.03.08.08 0 0 0 .03-.06c.5-5.2-.84-9.72-3.55-13.7a.06.06 0 0 0-.03-.03ZM8.02 15.33c-1.18 0-2.16-1.09-2.16-2.42s.96-2.42 2.16-2.42c1.2 0 2.18 1.1 2.16 2.42 0 1.33-.96 2.42-2.16 2.42Zm7.97 0c-1.18 0-2.16-1.09-2.16-2.42s.95-2.42 2.16-2.42c1.2 0 2.18 1.1 2.16 2.42 0 1.33-.95 2.42-2.16 2.42Z" />
    </svg>
  );
}

export function Login() {
  const { config } = useAuth();
  const error = ERRORS[new URLSearchParams(window.location.search).get("login_error") ?? ""];

  return (
    <main className="auth-page">
      <div className="auth-brand">
        <img className="logo lg" src={logo} alt="" />
        <h1>Universality Tool's</h1>
        <p className="muted">Creator login. Sign in with Discord to open your tools.</p>
      </div>

      <section className="card auth-card center">
        {error && <p className="auth-error" role="alert">{error}</p>}
        <a className="btn discord" href="/auth/discord">
          <DiscordMark /> Continue with Discord
        </a>
        {config?.devLogin && (
          <div className="dev-login">
            <span className="muted small">Local testing</span>
            <a className="btn outline sm" href="/auth/dev">Dev creator</a>
            <a className="btn outline sm" href="/auth/dev?admin=1">Dev admin</a>
          </div>
        )}
      </section>
    </main>
  );
}
