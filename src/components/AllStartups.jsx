
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Loader2, Building2, Globe, Linkedin, Instagram, Twitter, Users, TrendingUp, Clock } from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

export default function AllStartupsPage() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProductType, setSelectedProductType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedTargetMarket, setSelectedTargetMarket] = useState('all');
  const [summary, setSummary] = useState({ total: 0, onboarding_pending: 0, changes_pending: 0, approved: 0 });
  const [pagination, setPagination] = useState({ next_cursor: null, has_next: false, limit: 50 });

  const navigate = useNavigate();

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchStartups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, selectedStage, selectedCategory, selectedProductType, selectedTargetMarket]);

  const fetchSummary = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN_STARTUPS_SUMMARY, {
        headers: getAuthHeaders(),
      });
      const result = await res.json();
      if (res.ok && result.data) {
        setSummary(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  const fetchStartups = async (cursor = null, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setStartups([]);
      }
      setError(null);
      
      // Build query params
      const params = new URLSearchParams();
      params.append('limit', '50');
      
      if (cursor) {
        params.append('cursor', cursor);
      }
      
      if (activeSearchTerm) {
        params.append('search_text', activeSearchTerm);
      }
      
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      if (selectedStage !== 'all') {
        params.append('stage', selectedStage);
      }
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (selectedProductType !== 'all') {
        params.append('product_type', selectedProductType);
      }
      if (selectedTargetMarket !== 'all') {
        params.append('target_market', selectedTargetMarket);
      }
      
      const url = `${API_ENDPOINTS.ADMIN_STARTUPS}?${params.toString()}`;
      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });
      const result = await res.json();

      if (res.ok && result.data) {
        if (append) {
          setStartups(prev => [...prev, ...result.data]);
        } else {
          setStartups(result.data);
        }
        setPagination(result.pagination || { next_cursor: null, has_next: false, limit: 50 });
      } else {
        setError(result.message || 'Failed to fetch startups');
      }
    } catch (error) {
      console.error('Error fetching startups:', error);
      setError('Failed to fetch startups. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination.has_next && pagination.next_cursor) {
      fetchStartups(pagination.next_cursor, true);
    }
  };

  const handleSearch = () => {
    const newSearchTerm = searchTerm.trim();
    if (newSearchTerm !== activeSearchTerm) {
      setActiveSearchTerm(newSearchTerm);
    }
  };

  // Refetch when activeSearchTerm changes (including when cleared)
  useEffect(() => {
    // Skip initial render where activeSearchTerm is empty string by default
    // Only fetch when it actually changes from user interaction
    const isInitialRender = activeSearchTerm === '' && startups.length === 0;
    if (!isInitialRender) {
      fetchStartups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSearchTerm]);

  // No local filtering needed - API does it all
  const displayedStartups = startups;
  const hasMoreToShow = pagination.has_next;

  // Extract unique values for filters
  const categories = [...new Set(startups.map(s => s.category).filter(Boolean))];
  const productTypes = [...new Set(startups.map(s => s.product_type).filter(Boolean))];
  const stages = [...new Set(startups.map(s => s.stage).filter(Boolean))];
  const targetMarkets = [...new Set(startups.map(s => s.target_market).filter(Boolean))];

  const statusCounts = {
    all: summary.total,
    onboarding_pending: summary.onboarding_pending,
    changes_pending: summary.changes_pending,
    approved: summary.approved,
    rejected: summary.total - (summary.onboarding_pending + summary.changes_pending + summary.approved),
  };

  if (loading) return <Loading />;
  if (error) return <ErrorComponent message={error} onRetry={fetchStartups} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Startup Dashboard</h1>
            <p className="text-gray-600">Manage and review all startup applications</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatusCard
            label="All Startups"
            count={statusCounts.all}
            icon={<Building2 className="w-6 h-6" />}
            color="bg-gradient-to-br from-slate-500 to-slate-600"
            active={selectedStatus === 'all'}
            onClick={() => setSelectedStatus('all')}
          />
          <StatusCard
            label="Onboarding Pending"
            count={statusCounts.onboarding_pending}
            icon={<Clock className="w-6 h-6" />}
            color="bg-gradient-to-br from-amber-500 to-orange-600"
            active={selectedStatus === 'onboarding_pending'}
            onClick={() => setSelectedStatus('onboarding_pending')}
          />
          <StatusCard
            label="Changes Pending"
            count={statusCounts.changes_pending}
            icon={<Clock className="w-6 h-6" />}
            color="bg-gradient-to-br from-yellow-500 to-amber-600"
            active={selectedStatus === 'changes_pending'}
            onClick={() => setSelectedStatus('changes_pending')}
          />
          <StatusCard
            label="Approved"
            count={statusCounts.approved}
            icon={<TrendingUp className="w-6 h-6" />}
            color="bg-gradient-to-br from-emerald-500 to-green-600"
            active={selectedStatus === 'approved'}
            onClick={() => setSelectedStatus('approved')}
          />
          <StatusCard
            label="Rejected"
            count={statusCounts.rejected}
            icon={<Building2 className="w-6 h-6" />}
            color="bg-gradient-to-br from-rose-500 to-red-600"
            active={selectedStatus === 'rejected'}
            onClick={() => setSelectedStatus('rejected')}
          />
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative md:col-span-2 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, description, founder..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium flex items-center gap-2 whitespace-nowrap"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
            
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white cursor-pointer transition"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedProductType}
                onChange={(e) => setSelectedProductType(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white cursor-pointer transition"
              >
                <option value="all">All Product Types</option>
                {productTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white cursor-pointer transition"
              >
                <option value="all">All Stages</option>
                {stages.map(stage => <option key={stage} value={stage}>{stage}</option>)}
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedTargetMarket}
                onChange={(e) => setSelectedTargetMarket(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white cursor-pointer transition"
              >
                <option value="all">All Markets</option>
                {targetMarkets.map(market => <option key={market} value={market}>{market}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Results Info - Show when filters or search are active */}
        {(activeSearchTerm || selectedCategory !== 'all' || selectedProductType !== 'all' || selectedStatus !== 'all' || selectedStage !== 'all' || selectedTargetMarket !== 'all') && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <p className="text-blue-900">
                Showing <span className="font-bold">{displayedStartups.length}</span> result{displayedStartups.length !== 1 ? 's' : ''}
                {activeSearchTerm && <span className="ml-1">for "<span className="font-semibold">{activeSearchTerm}</span>"</span>}
              </p>
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveSearchTerm('');
                setSelectedCategory('all');
                setSelectedProductType('all');
                setSelectedStatus('all');
                setSelectedStage('all');
                setSelectedTargetMarket('all');
              }}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Startups Grid */}
        {displayedStartups.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <Building2 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No startups found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedStartups.map(startup => (
                <StartupCard key={startup.id} startup={startup} onClick={() => navigate(`/startup-profile/${startup.id}`)} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreToShow && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      Load More Startups
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatusCard({ label, count, icon, color, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-6 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${color} ${
        active ? 'ring-4 ring-white shadow-2xl scale-105' : 'shadow-lg'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-left">
          <p className="text-white/80 text-sm font-medium mb-1">{label}</p>
          <p className="text-4xl font-bold">{count}</p>
        </div>
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
          {icon}
        </div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
    </button>
  );
}
function StartupCard({ startup, onClick }) {
    const [imageError, setImageError] = useState(false);
  
    const getStatusStyles = (status) => {
      switch (status) {
        case 'approved':
          return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'rejected':
          return 'bg-rose-100 text-rose-700 border-rose-200';
        case 'changes_pending':
          return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'onboarding_pending':
        default:
          return 'bg-amber-100 text-amber-700 border-amber-200';
      }
    };

    const formatStatus = (status) => {
      if (!status) return 'Pending';
      return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };
  
    return (
      <div
        onClick={onClick}
        className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-1"
      >
        {/* Cover Image */}
        <div className="h-48 bg-gray-200 relative overflow-hidden rounded-t-2xl">
          {startup.cover_photo && !imageError ? (
            <img
              src={startup.cover_photo}
              alt={startup.company_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-100 to-purple-100">
              <Building2 className="w-16 h-16 text-indigo-300" />
            </div>
          )}
          {/* Status Badge */}
          <span
            className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusStyles(
              startup.status
            )}`}
          >
            {formatStatus(startup.status)}
          </span>
        </div>
  
        {/* Logo & Details */}
        <div className="p-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200 flex items-center justify-center">
              {startup.logo ? (
                <img src={startup.logo} alt={startup.company_name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{startup.company_name || 'Unnamed Startup'}</h3>
              <p className="text-gray-500 text-sm line-clamp-2">{startup.about_startup || startup.short_description || 'No description available'}</p>
            </div>
          </div>
  
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {startup.category && (
              <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                {startup.category}
              </span>
            )}
            {startup.product_type && (
              <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                {startup.product_type}
              </span>
            )}
            {startup.stage && (
              <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {startup.stage}
              </span>
            )}
          </div>
  
          {/* Metrics & Socials */}
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <div className="flex items-center gap-3">
              {startup.team_members !== undefined && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> {startup.team_members}
                </div>
              )}
              {startup.founder_name && (
                <div className="flex items-center gap-1 text-gray-600">
                  <span className="font-medium">{startup.founder_name}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {startup.company_website && (
                <a 
                  href={startup.company_website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-indigo-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {startup.social_links?.linkedin && (
                <a 
                  href={startup.social_links.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-blue-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {startup.social_links?.instagram && (
                <a 
                  href={startup.social_links.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-pink-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {startup.social_links?.twitter && (
                <a 
                  href={startup.social_links.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-blue-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  function Loading() {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }
  
  function ErrorComponent({ message, onRetry }) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        )}
      </div>
    );
  }
  
