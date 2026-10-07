import { ChevronRight, LayoutDashboard, PanelLeft } from "lucide-react";
import logo from "../assets/brand/logo.png";
import { useState, type ReactNode } from "react";
import { href } from "../router";
import { PLATFORMS, TOOLS } from "../tools";

export function Layout({ route, children }: { route: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const tool = TOOLS.find((t) => t.path === route);
  const platform = tool && PLATFORMS.find((p) => p.label === tool.platform);

  return (
    <div className={`shell ${open ? "" : "collapsed"}`}>
      <aside className="sidebar">
        <a className="brand" href={href("/")}>
          <img className="logo" src={logo} alt="" />
          <span>
            <strong>Universality Tool's</strong>
            <small>Creator Tools</small>
          </span>
        </a>

        <nav>
          <a className={`nav-item ${route === "/" ? "active" : ""}`} href={href("/")}>
            <LayoutDashboard size={18} /> <span>Dashboard</span>
          </a>

          <p className="nav-label">Tools</p>
          {PLATFORMS.map((p) => (
            <div key={p.id}>
              <span className={`nav-item ${tool?.platform === p.label ? "active" : ""}`}>
                <p.icon size={18} /> <span>{p.label}</span>
              </span>
              <div className="nav-sub">
                {TOOLS.filter((t) => t.platform === p.label).map((t) => (
                  <a key={t.id} className={`nav-sub-item ${route === t.path ? "active" : ""}`} href={href(t.path)}>
                    {t.title}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="icon-btn" onClick={() => setOpen((o) => !o)} aria-label="Toggle sidebar">
            <PanelLeft size={18} />
          </button>
          <span className="divider" />
          <ol className="crumbs">
            {tool ? (
              <>
                <li><a href={href("/")}>Dashboard</a></li>
                <ChevronRight size={14} />
                <li>{platform?.label}</li>
                <ChevronRight size={14} />
                <li aria-current="page">{tool.title}</li>
              </>
            ) : (
              <li aria-current="page">Dashboard</li>
            )}
          </ol>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
