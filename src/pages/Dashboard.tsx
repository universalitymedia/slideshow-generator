import { ArrowUpRight } from "lucide-react";
import { href } from "../router";
import { TOOLS } from "../tools";

export function Dashboard() {
  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p className="muted">Every tool for making Warden creator content, in one place.</p>

      <div className="section-head">
        <h2>Tools</h2>
        <span className="muted small">{TOOLS.length} {TOOLS.length === 1 ? "tool" : "tools"}</span>
      </div>

      <div className="tool-grid">
        {TOOLS.map((t) => (
          <a key={t.id} className="card tool-card" href={href(t.path)}>
            <div className="tool-card-top">
              <span className="tile"><t.icon size={20} /></span>
              <ArrowUpRight size={16} className="muted" />
            </div>
            <h3>{t.title}</h3>
            <p className="muted">{t.description}</p>
            <span className="muted small">{t.platform}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
