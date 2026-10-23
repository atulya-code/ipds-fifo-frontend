
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FileText,
  ArrowLeftRight,
  LogOut,
  Wheat,
  Menu,
  X,
  ClipboardPlus,
} from "lucide-react";
import { useState } from "react";
import { apiRequest } from "../services/api";

export default function Layout({ user, onLogout }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/stock", label: "Stock Batches", icon: Package },
    ...( ["admin", "godown_manager", "operator"].includes(user?.role)
      ? [
          {
            to: "/stock-receipt",
            label: "Stock Receipt",
            icon: ClipboardPlus,
          },
        ]
      : []),
    { to: "/challans", label: "Delivery Challans", icon: FileText },
    { to: "/movements", label: "Stock Movements", icon: ArrowLeftRight },
  ];

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      onLogout();
      navigate("/login", { replace: true });
      setLoggingOut(false);
    }
  }

  return (
    <div className="app-shell">
      {mobileMenu && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-mark">
            <Wheat size={24} />
          </span>
          <div>
            <strong>GrainFlow</strong>
            <small>iPDS MANAGEMENT</small>
          </div>
          <button
            className="icon-button sidebar-close"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileMenu(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <span className="status-dot" />
            <div>
              <strong>Inventory workspace</strong>
              <small>Connected interface</small>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={18} />
            {loggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <button
            className="icon-button mobile-menu-button"
            onClick={() => setMobileMenu(true)}
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>

          <div className="topbar-context">
            <span className="topbar-label">PUBLIC DISTRIBUTION SYSTEM</span>
            <strong>Inventory Control Centre</strong>
          </div>

          <div className="topbar-user">
            <div className="user-avatar">
              {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <strong>{user?.name || user?.email || "User"}</strong>
              <span>{(user?.role || "user").replaceAll("_", " ")}</span>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>

        <footer className="app-footer">
          <span>GrainFlow · iPDS Inventory Management</span>
          <span>FIFO-based stock allocation</span>
        </footer>
      </div>
    </div>
  );
}
