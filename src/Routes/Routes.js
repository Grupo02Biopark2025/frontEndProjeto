import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import DevicesPage from "../pages/DevicesPage"
import DeviceDetailsPage from "../pages/DeviceDetailsPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import VerifyCodePage from "../pages/VerifyCodePage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import DeviceLogsPage from "../pages/DeviceLogsPage";
import UsersPage from "../pages/UsersPage";
import UserDetailPage from "../pages/UserDetailPage";
import AddUserPage from "../pages/AddUserPage";
import EditUserPage from "../pages/EditUserPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<HomePage />} />
      <Route path="/devices" element={<DevicesPage />} />
      <Route path="/devices/:id" element={<DeviceDetailsPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-code" element={<VerifyCodePage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/devices/:id/logs" element={<DeviceLogsPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/users/:id" element={<UserDetailPage />} />
      <Route path="/users/add" element={<AddUserPage />} />
      <Route path="/users/:id/edit" element={<EditUserPage />} />
    </Routes>
  );
}

export default AppRoutes;