import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import DevicesPage from "../pages/DevicesPage"
import DeviceDetailsPage from "../pages/DeviceDetailsPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import VerifyCodePage from "../pages/VerifyCodePage";
import ResetPasswordPage from "../pages/ResetPasswordPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/devices" element={<DevicesPage />} />
      <Route path="/devices/:id" element={<DeviceDetailsPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-code" element={<VerifyCodePage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
  );
}

export default AppRoutes;