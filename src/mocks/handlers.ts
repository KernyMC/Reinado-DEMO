
/** MOCK ONLY - These are mock API handlers for development */

// Mock Service Worker handlers for API simulation
export const handlers = [
  // Auth endpoints
  {
    method: 'POST',
    url: '/api/auth/login',
    response: { token: 'mock-jwt-token', user: {} }
  },
  {
    method: 'POST', 
    url: '/api/auth/register',
    response: { token: 'mock-jwt-token', user: {} }
  },
  
  // Candidates endpoints
  {
    method: 'GET',
    url: '/api/candidates',
    response: { candidates: [] }
  },
  {
    method: 'POST',
    url: '/api/candidates',
    response: { candidate: {} }
  },
  
  // Votes endpoints
  {
    method: 'POST',
    url: '/api/votes',
    response: { success: true }
  },
  {
    method: 'GET',
    url: '/api/votes/results',
    response: { results: [] }
  },
  
  // Judge scores endpoints
  {
    method: 'POST',
    url: '/api/scores',
    response: { success: true }
  },
  {
    method: 'GET',
    url: '/api/scores/:eventType',
    response: { scores: [] }
  },
  
  // Events endpoints
  {
    method: 'GET',
    url: '/api/events',
    response: { events: [] }
  },
  {
    method: 'PUT',
    url: '/api/events/:id/status',
    response: { success: true }
  },
  
  // Users endpoints  
  {
    method: 'GET',
    url: '/api/users',
    response: { users: [] }
  },
  {
    method: 'PUT',
    url: '/api/users/:id',
    response: { user: {} }
  },
  
  // Reports endpoints
  {
    method: 'POST',
    url: '/api/reports/generate',
    response: { reportUrl: 'mock-report-url' }
  },
  
  // Settings endpoints
  {
    method: 'GET',
    url: '/api/settings',
    response: { settings: {} }
  },
  {
    method: 'PUT',
    url: '/api/settings',
    response: { success: true }
  }
];
