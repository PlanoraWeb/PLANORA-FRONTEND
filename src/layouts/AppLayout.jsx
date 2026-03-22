import Sidebar from "../components/SideBar";
import Navbar from "../components/NavBar";

function AppLayout({ children }) {
  return (
    <div className="app-layout">

      <Sidebar />

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