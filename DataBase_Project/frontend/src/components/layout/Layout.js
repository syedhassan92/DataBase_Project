import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, Home, LogOut, X } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">Sports Management</h1>
          <p className="text-sm text-gray-600 mt-1">Dashboard</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavLink
            to={isAdmin ? "/admin/dashboard" : "/user/dashboard"}
            icon={<Home className="w-5 h-5" />}
            label={isAdmin ? "Admin Dashboard" : "User Dashboard"}
            isActive={isActive(isAdmin ? "/admin/dashboard" : "/user/dashboard")}
          />

          {isAdmin && (
            <>
              <div className="pt-4 border-t mt-4">
                <h3 className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Management</h3>
                <NavLink to="/admin/users" label="Users" isActive={isActive("/admin/users")} />
                <NavLink to="/admin/leagues" label="Leagues" isActive={isActive("/admin/leagues")} />
                <NavLink to="/admin/tournaments" label="Tournaments" isActive={isActive("/admin/tournaments")} />
                <NavLink to="/admin/teams" label="Teams" isActive={isActive("/admin/teams")} />
                <NavLink to="/admin/players" label="Players" isActive={isActive("/admin/players")} />
                <NavLink to="/admin/player-contracts" label="Player Contracts" isActive={isActive("/admin/player-contracts")} />
                <NavLink to="/admin/player-transfers" label="Player Transfers" isActive={isActive("/admin/player-transfers")} />
                <NavLink to="/admin/coaches" label="Coaches" isActive={isActive("/admin/coaches")} />
                <NavLink to="/admin/referees" label="Referees" isActive={isActive("/admin/referees")} />
                <NavLink to="/admin/venues" label="Venues" isActive={isActive("/admin/venues")} />
                <NavLink to="/admin/matches" label="Matches" isActive={isActive("/admin/matches")} />
              </div>
              <div className="pt-4 border-t">
                <h3 className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Analytics</h3>
                <NavLink to="/admin/league-table" label="League Table" isActive={isActive("/admin/league-table")} />
                <NavLink to="/admin/statistics" label="Statistics" isActive={isActive("/admin/statistics")} />

              </div>
            </>
          )}

          {!isAdmin && (
            <>
              <div className="pt-4 border-t">
                <h3 className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Browse</h3>
                <NavLink to="/leagues" label="Leagues" isActive={isActive("/leagues")} />
                <NavLink to="/tournaments" label="Tournaments" isActive={isActive("/tournaments")} />
                <NavLink to="/teams" label="Teams" isActive={isActive("/teams")} />
                <NavLink to="/players" label="Players" isActive={isActive("/players")} />

                <NavLink to="/matches" label="Matches" isActive={isActive("/matches")} />
              </div>
            </>
          )}
        </nav>

        <div className="border-t p-6 bg-gray-50">
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-sm flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                <p className="text-gray-500 capitalize text-xs">{user?.role}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>

        </div>
      </aside>

      {/* Mobile Menu Button and Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-40">
          <h1 className="text-xl font-bold text-blue-600">Sports</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b shadow-md p-4">
            <nav className="space-y-2">
              <MobileNavLink
                to={isAdmin ? "/admin/dashboard" : "/user/dashboard"}
                label={isAdmin ? "Admin Dashboard" : "User Dashboard"}
                isActive={isActive(isAdmin ? "/admin/dashboard" : "/user/dashboard")}
              />
              {isAdmin && (
                <>
                  <h3 className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase mt-3">Management</h3>
                  <MobileNavLink to="/admin/users" label="Users" isActive={isActive("/admin/users")} />
                  <MobileNavLink to="/admin/leagues" label="Leagues" isActive={isActive("/admin/leagues")} />
                  <MobileNavLink to="/admin/tournaments" label="Tournaments" isActive={isActive("/admin/tournaments")} />
                  <MobileNavLink to="/admin/teams" label="Teams" isActive={isActive("/admin/teams")} />
                  <MobileNavLink to="/admin/players" label="Players" isActive={isActive("/admin/players")} />
                  <MobileNavLink to="/admin/player-contracts" label="Player Contracts" isActive={isActive("/admin/player-contracts")} />
                  <MobileNavLink to="/admin/player-transfers" label="Player Transfers" isActive={isActive("/admin/player-transfers")} />
                  <MobileNavLink to="/admin/coaches" label="Coaches" isActive={isActive("/admin/coaches")} />
                  <MobileNavLink to="/admin/referees" label="Referees" isActive={isActive("/admin/referees")} />
                  <MobileNavLink to="/admin/venues" label="Venues" isActive={isActive("/admin/venues")} />
                  <MobileNavLink to="/admin/matches" label="Matches" isActive={isActive("/admin/matches")} />
                  <h3 className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase mt-3">Analytics</h3>
                  <MobileNavLink to="/admin/league-table" label="League Table" isActive={isActive("/admin/league-table")} />
                  <MobileNavLink to="/admin/statistics" label="Statistics" isActive={isActive("/admin/statistics")} />

                </>
              )}
              {!isAdmin && (
                <>
                  <h3 className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase mt-3">Browse</h3>
                  <MobileNavLink to="/leagues" label="Leagues" isActive={isActive("/leagues")} />
                  <MobileNavLink to="/tournaments" label="Tournaments" isActive={isActive("/tournaments")} />
                  <MobileNavLink to="/teams" label="Teams" isActive={isActive("/teams")} />
                  <MobileNavLink to="/players" label="Players" isActive={isActive("/players")} />

                  <MobileNavLink to="/matches" label="Matches" isActive={isActive("/matches")} />
                </>
              )}
            </nav>
            <div className="space-y-2 mt-4 pt-4 border-t">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>

            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const NavLink = ({ to, icon, label, isActive }) => {
  return (
    <a
      href={to}
      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition ${isActive
        ? 'bg-blue-600 text-white font-semibold'
        : 'text-gray-700 hover:bg-gray-100'
        }`}
    >
      {icon && icon}
      <span>{label}</span>
    </a>
  );
};

const MobileNavLink = ({ to, label, isActive }) => {
  return (
    <a
      href={to}
      className={`block px-4 py-2 rounded-lg transition ${isActive
        ? 'bg-blue-600 text-white font-semibold'
        : 'text-gray-700 hover:bg-gray-100'
        }`}
    >
      {label}
    </a>
  );
};

export default Layout;
