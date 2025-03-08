
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Music2,
  MusicIcon,
  Menu,
  X,
  LogOut,
  User,
  Settings,
  Users,
  LayoutDashboard,
  ChevronDown,
  Check,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Create a simple useMobile hook
const useMobile = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  useEffect(() => {
    const checkMobileScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobileScreen();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobileScreen);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobileScreen);
  }, []);
  
  return isMobile;
};

const Navbar = () => {
  const { user, isAuthenticated, logout, activeRole, setActiveRole } = useAuth();
  const isMobile = useMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  
  // Check if user has admin privileges
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdminUser(false);
        return;
      }
      
      try {
        // Check if user has admin role in profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        setIsAdminUser(!!data?.is_admin);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdminUser(false);
      }
    };
    
    checkAdminStatus();
  }, [user]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="mr-4 flex items-center space-x-2">
          <MusicIcon className="h-6 w-6" />
          <span className="text-xl font-semibold">ShortsRev</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center space-x-1">
          <Link to="/" className="px-4 py-2 text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          <Link to="/about" className="px-4 py-2 text-sm font-medium transition-colors hover:text-primary">
            About
          </Link>
          <Link to="/how-it-works" className="px-4 py-2 text-sm font-medium transition-colors hover:text-primary">
            How it Works
          </Link>
          <Link to="/pricing" className="px-4 py-2 text-sm font-medium transition-colors hover:text-primary">
            Pricing
          </Link>
        </nav>
        
        {/* Desktop Right-Aligned Elements */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {user?.profile?.has_dual_role && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9">
                      <span>{activeRole === 'creator' ? 'Creator' : 'Artist'}</span>
                      <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setActiveRole('creator')}>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Creator</span>
                      {activeRole === 'creator' && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveRole('artist')}>
                      <Music2 className="mr-2 h-4 w-4" />
                      <span>Artist</span>
                      {activeRole === 'artist' && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              <Link to="/dashboard">
                <Button variant="ghost" className="h-9">
                  Dashboard
                </Button>
              </Link>
              
              {isAdminUser && (
                <Link to="/admin">
                  <Button variant="ghost" className="h-9">
                    Admin
                  </Button>
                </Link>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.profile?.avatar_url || ''} alt={user.profile?.full_name || ''} />
                      <AvatarFallback>
                        {user.profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.profile?.full_name || user.email?.split('@')[0]}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdminUser && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          className="ml-auto mr-2 h-9 w-9 md:hidden"
          onClick={toggleMenu}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && isMobile && (
        <div className="container md:hidden py-4 border-t">
          <nav className="flex flex-col space-y-2">
            <Link
              to="/"
              className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              to="/how-it-works"
              className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              How it Works
            </Link>
            <Link
              to="/pricing"
              className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            
            {isAuthenticated ? (
              <>
                <div className="h-px bg-border my-2" />
                
                {user?.profile?.has_dual_role && (
                  <div className="px-4 py-2">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Current Role</div>
                    <div className="flex space-x-2">
                      <Button
                        variant={activeRole === 'creator' ? 'default' : 'outline'}
                        size="sm"
                        className="w-full"
                        onClick={() => setActiveRole('creator')}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Creator
                      </Button>
                      <Button
                        variant={activeRole === 'artist' ? 'default' : 'outline'}
                        size="sm"
                        className="w-full"
                        onClick={() => setActiveRole('artist')}
                      >
                        <Music2 className="mr-2 h-4 w-4" />
                        Artist
                      </Button>
                    </div>
                  </div>
                )}
                
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
                
                {isAdminUser && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted flex items-center"
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                
                <Link
                  to="/dashboard/profile"
                  className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
                
                <Link
                  to="/dashboard/settings"
                  className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
                
                <button
                  className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted flex items-center text-red-500"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </button>
                
                <div className="h-px bg-border my-2" />
                
                <div className="px-4 py-2 flex items-center">
                  <Avatar className="h-9 w-9 mr-2">
                    <AvatarImage src={user.profile?.avatar_url || ''} alt={user.profile?.full_name || ''} />
                    <AvatarFallback>
                      {user.profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">{user.profile?.full_name || user.email?.split('@')[0]}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                <Button className="w-full">Sign In</Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
