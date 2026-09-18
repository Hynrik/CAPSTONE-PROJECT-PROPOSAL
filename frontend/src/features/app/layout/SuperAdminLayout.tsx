import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function SuperAdminLayout() {
  return (
    <div className="d-flex">
      <Sidebar />

      <div className="flex-grow-1 p-3 bg-light">
        <Outlet />
      </div>
    </div>
  );
}