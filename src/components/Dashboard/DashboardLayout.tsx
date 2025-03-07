
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Music, 
  BarChart3, 
  User, 
  LogOut, 
  Menu, 
  X,
  Home,
  DollarSign,
  Settings,
  Users,
  Brush,
  Mic
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const getSidebarItems = (role: 'creator' | 'artist') => {
  // Common items for both roles
  const commonItems = [
    { name: 'Profile', path: '/dashboard/profile', icon: User },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
    { name: 'Invites', path: '/dashboard/invites', icon: Users },
  ];

  // Role-specific items
  if (role === 'creator') {
    return [
      { name: 'Library', path: '/dashboard/music', icon: Music },
      { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
      { name: 'Earnings', path: '/dashboard/earnings', icon: DollarSign },
      ...commonItems,
    ];
  } else {
    return [
      { name: 'My Music', path: '/dashboard/my-music', icon: Mic },
      { name: 'Royalties', path: '/dashboard/royalties', icon: DollarSign },
      { name: 'Usage Analytics', path: '/dashboard/music-analytics', icon: BarChart3 },
      ...commonItems,
    ];
  }
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, activeRole, setActiveRole } = useAuth();
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const sidebarItems = getSidebarItems(activeRole);
  
  const handleRoleSwitch = (role: 'creator' | 'artist') => {
    if (role !== activeRole) {
      setActiveRole(role);
      
      // Navigate to the appropriate dashboard based on the role
      if (role === 'creator') {
        navigate('/dashboard/music');
      } else {
        navigate('/dashboard/my-music');
      }
    }
  };
  
  const hasDualRole = user?.profile?.has_dual_role;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="bg-background shadow-subtle border border-border"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo & User Info */}
          <div className="p-6">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <Music className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">ShortsRev</span>
            </Link>

            <div className="flex items-center space-x-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            
            {/* Role selection for users with dual roles */}
            {hasDualRole ? (
              <div className="mt-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-between">
                      <span className="flex items-center">
                        {activeRole === 'creator' ? (
                          <Brush className="h-3.5 w-3.5 mr-1.5" />
                        ) : (
                          <Mic className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        {activeRole === 'creator' ? 'Creator Mode' : 'Artist Mode'}
                      </span>
                      <Badge variant="secondary" className="ml-2 text-xs">Switch</Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleRoleSwitch('creator')}
                      className={cn(activeRole === 'creator' && "bg-muted")}
                    >
                      <Brush className="h-4 w-4 mr-2" />
                      Creator Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleRoleSwitch('artist')}
                      className={cn(activeRole === 'artist' && "bg-muted")}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Artist Dashboard
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="text-xs inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {user?.role === 'creator' ? 'Content Creator' : 'Music Artist'}
              </div>
            )}
          </div>

          <Separator />

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <Link to="/">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground hover:text-foreground mb-2"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            
            <div className="text-xs uppercase text-muted-foreground font-medium tracking-wider mb-2 pl-3">
              Dashboard
            </div>
            
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.name} to={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      "w-full justify-start mb-1",
                      isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 mt-auto">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full md:w-auto">
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
