import { SignIn } from "@clerk/react";
import logo from "../assets/brand/logo.png";

export function Login() {
  return (
    <main className="auth-page">
      <div className="auth-brand">
        <img className="logo lg" src={logo} alt="" />
        <h1>Universality Tool's</h1>
        <p className="muted">Creator login. Sign in to open your tools.</p>
      </div>
      {/* Hash routing matches the app router. Unknown hashes fall back to the dashboard after sign-in. */}
      <SignIn routing="hash" />
    </main>
  );
}
