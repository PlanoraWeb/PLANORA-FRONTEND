import "../styles/App.css";
import "../styles/DesignSystem.css";
import { useNavigate, useLocation } from "react-router-dom";
import { FiBell, FiHelpCircle, FiMenu, FiSearch, FiSidebar } from "react-icons/fi";
import Button from "../components/Button";
import { useOsShortcut } from "../hooks/useOsShortcut";

const PAGE_TITLES = {
  "/dashboard": "Overview",
  "/inbox": "Inbox",
  "/tasks": "My Tasks",
  "/projects": "Projects",
  "/board": "Board",
  "/backlog": "Backlog",
  "/sprint": "Sprints",
  "/team": "Team",
  "/reports": "Reports",
  "/settings": "Settings",
};

function Navbar({ user, onToggleSidebar, sidebarCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const shortcut = useOsShortcut();
  const title = PAGE_TITLES[location.pathname] || "Planora";

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <button className="navbar-toggle" type="button" onClick={onToggleSidebar}>
          {sidebarCollapsed ? <FiMenu size={18} /> : <FiSidebar size={18} />}
        </button>

        <div className="navbar-heading">
          <span className="navbar-section-kicker">Workspace</span>
          <strong>{title}</strong>
        </div>
      </div>

      <div className="navbar-search">
        <FiSearch />
        <input type="text" placeholder={`Search across work (${shortcut})`} />
      </div>

      <div className="navbar-actions">
        <div className="navbar-mini-user">
          <span className="navbar-mini-user-label">Signed in as</span>
          <strong>{user?.firstName || "Planora"}</strong>
        </div>

        <button className="navbar-btn" title="Notifications">
          <FiBell size={18} />
          <span className="dot"></span>
        </button>

        <button className="navbar-btn" title="Help">
          <FiHelpCircle size={18} />
        </button>

        <Button onClick={() => navigate("/create-issue")} className="btn btn-primary btn-sm">
          + New Issue
        </Button>
      </div>
    </header>
  );
}

export default Navbar;
