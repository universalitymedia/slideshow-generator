import { ChevronRight, LayoutDashboard, LogOut, PanelLeft, ShieldCheck } from "lucide-react";
import { useState, type ReactNode } from "react";
import logo from "../assets/brand/logo.png";
import { useAuth } from "../auth";
import { href } from "../router";
import { PLATFORMS, TOOLS } from "../tools";

export function Layout({ route, children }: { route: string; children: ReactNode }) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(true);
  const tool = TOOLS.find((t) => t.path === route);
  const platform = tool && PLATFORMS.find((p) => p.label === tool.platform);
  const inAdmin = route.startsWith("/admin");
  const editing = route.startsWith("/admin/styles/");

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

          {user?.isAdmin && (
            <>
              <p className="nav-label">Admin</p>
              <a className={`nav-item ${inAdmin ? "active" : ""}`} href={href("/admin")}>
                <ShieldCheck size={18} /> <span>Styles</span>
              </a>
            </>
          )}
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
            ) : inAdmin ? (
              <>
                <li><a href={href("/")}>Dashboard</a></li>
                <ChevronRight size={14} />
                {editing ? (
                  <>
                    <li><a href={href("/admin")}>Admin</a></li>
                    <ChevronRight size={14} />
                    <li aria-current="page">Edit style</li>
                  </>
                ) : (
                  <li aria-current="page">Admin</li>
                )}
              </>
            ) : (
              <li aria-current="page">Dashboard</li>
            )}
          </ol>

          {user && (
            <div className="user-menu push">
              {user.avatar ? <img className="avatar" src={user.avatar} alt="" referrerPolicy="no-referrer" /> : <span className="avatar fallback">{user.name[0]}</span>}
              <span className="user-name">{user.name}</span>
              <button className="icon-btn" onClick={signOut} aria-label="Sign out" title="Sign out">
                <LogOut size={17} />
              </button>
            </div>
          )}
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
