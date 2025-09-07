import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ClipboardList, Home, BarChart3, LogOut, Bell, User, Save, Menu, X, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', icon: <Home className="h-4 w-4 mr-1" />, text: 'Dashboard' },
    { path: '/dashboard/surveys', icon: <ClipboardList className="h-4 w-4 mr-1" />, text: 'All Surveys' },
    { path: '/dashboard/organization-surveys', icon: <Building className="h-4 w-4 mr-1" />, text: 'Organization Surveys' },
    { path: '/dashboard/survey-analyzer', icon: <BarChart3 className="h-4 w-4 mr-1" />, text: 'Open Analyzer' },
    { path: '/dashboard/saved-analyses', icon: <Save className="h-4 w-4 mr-1" />, text: 'Saved Analyses' },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <nav className={`sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-primary-200 transition-all duration-300 ${scrolled ? 'shadow-lg shadow-primary-100' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - always visible */}
            <div className="flex-shrink-0">
              <Link to="/dashboard" className="flex items-center group">
                <img src="/logo.png" alt="Lakshya Logo" className="h-10 w-10" />
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary-700 to-accent-700 bg-clip-text text-transparent">लक्ष्य</span>
              </Link>
            </div>
            
            {/* Right side controls - always visible */}
            <div className="flex items-center space-x-2">
              {/* Menu button - always visible */}
              <div className="flex items-center">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-primary-600 hover:text-primary-800 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
                >
                  <span className="sr-only">Open menu</span>
                  {mobileMenuOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
              
              {/* Profile dropdown - Always visible */}
              <div className="relative group">
                <div className="flex items-center cursor-pointer">
                  <div className="bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full p-1 hover:from-primary-200 hover:to-secondary-200 transition-all duration-300">
                    <User className="h-5 w-5 text-primary-700" />
                  </div>
                </div>
                
                {/* Profile dropdown menu - shows on hover/click */}
                <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white/95 backdrop-blur-sm rounded-lg shadow-lg ring-1 ring-primary-200 py-1 hidden group-hover:block">
                  <Link 
                    to="/dashboard/profile" 
                    className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Your Profile
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Expanded menu, show/hide based on menu state - for ALL screen sizes */}
        {mobileMenuOpen && (
          <div className="absolute top-16 inset-x-0 z-20 bg-white/95 backdrop-blur-sm shadow-lg border-b border-primary-200">
            <div className="pt-2 pb-3 space-y-1 border-t border-primary-100">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block pl-3 pr-4 py-2 text-base font-medium transition-all duration-200 ${
                    location.pathname === link.path
                      ? 'bg-gradient-to-r from-primary-50 to-secondary-50 border-l-4 border-primary-500 text-primary-700'
                      : 'border-l-4 border-transparent text-primary-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 hover:border-primary-300 hover:text-primary-800'
                  }`}
                >
                  <div className="flex items-center">
                    {link.icon}
                    {link.text}
                  </div>
                </Link>
              ))}
              
              {/* Notifications in menu */}
              <Link
                to="/notifications"
                className="block pl-3 pr-4 py-2 text-base font-medium border-l-4 border-transparent text-primary-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 hover:border-primary-300 hover:text-primary-800 transition-all duration-200"
              >
                <div className="flex items-center">
                  <Bell className="h-4 w-4 mr-1" />
                  Notifications
                  {/* <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    New
                  </span> */}
                </div>
              </Link>
              <div className="border-t border-primary-200 pt-4 pb-3">
                <div className="px-4 py-2">
                  <h3 className="text-sm font-medium text-primary-800">Account Settings</h3>
                </div>
                
                <div className="mt-2 space-y-1">
                  <Link 
                    to="/dashboard/profile" 
                    className="block px-4 py-2 text-base font-medium text-primary-600 hover:bg-primary-50 hover:text-primary-900 transition-colors"
                  >
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-3 text-primary-500" />
                      Your Profile
                    </div>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-base font-medium text-primary-600 hover:bg-primary-50 hover:text-primary-900 transition-colors"
                  >
                    <div className="flex items-center">
                      <LogOut className="h-5 w-5 mr-3 text-primary-500" />
                      Sign Out
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;