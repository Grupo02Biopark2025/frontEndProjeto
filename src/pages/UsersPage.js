import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import UserList from "../components/UserList";
import "../styles/UsersPage.css";

function UsersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="users-page">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="content">
        <UserList />
      </div>
    </div>
  );
}

export default UsersPage;