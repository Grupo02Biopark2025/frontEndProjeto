import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "../styles/Home.css";

function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="home-container">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="content">
        <div className="main-content">
          <h1>Bem-vindo ao CorpSync</h1>
          <p>Selecione uma opção no menu lateral.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;