import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
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
    const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'An error occurred';

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

const apiService = {
  get: (endpoint, params = {}) => api.get(endpoint, { params }),
  post: (endpoint, data) => api.post(endpoint, data),
  put: (endpoint, data) => api.put(endpoint, data),
  patch: (endpoint, data) => api.patch(endpoint, data),
  delete: (endpoint) => api.delete(endpoint),

  leagues: {
    getAll: (params = {}) => api.get('/leagues', { params }),
    getById: (id) => api.get(`/leagues/${id}`),
    create: (data) => api.post('/leagues', data),
    update: (id, data) => api.put(`/leagues/${id}`, data),
    delete: (id) => api.delete(`/leagues/${id}`),
    getStandings: (id) => api.get(`/stats/standings/${id}`),
    getMatches: (id) => api.get('/matches', { leagueId: id }),
    getTopPerformers: (id) => api.get('/stats/top-players', { limit: 5 }),
  },

  tournaments: {
    getAll: (params = {}) => api.get('/tournaments', { params }),
    getById: (id) => api.get(`/tournaments/${id}`),
    getTeams: (id) => api.get(`/tournaments/${id}/teams`),
    create: (data) => api.post('/tournaments', data),
    update: (id, data) => api.put(`/tournaments/${id}`, data),
    delete: (id) => api.delete(`/tournaments/${id}`),
    getBracket: (id) => api.get(`/tournaments/${id}/bracket`),
    getMatches: (id) => api.get('/matches', { tournamentId: id }),
  },

  teams: {
    getAll: (params = {}) => api.get('/teams', { params }),
    getById: (id) => api.get(`/teams/${id}`),
    getByLeague: (leagueId) => api.get(`/teams/league/${leagueId}`),
    getByTournament: (tournamentId) => api.get(`/teams/tournament/${tournamentId}`),
    create: (data) => api.post('/teams', data),
    update: (id, data) => api.put(`/teams/${id}`, data),
    delete: (id) => api.delete(`/teams/${id}`),
    getPlayers: (id) => api.get('/players', { teamId: id }),
    getMatches: (id) => api.get('/matches', { teamId: id }),
    getStatistics: (id) => api.get(`/teams/${id}/stats`),
  },

  players: {
    getAll: (params = {}) => api.get('/players', { params }),
    getById: (id) => api.get(`/players/${id}`),
    create: (data) => api.post('/players', data),
    update: (id, data) => api.put(`/players/${id}`, data),
    delete: (id) => api.delete(`/players/${id}`),
    getStatistics: (id) => api.get(`/players/${id}/stats`),
    getMatchHistory: (id) => api.get(`/players/${id}/matches`),
    transfer: (id, data) => api.post(`/players/${id}/transfer`, data),
  },

  venues: {
    getAll: (params = {}) => api.get('/venues', { params }),
    getById: (id) => api.get(`/venues/${id}`),
    create: (data) => api.post('/venues', data),
    update: (id, data) => api.put(`/venues/${id}`, data),
    delete: (id) => api.delete(`/venues/${id}`),
    getMatches: (id) => api.get('/matches', { venueId: id }),
    getStatistics: (id) => api.get(`/venues/${id}/stats`),
  },

  matches: {
    getAll: (params = {}) => api.get('/matches', { params }),
    getUpcomingMatches: () => api.get('/matches/upcoming'),
    getById: (id) => api.get(`/matches/${id}`),
    create: (data) => api.post('/matches', data),
    update: (id, data) => api.put(`/matches/${id}`, data),
    delete: (id) => api.delete(`/matches/${id}`),
    updateResult: (id, data) => api.patch(`/matches/${id}/result`, data),
    getLineup: (id) => api.get(`/matches/${id}/lineup`),
    updateLineup: (id, data) => api.put(`/matches/${id}/lineup`, data),
    getEvents: (id) => api.get(`/matches/${id}/events`),
    addEvent: (id, data) => api.post(`/matches/${id}/events`, data),
  },

  statistics: {
    getOverall: () => api.get('/stats/dashboard'),
    getLeague: (leagueId) => api.get(`/stats/league/${leagueId}`),
    getTournament: (tournamentId) => api.get(`/stats/tournament/${tournamentId}`),
    getTopScorers: (params = {}) => api.get('/stats/top-players', { params }),
    getTopAssists: (params = {}) => api.get('/stats/top-players', { params: { ...params, sortBy: 'assists' } }),
    getBestRatings: (params = {}) => api.get('/stats/top-players', { params }),
    getTeamComparison: (teamIds) => api.get('/stats/team-comparison', { teamIds }),
    getPlayerComparison: (playerIds) => api.get('/stats/player-comparison', { playerIds }),
  },

  coaches: {
    getAll: () => api.get('/coaches'),
    getById: (id) => api.get(`/coaches/${id}`),
    getByTeam: (teamId) => api.get('/coaches', { teamId }),
    create: (data) => api.post('/coaches', data),
    update: (id, data) => api.put(`/coaches/${id}`, data),
    delete: (id) => api.delete(`/coaches/${id}`),
  },

  referees: {
    getAll: () => api.get('/referees'),
    getById: (id) => api.get(`/referees/${id}`),
    getAvailable: () => api.get('/referees', { availabilityStatus: 'Available' }),
    create: (data) => api.post('/referees', data),
    update: (id, data) => api.put(`/referees/${id}`, data),
    delete: (id) => api.delete(`/referees/${id}`),
  },

  playerStats: {
    getAll: () => api.get('/stats/players'),
    getByPlayer: (playerId) => api.get(`/stats/players/${playerId}`),
    getTopRated: () => api.get('/stats/top-players', { limit: 10 }),
  },

  teamStats: {
    getAll: () => api.get('/stats/teams'),
    getByTeam: (teamId) => api.get(`/stats/teams/${teamId}`),
    getByLeague: (leagueId) => api.get(`/stats/standings/${leagueId}`),
  },

  tournamentTeams: {
    getAll: () => api.get('/tournaments/teams'),
    getByTournament: (tournamentId) => api.get(`/tournaments/${tournamentId}/teams`),
    getByTeam: (teamId) => api.get('/tournaments/teams', { teamId }),
  },

  transfers: {
    getAll: () => api.get('/transfers'),
    getById: (id) => api.get(`/transfers/${id}`),
    getByPlayer: (playerId) => api.get('/transfers', { playerId }),
    getByLeague: (leagueId) => api.get('/transfers', { leagueId }),
    getRecent: (limit = 10) => api.get('/stats/recent-transfers', { limit }),
  },

  playerContracts: {
    getAll: () => api.get('/player-contracts'),
    getById: (id) => api.get(`/player-contracts/${id}`),
    getByPlayer: (playerId) => api.get(`/player-contracts/player/${playerId}`),
    getByTeam: (teamId) => api.get(`/player-contracts/team/${teamId}`),
    create: (data) => api.post('/player-contracts', data),
    update: (id, data) => api.put(`/player-contracts/${id}`, data),
    delete: (id) => api.delete(`/player-contracts/${id}`),
  },

  // Backward compatibility
  playerTransfers: {
    getAll: () => api.get('/transfers'),
    getById: (id) => api.get(`/transfers/${id}`),
  },

  reports: {
    generate: (type, params) => api.get(`/reports/${type}`, params),
    download: (type, params) => {
      return api.get(`/reports/${type}/download`, {
        params,
        responseType: 'blob'
      });
    },
  },

  users: {
    getAll: () => api.get('/users'),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
  },

  search: {
    global: (query) => api.get('/search', { q: query }),
    teams: (query) => api.get('/teams', { search: query }),
    players: (query) => api.get('/players', { search: query }),
    matches: (query) => api.get('/matches', { search: query }),
  },
};

export default apiService;
