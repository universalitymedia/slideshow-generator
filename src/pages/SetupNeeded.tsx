import { KeyRound } from "lucide-react";

export function SetupNeeded() {
  return (
    <main className="auth-page">
      <section className="card auth-card setup">
        <span className="tile lg"><KeyRound size={22} /></span>
        <h1>Clerk isn't connected yet</h1>
        <p className="muted">
          Add your Clerk publishable key to a <code>.env.local</code> file in the project root, then restart the dev server.
        </p>
        <pre>VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</pre>
        <p className="muted small">
          Find it in the Clerk dashboard under API keys, or run <code>clerk init --app app_3KN1wjZtile0XJn7L5Wa0KRPze9</code> on your own machine.
        </p>
      </section>
    </main>
  );
}
