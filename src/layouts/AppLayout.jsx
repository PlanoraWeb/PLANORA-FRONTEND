import { useState } from "react";
import Sidebar from "../components/SideBar";
import Navbar from "../components/NavBar";
import ChatWidget from "../components/ChatWidget";

function AppLayout({ children }) {

  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  return (
    <div className="app-layout">

      <Sidebar user={user} />

      <main className="app-main">
        <Navbar />

        <div className="app-content">
          {children}
        </div>
      </main>

      <ChatWidget />
    </div>
  );
}

export default AppLayout;