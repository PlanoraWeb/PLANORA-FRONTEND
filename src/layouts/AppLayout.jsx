import Sidebar from "../components/SideBar";
import Navbar from "../components/NavBar";
import {useState } from "react";

function AppLayout({ children }) {
  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error("JSON ayrıştırma hatası:", error);
        return null;
      }
    }
    return null;
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

    </div>
  );
}

export default AppLayout;