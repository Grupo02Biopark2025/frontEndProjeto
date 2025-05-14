import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import DevicesPage from "../pages/DevicesPage"
import DeviceDetailsPage from "../pages/DeviceDetailsPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/devices" element={<DevicesPage />} />
      <Route path="/devices/:id" element={<DeviceDetailsPage />} />
    </Routes>
  );
}

export default AppRoutes;