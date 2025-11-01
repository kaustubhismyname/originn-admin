import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Users from "./components/Users";
import Startups from "./components/Startups";
import StartupProfile from "./components/StartupProfile";
import Campaigns from "./components/Campaigns";
import Content from "./components/Content";
import Transactions from "./components/Transactions";
import Analytics from "./components/Analytics";
import ProductDetails from "./components/ProductDetails";
import AllStartupsPage from "./components/AllStartups";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Admin routes - Protected */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="startups" element={<Startups />} />

          {/* All startups listing */}
          <Route path="startup-profile" element={<AllStartupsPage />} />

          {/* Single startup profile with dynamic ID */}
          <Route
            path="startup-profile/:startupId"
            element={<StartupProfile />}
          />
          <Route path="/startup/:id" element={<ProductDetails />} />




          <Route path="campaigns" element={<Campaigns />} />
          <Route path="content" element={<Content />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="products/:id" element={<ProductDetails />} />
        </Route>

        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <h1 className="text-3xl font-bold text-red-600">404 - Page Not Found</h1>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
