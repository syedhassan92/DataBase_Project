import axios from 'axios';
import { mockData, getItemById, getStatistics } from './mockDataService';

// Create axios instance with base configuration (for future real API calls)
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token (if needed)
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.error('Access forbidden:', errorMessage);
    } else if (error.response?.status >= 500) {
      console.error('Server error:', errorMessage);
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

// Helper function to simulate async API calls with delay
const mockApiCall = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return data;
};

const apiService = {
  get: (endpoint, params = {}) => api.get(endpoint, { params }),
  post: (endpoint, data) => api.post(endpoint, data),
  put: (endpoint, data) => api.put(endpoint, data),
  patch: (endpoint, data) => api.patch(endpoint, data),
  delete: (endpoint) => api.delete(endpoint),
  
  leagues: {
    getAll: async (params = {}) => await mockApiCall(mockData.leagues),
    getById: async (id) => await mockApiCall(getItemById('leagues', id)),
    create: (data) => api.post('/leagues', data),
    update: (id, data) => api.put(`/leagues/${id}`, data),
    delete: (id) => api.delete(`/leagues/${id}`),
    getStandings: async (id) => await mockApiCall({ leagueId: id, standings: mockData.teams.filter(t => t.league === id) }),
    getMatches: async (id) => await mockApiCall(mockData.matches.filter(m => m.tournament === id)),
    getTopPerformers: async (id) => await mockApiCall(mockData.players.slice(0, 5)),
  },
  
  tournaments: {
    getAll: async (params = {}) => await mockApiCall(mockData.tournaments),
    getById: async (id) => await mockApiCall(getItemById('tournaments', id)),
    create: (data) => api.post('/tournaments', data),
    update: (id, data) => api.put(`/tournaments/${id}`, data),
    delete: (id) => api.delete(`/tournaments/${id}`),
    getBracket: async (id) => await mockApiCall({ tournament: id, bracket: [] }),
    getMatches: async (id) => await mockApiCall(mockData.matches),
  },
  
  teams: {
    getAll: async (params = {}) => await mockApiCall(mockData.teams),
    getById: async (id) => await mockApiCall(getItemById('teams', id)),
    create: (data) => api.post('/teams', data),
    update: (id, data) => api.put(`/teams/${id}`, data),
    delete: (id) => api.delete(`/teams/${id}`),
    getPlayers: async (id) => await mockApiCall(mockData.players.filter(p => p.team === id)),
    getMatches: async (id) => await mockApiCall(mockData.matches.filter(m => m.homeTeam === id || m.awayTeam === id)),
    getStatistics: async (id) => {
      const team = getItemById('teams', id);
      return await mockApiCall(team ? { wins: team.wins, losses: team.losses, draws: team.draws } : {});
    },
  },
  
  players: {
    getAll: async (params = {}) => await mockApiCall(mockData.players),
    getById: async (id) => await mockApiCall(getItemById('players', id)),
    create: (data) => api.post('/players', data),
    update: (id, data) => api.put(`/players/${id}`, data),
    delete: (id) => api.delete(`/players/${id}`),
    getStatistics: async (id) => {
      const player = getItemById('players', id);
      return await mockApiCall(player ? { goals: player.goals, assists: player.assists, appearances: player.appearances } : {});
    },
    getMatchHistory: async (id) => await mockApiCall(mockData.matches.slice(0, 5)),
    transfer: (id, data) => api.post(`/players/${id}/transfer`, data),
  },
  
  venues: {
    getAll: async (params = {}) => await mockApiCall(mockData.venues),
    getById: async (id) => await mockApiCall(getItemById('venues', id)),
    create: (data) => api.post('/venues', data),
    update: (id, data) => api.put(`/venues/${id}`, data),
    delete: (id) => api.delete(`/venues/${id}`),
    getMatches: async (id) => await mockApiCall(mockData.matches.filter(m => m.venue === id)),
    getStatistics: async (id) => await mockApiCall({ venueId: id, totalMatches: 50, capacity: 74310 }),
  },
  
  matches: {
    getAll: async (params = {}) => await mockApiCall(mockData.matches),
    getById: async (id) => await mockApiCall(getItemById('matches', id)),
    create: (data) => api.post('/matches', data),
    update: (id, data) => api.put(`/matches/${id}`, data),
    delete: (id) => api.delete(`/matches/${id}`),
    updateResult: (id, data) => api.patch(`/matches/${id}/result`, data),
    getLineup: async (id) => await mockApiCall({ matchId: id, homeLineup: [], awayLineup: [] }),
    updateLineup: (id, data) => api.put(`/matches/${id}/lineup`, data),
    getEvents: async (id) => await mockApiCall([]),
    addEvent: (id, data) => api.post(`/matches/${id}/events`, data),
  },
  
  statistics: {
    getOverall: async () => await mockApiCall(getStatistics()),
    getLeague: async (leagueId) => await mockApiCall({ league: leagueId, stats: {} }),
    getTournament: async (tournamentId) => await mockApiCall({ tournament: tournamentId, stats: {} }),
    getTopScorers: async (params = {}) => await mockApiCall(
      mockData.players.sort((a, b) => b.goals - a.goals).slice(0, 10)
    ),
    getTopAssists: async (params = {}) => await mockApiCall(
      mockData.players.sort((a, b) => b.assists - a.assists).slice(0, 10)
    ),
    getBestRatings: async (params = {}) => await mockApiCall(mockData.players.slice(0, 10)),
    getTeamComparison: async (teamIds) => await mockApiCall([]),
    getPlayerComparison: async (playerIds) => await mockApiCall([]),
  },
  
  transfers: {
    getAll: async () => await mockApiCall(mockData.playerTransfers),
    getById: async (id) => await mockApiCall(getItemById('playerTransfers', id)),
  },
  
  reports: {
    generate: async (type, params) => await mockApiCall({ type, params }),
    download: (type, params) => {
      return api.get(`/reports/${type}/download`, { 
        params,
        responseType: 'blob'
      });
    },
  },
  
  search: {
    global: async (query) => await mockApiCall([]),
    teams: async (query) => await mockApiCall(mockData.teams.filter(t => t.name.toLowerCase().includes(query.toLowerCase()))),
    players: async (query) => await mockApiCall(mockData.players.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))),
    matches: async (query) => await mockApiCall(mockData.matches),
  },
};

export default apiService;
