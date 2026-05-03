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



function Sidebar({user}) {
  const displayName = user ? `${user.firstName} ${user.lastName}` : "Loading...";

  return (
    <aside className="app-sidebar">
      <a href="/dashboard" className="sidebar-logo">
        <img src={logo} alt="Planora" className="sidebar-logo-img" />
        <span>Planora</span>
      </a>

      <nav className="sidebar-nav">

        {/* Workspace */}
        <div className="sidebar-section">
          <span className="sidebar-label">Workspace</span>

          <Link to="/dashboard" className="sidebar-link active">
            <FiBox size={16} />
            <span>Overview</span>
          </Link>

          <Link to="/inbox" className="sidebar-link">
            <FiInbox size={16} />
            <span>Inbox</span>
            {/*BURAYA BİLDİRİM SAYISI GELECEK*/}
            <span ></span>
          </Link>

          <Link to="/tasks" className="sidebar-link">
            <FiCheckSquare size={16} />
            <span>My Tasks</span>
          </Link>
        </div>

        {/* Projects */}
        <div className="sidebar-section">
          <span className="sidebar-label">Projects</span>

          <Link to="/projects" className="sidebar-link">
            <FiArchive size={16} />
            <span>All Projects</span>
          </Link>

  

          <Link to="/board" className="sidebar-link">
            <LuLayoutDashboard />
            <span>Board</span>
          </Link>

          <Link to="/backlog" className="sidebar-link">
            <MdAlignHorizontalLeft size={16} />
            <span>Backlog</span>
          </Link>

          <Link to="/sprint" className="sidebar-link">
            <IoIosTime size={16} />
            <span>Sprints</span>
          </Link>

        </div>

        {/* Organization */}
        <div className="sidebar-section">
          <span className="sidebar-label">Organization</span>

          <Link to="/team" className="sidebar-link">
            <RiTeamLine size={16} />
            <span>Team</span>
          </Link>

          <Link to="/reports" className="sidebar-link">
            <TbReportSearch size={16} />
            <span>Reports</span>
          </Link>

          <Link to="/settings" className="sidebar-link">
            <IoSettingsSharp size={16} />
            <span>Settings</span>
          </Link>
        </div>

      </nav>
      {/*BURAYA KULLNICI BİLGİLERİ GELECEK*/}
      <div className="sidebar-user">
        {/* <div className="avatar avatar-lg">AM</div> */}
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{displayName}</div>
          <div className="sidebar-user-email">{user?.email}</div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;