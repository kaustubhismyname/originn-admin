import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Check, X, Building2, Globe, Linkedin, Instagram, Twitter, Users, Loader2 
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

export default function StartupProfile({ onBack }) {
  const { startupId } = useParams(); 
  const navigate = useNavigate();

  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    fetchStartupDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startupId]);

  const fetchStartupDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        API_ENDPOINTS.ADMIN_STARTUP_BY_ID(startupId),
        {
          headers: getAuthHeaders(),
        }
      );
      const result = await res.json();

      if (res.ok && result.data) {
        setStartup(result.data);
      } else {
        setError(result.message || 'Startup not found');
      }
    } catch (error) {
      console.error('Error fetching startup:', error);
      setError('Failed to fetch startup details.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      setStatusMessage(null);

      const endpoint = newStatus === 'approved' 
        ? API_ENDPOINTS.APPROVE_ONBOARDING(startupId)
        : API_ENDPOINTS.REJECT_ONBOARDING(startupId);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (response.ok) {
        setStartup({ ...startup, status: newStatus });
        setStatusMessage({ type: 'success', text: `Status updated to ${newStatus}!` });
      } else {
        setStatusMessage({ type: 'error', text: result.message || 'Failed to update status' });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setStatusMessage({ type: 'error', text: 'Failed to update status. Please try again.' });
    } finally {
      setUpdating(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading startup details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !startup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2 text-red-500">Error</h2>
          <p className="text-gray-600">{error || 'Startup not found'}</p>
          <button 
            onClick={onBack ? onBack : () => navigate(-1)}
            className="mt-6 flex items-center gap-2 justify-center w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to All Startups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button 
            onClick={onBack ? onBack : () => navigate(-1)}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to All Startups
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Message */}
        {statusMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            statusMessage.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {statusMessage.text}
          </div>
        )}

        {/* Cover Photo */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="h-64 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
            {startup.cover_photo ? (
              <img 
                src={startup.cover_photo} 
                alt={startup.company_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Building2 className="w-24 h-24 text-white opacity-50" />
              </div>
            )}
          </div>

          {/* Company Header */}
          <div className="px-8 py-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-start gap-6">
                <div className="w-32 h-32 -mt-20 rounded-2xl bg-white shadow-xl flex items-center justify-center border-4 border-white">
                  {startup.logo ? (
                    <img 
                      src={startup.logo} 
                      alt={startup.company_name}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <Building2 className="w-16 h-16 text-indigo-600" />
                  )}
                </div>

                <div className="pt-4">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{startup.company_name}</h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      startup.status === 'approved' 
                        ? 'bg-green-500 text-white' 
                        : startup.status === 'rejected'
                        ? 'bg-red-500 text-white'
                        : 'bg-yellow-500 text-white'
                    }`}>
                      {startup.status.toUpperCase()}
                    </span>
                    <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                      {startup.category}
                    </span>
                    {startup.product_type && (
                      <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {startup.product_type}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 lg:mt-0">
                <button
                  onClick={() => updateStatus('approved')}
                  disabled={updating || startup.status === 'approved'}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Check className="w-5 h-5" />
                  {updating ? 'Updating...' : 'Approve'}
                </button>
                <button
                  onClick={() => updateStatus('rejected')}
                  disabled={updating || startup.status === 'rejected'}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <X className="w-5 h-5" />
                  {updating ? 'Updating...' : 'Reject'}
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100 flex-wrap">
              {startup.company_website && (
                <a href={startup.company_website} target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition">
                  <Globe className="w-5 h-5" />
                  <span className="text-sm font-medium">Website</span>
                </a>
              )}
              {startup.social_links?.linkedin && (
                <a href={startup.social_links.linkedin} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
                  <Linkedin className="w-5 h-5" />
                  <span className="text-sm font-medium">LinkedIn</span>
                </a>
              )}
              {startup.social_links?.instagram && (
                <a href={startup.social_links.instagram} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition">
                  <Instagram className="w-5 h-5" />
                  <span className="text-sm font-medium">Instagram</span>
                </a>
              )}
              {startup.social_links?.twitter && (
                <a href={startup.social_links.twitter} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 text-gray-600 hover:text-blue-400 transition">
                  <Twitter className="w-5 h-5" />
                  <span className="text-sm font-medium">Twitter</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed">{startup.about_startup}</p>
            </div>

            {/* Product Description */}
            {startup.product_description && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
                <p className="text-gray-600 leading-relaxed">{startup.product_description}</p>
              </div>
            )}

            {/* Founders */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Founders</h2>
              {startup.founders?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {startup.founders.map((founder, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition">
                      <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        {founder.photo ? (
                          <img src={founder.photo} alt={founder.full_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <Users className="w-8 h-8 text-indigo-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{founder.full_name}</h3>
                        <p className="text-sm text-indigo-600 font-medium">{founder.designation}</p>
                        <p className="text-sm text-gray-500 mt-1">{founder.institution}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500">No founders listed.</p>}
            </div>

            {/* Team */}
            {startup.team?.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Members</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {startup.team.map((member, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition">
                      <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        {member.photo ? (
                          <img src={member.photo} alt={member.full_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <Users className="w-8 h-8 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{member.full_name}</h3>
                        <p className="text-sm text-purple-600 font-medium">{member.designation}</p>
                        <p className="text-sm text-gray-500 mt-1">{member.institution}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Info</h2>
              <div className="space-y-4">
                {startup.founder_email && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Founder Email</p>
                    <p className="font-semibold text-gray-900">{startup.founder_email}</p>
                  </div>
                )}
                {startup.registration_no && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Registration No.</p>
                    <p className="font-semibold text-gray-900">{startup.registration_no}</p>
                  </div>
                )}
                {startup.institute_name && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Institute</p>
                    <p className="font-semibold text-gray-900">{startup.institute_name}</p>
                  </div>
                )}
                {startup.stage && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Stage</p>
                    <p className="font-semibold text-gray-900">{startup.stage}</p>
                  </div>
                )}
                {startup.address && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Address</p>
                    <p className="font-semibold text-gray-900">{startup.address}</p>
                  </div>
                )}
                {startup.target_market && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Target Market</p>
                    <p className="font-semibold text-gray-900">{startup.target_market}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created At</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(startup.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(startup.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <span className="text-gray-600">Founders</span>
                  <span className="font-bold text-indigo-600">{startup.founders?.length || 0}</span>
                </div>
                {startup.team_members && (
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-600">Team Size</span>
                    <span className="font-bold text-purple-600">{startup.team_members}</span>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-600">Team Members Listed</span>
                  <span className="font-bold text-green-600">{startup.team?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
