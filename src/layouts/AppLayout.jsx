import { useEffect, useState } from "react";
import Sidebar from "../components/SideBar";
import Navbar from "../components/NavBar";
import ChatWidget from "../components/ChatWidget";

function AppLayout({ children }) {
  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("planora-sidebar-collapsed") === "true";
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("planora-sidebar-collapsed", String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 960) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth <= 960) {
      setIsMobileSidebarOpen((current) => !current);
      return;
    }

    setIsSidebarCollapsed((current) => !current);
  };

  return (
    <div className={`app-layout ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        user={user}
        collapsed={isSidebarCollapsed}
        mobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {isMobileSidebarOpen && (
        <button
          className="sidebar-overlay"
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <main className="app-main">
        <Navbar
          user={user}
          sidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />

        <div className="app-content">
          {children}
        </div>
      </main>

      <ChatWidget />
    </div>
  );
}

export default AppLayout;
