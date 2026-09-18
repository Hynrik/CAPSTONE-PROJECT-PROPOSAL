import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="layout-root">
      <Sidebar />
      <main className="main-content">
        <div className="page-shell app-workspace">
          <Outlet />
        </div>
      </main>
    </div>
  );
}