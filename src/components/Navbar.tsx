import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Music, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Pricing', path: '/pricing' },
  ];

  const authLinks = isAuthenticated
    ? [{ name: 'Dashboard', path: '/dashboard' }]
    : [{ name: 'Login', path: '/auth' }];

  return (
    <nav 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300',
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-subtle' 
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Music className="h-8 w-8 text-primary animate-fade-in" />
            <span className="text-xl font-semibold text-foreground animate-fade-in animate-delay-100">
              ShortsRev
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center space-x-1">
            {navLinks.map((link, index) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors animate-fade-in',
                  `animate-delay-${(index + 1) * 100}`,
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted'
                )}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Auth / Dashboard */}
            {authLinks.map((link, index) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors animate-fade-in',
                  `animate-delay-${(index + navLinks.length + 1) * 100}`,
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted'
                )}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Register Button or User Menu */}
            {isAuthenticated ? (
              <div className="relative ml-3 animate-fade-in animate-delay-500">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-medium"
                    onClick={logout}
                  >
                    Sign Out
                  </Button>
                  <Link to="/dashboard/profile" className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </Link>
                </div>
              </div>
            ) : (
              <Link to="/auth?mode=register" className="animate-fade-in animate-delay-500">
                <Button size="sm" className="ml-3">
                  Sign Up
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-secondary focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  'block px-3 py-2 rounded-md text-base font-medium',
                  location.pathname === link.path
                    ? 'text-primary bg-primary/5'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted'
                )}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Auth Navigation */}
            {authLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  'block px-3 py-2 rounded-md text-base font-medium',
                  location.pathname === link.path
                    ? 'text-primary bg-primary/5'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted'
                )}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Register Button */}
            {!isAuthenticated && (
              <Link
                to="/auth?mode=register"
                className="block px-3 py-2 mt-2 text-base font-medium text-primary hover:bg-primary/5 rounded-md"
              >
                Sign Up
              </Link>
            )}
            
            {/* User Profile & Logout */}
            {isAuthenticated && (
              <div className="pt-4 pb-3 border-t border-border">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-6 w-6 text-primary" />
                      )}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-foreground">{user?.name}</div>
                    <div className="text-sm font-medium text-muted-foreground">{user?.email}</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link
                    to="/dashboard/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-foreground/80 hover:text-foreground hover:bg-muted"
                  >
                    Your Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-foreground/80 hover:text-foreground hover:bg-muted"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
