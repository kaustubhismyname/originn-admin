import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "User Management", path: "/users" },
    { name: "Startup Applications", path: "/startups" },
    { name: "Startup Profiles", path: "/startup-profile" },
    { name: "Campaign Management", path: "/campaigns" },
    { name: "Content Management", path: "/content" },
    { name: "Transactions", path: "/transactions" },
    { name: "Analytics", path: "/analytics" },
  ];

  const closeSidebar = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user');
    
    // Redirect to login
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 bg-[#6c3e26] text-white w-64 flex flex-col transition-transform duration-300 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#8b5c3c]">
          <h2 className="text-xl sm:text-2xl font-bold">Originn Admin</h2>
          <button
            className="md:hidden p-2 hover:bg-[#8b5c3c] rounded"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 sm:space-y-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `block px-3 sm:px-4 py-2 rounded hover:bg-[#8b5c3c] transition text-sm sm:text-base ${
                  isActive ? "bg-[#8b5c3c]" : ""
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar - Fixed */}
        <header className="flex items-center justify-between bg-white p-3 sm:p-4 shadow z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-700">
              Admin Panel
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 sm:px-4 py-2 rounded bg-[#6c3e26] hover:bg-[#8b5c3c] text-white text-sm sm:text-base transition"
          >
            Logout
          </button>
        </header>

        {/* Outlet for pages - Scrollable */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;