import "../styles/App.css";
import "../styles/Component.css";
import logo from "../assets/ikon.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { logoutRequest } from "../services/authService";
import {
  FiArchive,
  FiCheckSquare,
  FiFolder,
  FiInbox,
  FiLogOut,
  FiSettings,
  FiTarget,
  FiUsers,
} from "react-icons/fi";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdAlignHorizontalLeft } from "react-icons/md";
import { IoIosTime } from "react-icons/io";

const SECTIONS = [
  {
    label: "Workspace",
    items: [
      { to: "/dashboard", label: "Overview", icon: LuLayoutDashboard },
      { to: "/inbox", label: "Inbox", icon: FiInbox },
      { to: "/tasks", label: "My Tasks", icon: FiCheckSquare },
    ],
  },
  {
    label: "Delivery",
    items: [
      { to: "/projects", label: "All Projects", icon: FiFolder },
      { to: "/board", label: "Board", icon: LuLayoutDashboard },
      { to: "/backlog", label: "Backlog", icon: MdAlignHorizontalLeft },
      { to: "/sprint", label: "Sprints", icon: IoIosTime },
    ],
  },
  {
    label: "Organization",
    items: [
      { to: "/team", label: "Team", icon: FiUsers },
      { to: "/reports", label: "Reports", icon: FiTarget },
      { to: "/settings", label: "Settings", icon: FiSettings },
    ],
  },
];

function Sidebar({ user, collapsed = false, mobileOpen = false, onCloseMobile }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const displayName = user ? `${user.firstName} ${user.lastName}` : "Workspace";
  const initials = useMemo(() => {
    if (!user) return "PL";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  }, [user]);

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch (err) {
      console.log("logout error", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const handleNavigate = () => {
    setUserMenuOpen(false);
    if (window.innerWidth <= 960) {
      onCloseMobile?.();
    }
  };

  return (
    <aside
      className={`app-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
    >
      <div className="sidebar-top">
        <Link to="/dashboard" className="sidebar-logo" onClick={handleNavigate}>
          <img src={logo} alt="Planora" className="sidebar-logo-img" />
          <div className="sidebar-brand-copy">
            <span className="sidebar-brand-name">Planora</span>
            <span className="sidebar-brand-subtitle">Delivery Workspace</span>
          </div>
        </Link>

        <div className="sidebar-workspace-card">
          <div className="sidebar-workspace-copy">
            <span className="sidebar-workspace-label">Current space</span>
            <strong>{user?.role?.name || "Product team"}</strong>
          </div>
          <div className="sidebar-workspace-pill">Live</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {SECTIONS.map((section) => (
          <div className="sidebar-section" key={section.label}>
            <span className="sidebar-label">{section.label}</span>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`sidebar-link ${isActive(item.to) ? "active" : ""}`}
                  onClick={handleNavigate}
                >
                  <span className="sidebar-link-icon">
                    <Icon size={18} />
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-user-shell">
        <button
          className="sidebar-user"
          type="button"
          onClick={() => setUserMenuOpen((current) => !current)}
        >
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{displayName}</div>
            <div className="sidebar-user-email">{user?.email}</div>
          </div>
        </button>

        {userMenuOpen && (
          <div className="user-dropdown">
            <button className="logout-btn" onClick={handleLogout}>
              <span>Logout</span>
              <FiLogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
