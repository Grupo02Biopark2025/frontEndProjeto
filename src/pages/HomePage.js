import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/Home.css";
import DashboardKPI from "./DashboardKPI";


function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="content">
        <h1>Bem-vindo ao CorpSync</h1>
        <p>Selecione uma opção no menu lateral.</p>
        <DashboardKPI />
      </div>

    </>
  );
}

export default HomePage;