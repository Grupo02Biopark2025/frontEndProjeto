import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import DeviceList from "../components/DeviceList";
import "../styles/DevicesPage.css";

function DevicesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="devices-page">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="content">
        <DeviceList />
      </div>
    </div>
  );
}

export default DevicesPage;