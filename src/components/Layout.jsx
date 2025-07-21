import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Brain, Calendar, Home, User, LogOut, Sun, Moon } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <Link to="/" className="logo">
              <Brain className="w-6 h-6" />
              InterviewAI
            </Link>
            
            {user && (
              <ul className="nav-links">
                <li>
                  <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/interview" className={location.pathname === '/interview' ? 'active' : ''}>
                    <Brain className="w-4 h-4" />
                    Interview
                  </Link>
                </li>
                <li>
                  <Link to="/schedule" className={location.pathname === '/schedule' ? 'active' : ''}>
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </li>
              </ul>
            )}
            
            <div className="nav-actions">
              {user ? (
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleDarkMode}
                    className="theme-toggle"
                    title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                  <span className="text-sm text-gray-600">Welcome, {user.username}!</span>
                  <button onClick={logout} className="btn btn-outline">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={toggleDarkMode}
                    className="theme-toggle"
                    title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                  <Link to="/login" className="btn btn-outline">Login</Link>
                  <Link to="/register" className="btn btn-primary">Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container py-8">
        {children}
      </main>
      <footer className="custom-footer">
        <div className="footer-main">
          <div>
            <h3>Features</h3>
            <ul>
              <li><a href="/interview">Mock Interviews</a></li>
              <li><a href="/live-coding">Live Coding Practice</a></li>
              <li><a href="/schedule">Peer Scheduling</a></li>
            </ul>
          </div>
          <div>
            <h3>Resources</h3>
            <ul>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/profile">Profile</a></li>
              <li><a href="/">Home</a></li>
            </ul>
          </div>
          <div>
            <h3>Contact</h3>
            <ul>
              <li><strong>Rishab Thakur</strong></li>
              <li><a href="tel:6387989439">📞 6387989439</a></li>
              <li><a href="mailto:rishabthakur665@gmail.com">✉️ rishabthakur665@gmail.com</a></li>
              <li>
                <a href="https://github.com/RishabThakur05" target="_blank" rel="noopener noreferrer">GitHub</a> |
                <a href="https://www.linkedin.com/in/rishab-thakur-a521a124b/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </li>
            </ul>
          </div>
          <div>
            <h3>Newsletter</h3>
            <form>
              <input type="email" placeholder="Email Address" disabled />
              <button type="button" disabled>Subscribe</button>
            </form>
            <div className="newsletter-note">Newsletter coming soon!</div>
          </div>
        </div>
        <div className="footer-divider"></div>
        <div className="footer-bottom">
          <span className="footer-logo">InterviewAI</span>
          <span>© {new Date().getFullYear()} InterviewAI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
