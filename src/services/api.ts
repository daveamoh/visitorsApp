import axios from 'axios';

// Create an Axios instance with default config
const api = axios.create({
  // Replace with your API base URL
  baseURL: 'http://localhost:3001/visit',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    // Add any default headers here
  },
});

// Request interceptor for adding auth token if available
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = await AsyncStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (401, 403, 500, etc.)
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);
      
      // Handle specific status codes
      if (error.response.status === 401) {
        // Handle unauthorized error (e.g., redirect to login)
        console.error('Unauthorized access - please login again');
      } else if (error.response.status === 404) {
        console.error('Resource not found');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response from server. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Visitor API calls
export const visitorApi = {
  // Get all active visits
  getActiveVisits: () => {
    return api.get('/active');
  },

  // Get All Visit Not Checked Out
  getAllVisitNotCheckedOut: () => {
    return api.get('/opened');
  },

  // Check in a visitor
  checkInVisitor: (visitorData: any) => {
    return api.post('/check-in', visitorData);
  },

  // Check out a visitor
  checkOutVisitor: (visitId: string) => {
    return api.put(`/checkout/${visitId}`);
  },

  // Get visit history
  getVisitHistory: (params = {}) => {
    return api.get('/history', { params });
  },
};

export default api;
