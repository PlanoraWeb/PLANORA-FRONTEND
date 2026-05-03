import "../styles/App.css"
import logo from "../assets/ikon.png";
import "../styles/Component.css"
import { FiInbox, FiCheckSquare, FiArchive, FiMoreVertical, FiAnchor, FiBox } from "react-icons/fi";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdAlignHorizontalLeft } from "react-icons/md";
import { IoIosTime } from "react-icons/io";
import { RiTeamLine } from "react-icons/ri";
import { TbReportSearch } from "react-icons/tb";
import { IoSettingsSharp } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useState } from "react";
import { logoutRequest } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { MdOutlineLogout } from "react-icons/md";
import { useLocation } from "react-router-dom";

function Sidebar({user}) {
  const displayName = user ? `${user.firstName} ${user.lastName}` : "Loading...";
  // console.log("USER:", user);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
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

  return (
    <aside className="app-sidebar">
      <Link to="/dashboard" className="sidebar-logo">
        <img src={logo} alt="Planora" className="sidebar-logo-img" />
        <span>Planora</span>
      </Link>

      <nav className="sidebar-nav">

        {/* Workspace */}
        <div className="sidebar-section">
          <span className="sidebar-label">Workspace</span>

          <Link to="/dashboard" className={`sidebar-link ${isActive("/dashboard") ? "active" : ""}`}>
            <FiBox size={16} />
            <span>Overview</span>
          </Link>

          <Link to="/inbox" className={`sidebar-link ${isActive("/inbox") ? "active" : ""}`}>
            <FiInbox size={16} />
            <span>Inbox</span>
          </Link>

          <Link to="/tasks" className={`sidebar-link ${isActive("/tasks") ? "active" : ""}`}>
            <FiCheckSquare size={16} />
            <span>My Tasks</span>
          </Link>
        </div>

        {/* Projects */}
        <div className="sidebar-section">
          <span className="sidebar-label">Projects</span>

          <Link to="/projects" className={`sidebar-link ${isActive("/projects") ? "active" : ""}`}>
            <FiArchive size={16} />
            <span>All Projects</span>
          </Link>

  

          <Link to="/board" className={`sidebar-link ${isActive("/board") ? "active" : ""}`}>
            <LuLayoutDashboard />
            <span>Board</span>
          </Link>

          <Link to="/backlog" className={`sidebar-link ${isActive("/backlog") ? "active" : ""}`}>
            <MdAlignHorizontalLeft size={16} />
            <span>Backlog</span>
          </Link>

          <Link to="/sprint" className={`sidebar-link ${isActive("/sprint") ? "active" : ""}`}>
            <IoIosTime size={16} />
            <span>Sprints</span>
          </Link>

        </div>

        {/* Organization */}
        <div className="sidebar-section">
          <span className="sidebar-label">Organization</span>

          <Link to="/team" className={`sidebar-link ${isActive("/team") ? "active" : ""}`}>
            <RiTeamLine size={16} />
            <span>Team</span>
          </Link>

          <Link to="/reports" className={`sidebar-link ${isActive("/reports") ? "active" : ""}`}>
            <TbReportSearch size={16} />
            <span>Reports</span>
          </Link>

          <Link to="/settings" className={`sidebar-link ${isActive("/settings") ? "active" : ""}`}>
            <IoSettingsSharp size={16} />
            <span>Settings</span>
          </Link>
        </div>

      </nav>
      {/*BURAYA KULLNICI BİLGİLERİ GELECEK*/}
      <div className="sidebar-user" onClick={() => setOpen(!open)}>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{displayName}</div>
          <div className="sidebar-user-email">{user?.email}</div>
        </div>

        {open && (
          <div className="user-dropdown">
            <button className="logout-btn" onClick={handleLogout} >
              <span>Logout</span>
              <MdOutlineLogout size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;