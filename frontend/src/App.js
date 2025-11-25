import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Landing from './pages/Landing';
import UserLogin from './pages/UserLogin';
import AdminLogin from './pages/AdminLogin';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import Leagues from './pages/Leagues';
import LeagueDetails from './pages/LeagueDetails';
import Tournaments from './pages/Tournaments';
import TournamentDetails from './pages/TournamentDetails';
import Teams from './pages/Teams';
import TeamDetails from './pages/TeamDetails';
import Players from './pages/Players';
import PlayerDetails from './pages/PlayerDetails';
import Venues from './pages/Venues';
import VenueDetails from './pages/VenueDetails';
import VenueManagement from './pages/VenueManagement';
import Matches from './pages/Matches';
import MatchDetails from './pages/MatchDetails';
import MatchScheduling from './pages/MatchScheduling';
import Coaches from './pages/Coaches';
import Referees from './pages/Referees';
import PlayerContracts from './pages/PlayerContracts';
import PerformanceStats from './pages/PerformanceStats';
import PlayerTransfers from './pages/PlayerTransfers';
import ReportingSystem from './pages/ReportingSystem';
import Statistics from './pages/Statistics';
import LeagueTable from './pages/LeagueTable';
import { ToastContainer } from './components/ui/Toast';
import { useApp } from './context/AppContext';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <AppContent />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { notifications, removeNotification } = useApp();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login/user" element={<UserLogin />} />
        <Route path="/login/admin" element={<AdminLogin />} />
        
               {/* Protected User Routes */}
               <Route path="/user/dashboard" element={
                 <ProtectedRoute requiredRole="user">
                   <Layout>
                     <UserDashboard />
                   </Layout>
                 </ProtectedRoute>
               } />
              <Route path="/user/performance-stats" element={
                <ProtectedRoute requiredRole="user">
                  <Layout>
                    <PerformanceStats />
                  </Layout>
                </ProtectedRoute>
              } />
        
        {/* Protected Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Admin Management Routes */}
        <Route path="/admin/leagues" element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <Leagues />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/leagues/:id" element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <LeagueDetails />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/tournaments" element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <Tournaments />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/tournaments/:id" element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <TournamentDetails />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/teams" element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <Teams />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/teams/:id" element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <TeamDetails />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/players" element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <Players />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/players/:id" element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <PlayerDetails />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/player-contracts" element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <PlayerContracts />
            </Layout>
          </ProtectedRoute>
        } />
               <Route path="/admin/coaches" element={
                 <ProtectedRoute requiredRole="admin">
                   <Layout>
                     <Coaches />
                   </Layout>
                 </ProtectedRoute>
               } />
               <Route path="/admin/referees" element={
                 <ProtectedRoute requiredRole="admin">
                   <Layout>
                     <Referees />
                   </Layout>
                 </ProtectedRoute>
               } />
               <Route path="/admin/venues" element={
                 <ProtectedRoute requiredRole="admin">
                   <Layout>
                     <Venues />
                   </Layout>
                 </ProtectedRoute>
               } />
               <Route path="/admin/venues/:id" element={
                 <ProtectedRoute requiredRole="admin">
                   <Layout>
                     <VenueDetails />
                   </Layout>
                 </ProtectedRoute>
               } />
               <Route path="/admin/venue-management" element={
                 <ProtectedRoute requiredRole="admin">
                   <Layout>
                     <VenueManagement />
                   </Layout>
                 </ProtectedRoute>
               } />
               <Route path="/admin/matches" element={
                 <ProtectedRoute requiredRole="admin">
                   <Layout>
                     <Matches />
                   </Layout>
                 </ProtectedRoute>
               } />
               <Route path="/admin/matches/:id" element={
                 <ProtectedRoute requiredRole="admin">
                   <Layout>
                     <MatchDetails />
                   </Layout>
                 </ProtectedRoute>
               } />
               <Route path="/admin/match-scheduling" element={
                 <ProtectedRoute requiredRole="admin">
                   <Layout>
                     <MatchScheduling />
                   </Layout>
                 </ProtectedRoute>
               } />
               <Route path="/admin/performance-stats" element={
                 <ProtectedRoute requiredRole="admin">
                   <Layout>
                     <PerformanceStats />
                   </Layout>
                 </ProtectedRoute>
               } />
               <Route path="/admin/player-transfers" element={
                 <ProtectedRoute requiredRole="admin">
                   <Layout>
                     <PlayerTransfers />
                   </Layout>
                 </ProtectedRoute>
               } />
               <Route path="/admin/statistics" element={
                 <ProtectedRoute requiredRole="admin">
                   <Layout>
                     <Statistics />
                   </Layout>
                 </ProtectedRoute>
               } />
               <Route path="/admin/league-table" element={
                 <ProtectedRoute requiredRole="admin">
                   <Layout>
                     <LeagueTable />
                   </Layout>
                 </ProtectedRoute>
               } />
               <Route path="/admin/reports" element={
                 <ProtectedRoute requiredRole="admin">
                   <Layout>
                     <ReportingSystem />
                   </Layout>
                 </ProtectedRoute>
               } />
        
        {/* Legacy routes for backward compatibility */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/leagues" element={
          <ProtectedRoute>
            <Layout>
              <Leagues />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/leagues/:id" element={
          <ProtectedRoute>
            <Layout>
              <LeagueDetails />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/tournaments" element={
          <ProtectedRoute>
            <Layout>
              <Tournaments />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/tournaments/:id" element={
          <ProtectedRoute>
            <Layout>
              <TournamentDetails />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/teams" element={
          <ProtectedRoute>
            <Layout>
              <Teams />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/teams/:id" element={
          <ProtectedRoute>
            <Layout>
              <TeamDetails />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/players" element={
          <ProtectedRoute>
            <Layout>
              <Players />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/players/:id" element={
          <ProtectedRoute>
            <Layout>
              <PlayerDetails />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/coaches" element={
          <ProtectedRoute>
            <Layout>
              <Coaches />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/venues" element={
          <ProtectedRoute>
            <Layout>
              <Venues />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/venues/:id" element={
          <ProtectedRoute>
            <Layout>
              <VenueDetails />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/matches" element={
          <ProtectedRoute>
            <Layout>
              <Matches />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/matches/:id" element={
          <ProtectedRoute>
            <Layout>
              <MatchDetails />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/statistics" element={
          <ProtectedRoute>
            <Layout>
              <Statistics />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
      <ToastContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </div>
  );
}

export default App;
