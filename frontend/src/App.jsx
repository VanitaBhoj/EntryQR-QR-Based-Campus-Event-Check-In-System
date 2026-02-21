import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import ScannerPage from "./pages/ScannerPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import ParticipantQRPage from "./pages/ParticipantQRPage.jsx";

function Layout({ children }) {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Event QR Check-In System</h1>
        <nav>
          <Link to="/scanner">Scanner</Link>
          <Link to="/admin">Admin</Link>
          <Link to="/participant">My QR</Link>
        </nav>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/participant" element={<ParticipantQRPage />} />
      </Routes>
    </Layout>
  );
}

