const API_DEV_URL = 'https://monthly-mechanisms-messaging-idol.trycloudflare.com/api/v1';
const API_BASE_URL = API_DEV_URL || 'http://51.21.150.36:8000/api/v1';

export const API_ENDPOINTS = {
  ADMIN_LOGIN: `${API_BASE_URL}/admin/login`,
  ADMIN_STARTUPS: `${API_BASE_URL}/admin/startups`,
  ADMIN_STARTUPS_SUMMARY: `${API_BASE_URL}/admin/startups/summary`,
  ADMIN_STARTUP_BY_ID: (id) => `${API_BASE_URL}/admin/startups/${id}`,
  APPROVE_ONBOARDING: (id) => `${API_BASE_URL}/admin/startups/${id}/approve-onboarding`,
  REJECT_ONBOARDING: (id) => `${API_BASE_URL}/admin/startups/${id}/reject-onboarding`,
  // Add more endpoints here as we integrate them
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {  
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export default API_BASE_URL;
