import React, { useEffect, useState } from "react";
import {
  Check,
  X,
  Clock,
  Mail,
  Calendar,
  ExternalLink,
  Loader2,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, getAuthHeaders } from "../config/api";

const Startups = () => {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ Fetch all startup applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.ADMIN_STARTUPS}?limit=200`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch applications");
      setApplications(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // ✅ Approve / Reject API call
  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const endpoint = newStatus === "approved" 
        ? API_ENDPOINTS.APPROVE_ONBOARDING(id)
        : API_ENDPOINTS.REJECT_ONBOARDING(id);
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");

      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      console.error(err);
      alert(err.message || "Status update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  // ✅ Delete startup
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this startup?"
    );
    if (!confirmDelete) return;

    try {
      setUpdatingId(id);
      const res = await fetch(`${API_ENDPOINTS.ADMIN_STARTUPS}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete startup");

      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete startup");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true;
    if (filter === "pending") return app.status === "onboarding_pending" || app.status === "changes_pending";
    if (filter === "approved") return app.status === "approved";
    if (filter === "rejected") return app.status === "rejected";
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "onboarding_pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "changes_pending":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <Check className="w-4 h-4" />;
      case "rejected":
        return <X className="w-4 h-4" />;
      case "onboarding_pending":
      case "changes_pending":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "onboarding_pending" || app.status === "changes_pending").length,
    approved: applications.filter((app) => app.status === "approved").length,
    rejected: applications.filter((app) => app.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
            Startup Registration Admin Panel
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Review, manage, and delete startup applications
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
            <div className="text-gray-500 text-xs sm:text-sm font-medium mb-1">
              Total Applications
            </div>
            <div className="text-xl sm:text-3xl font-bold text-gray-800">
              {stats.total}
            </div>
          </div>
          <div className="bg-yellow-50 p-4 sm:p-6 rounded-xl shadow border border-yellow-200">
            <div className="text-yellow-700 text-xs sm:text-sm font-medium mb-1">
              Pending Review
            </div>
            <div className="text-xl sm:text-3xl font-bold text-yellow-700">
              {stats.pending}
            </div>
          </div>
          <div className="bg-green-50 p-4 sm:p-6 rounded-xl shadow border border-green-200">
            <div className="text-green-700 text-xs sm:text-sm font-medium mb-1">
              Approved
            </div>
            <div className="text-xl sm:text-3xl font-bold text-green-700">
              {stats.approved}
            </div>
          </div>
          <div className="bg-red-50 p-4 sm:p-6 rounded-xl shadow border border-red-200">
            <div className="text-red-700 text-xs sm:text-sm font-medium mb-1">
              Rejected
            </div>
            <div className="text-xl sm:text-3xl font-bold text-red-700">
              {stats.rejected}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center sm:justify-start">
          {["all", "pending", "approved", "rejected"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition ${
                filter === type
                  ? type === "pending"
                    ? "bg-yellow-600 text-white"
                    : type === "approved"
                    ? "bg-green-600 text-white"
                    : type === "rejected"
                    ? "bg-red-600 text-white"
                    : "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Applications Grid */}
        {error ? (
          <div className="text-center text-red-600 bg-red-50 border border-red-200 py-4 rounded-xl">
            {error}
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <p className="text-gray-500 text-lg">No applications found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 sm:p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                      {app.company_name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {getStatusIcon(app.status)}
                      {app.status === "onboarding_pending" ? "Onboarding Pending" : 
                       app.status === "changes_pending" ? "Changes Pending" :
                       app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 text-sm sm:text-base line-clamp-2 sm:line-clamp-none">
                    {app.product_description || app.about_startup}
                  </p>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Applied:{" "}
                        {new Date(app.created_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 break-all">
                      <Mail className="w-4 h-4" />
                      <span>{app.founder_email}</span>
                    </div>
                    <div>
                      <span className="font-medium">Founder:</span>{" "}
                      {app.founder_name}
                    </div>
                  </div>
                </div>

                {/* ✅ Action Buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2 mt-4">
                  <button
                    onClick={() => handleStatusChange(app.id, "approved")}
                    disabled={app.status === "approved" || updatingId === app.id}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm sm:text-base transition ${
                      app.status === "approved"
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {updatingId === app.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Approve
                  </button>

                  <button
                    onClick={() => handleStatusChange(app.id, "rejected")}
                    disabled={app.status === "rejected" || updatingId === app.id}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm sm:text-base transition ${
                      app.status === "rejected"
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {updatingId === app.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    Reject
                  </button>

                  <button
                    onClick={() => navigate(`/startup-profile/${app.id}`)}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm sm:text-base bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </button>

                  {/* 🗑️ Delete */}
                  <button
                    onClick={() => handleDelete(app.id)}
                    disabled={updatingId === app.id}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm sm:text-base bg-gray-800 text-white hover:bg-black transition"
                  >
                    {updatingId === app.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Startups;
