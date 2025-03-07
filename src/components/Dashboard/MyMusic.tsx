
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Upload, 
  Filter,
  Music2,
  Clock,
  BarChart2,
  Share2,
  PlayCircle,
  Loader2,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useFadeIn } from '@/lib/animations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for artist's tracks
const mockTracks = [
  {
    id: '1',
    title: 'Sunset Waves',
    thumbnail: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    duration: '2:34',
    genre: 'Lo-Fi',
    bpm: 85,
    uploaded: '2023-08-15',
    uses: 1243,
    revenue: 237.50,
    isExclusive: false
  },
  {
    id: '2',
    title: 'Urban Beats',
    thumbnail: 'https://images.unsplash.com/photo-1501761095094-94d36f57edbb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=765&q=80',
    duration: '3:12',
    genre: 'Hip Hop',
    bpm: 95,
    uploaded: '2023-07-22',
    uses: 876,
    revenue: 154.20,
    isExclusive: true
  },
  {
    id: '3',
    title: 'Midnight Drive',
    thumbnail: 'https://images.unsplash.com/photo-1603899968034-80a3937611ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    duration: '4:15',
    genre: 'Synthwave',
    bpm: 102,
    uploaded: '2023-06-09',
    uses: 2154,
    revenue: 412.75,
    isExclusive: true
  },
  {
    id: '4',
    title: 'Morning Coffee',
    thumbnail: 'https://images.unsplash.com/photo-1560269507-8d45a1d8e3b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=436&q=80',
    duration: '2:45',
    genre: 'Chill',
    bpm: 75,
    uploaded: '2023-05-17',
    uses: 543,
    revenue: 87.60,
    isExclusive: false
  }
];

const MyMusic = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  
  const headerAnimation = useFadeIn('up');
  const statsAnimation = useFadeIn('up', { delay: 100 });
  const contentAnimation = useFadeIn('up', { delay: 200 });
  
  const { user } = useAuth();
  
  const handleUpload = () => {
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      toast.success('Track uploaded successfully');
    }, 2000);
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const filteredTracks = mockTracks.filter(track => {
    // Filter by search query
    if (searchQuery && !track.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by tab
    if (activeTab === 'exclusive' && !track.isExclusive) {
      return false;
    }
    
    if (activeTab === 'nonexclusive' && track.isExclusive) {
      return false;
    }
    
    return true;
  });
  
  const totalRevenue = mockTracks.reduce((sum, track) => sum + track.revenue, 0);
  const totalUses = mockTracks.reduce((sum, track) => sum + track.uses, 0);
  
  return (
    <div className="space-y-6">
      <div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        ref={headerAnimation.ref}
        style={headerAnimation.style}
      >
        <div>
          <h1 className="text-3xl font-bold">My Music</h1>
          <p className="text-muted-foreground">
            Manage your music tracks and monitor their performance
          </p>
        </div>
        <Button onClick={handleUpload} disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload New Track
            </>
          )}
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        ref={statsAnimation.ref}
        style={statsAnimation.style}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From all your tracks</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tracks</CardTitle>
            <Music2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTracks.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockTracks.filter(t => t.isExclusive).length} exclusive / 
              {mockTracks.filter(t => !t.isExclusive).length} non-exclusive
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">In creator videos</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Music Content */}
      <div 
        ref={contentAnimation.ref}
        style={contentAnimation.style}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          <Tabs 
            defaultValue="all" 
            className="w-full sm:w-auto"
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="all">All Tracks</TabsTrigger>
              <TabsTrigger value="exclusive">Exclusive</TabsTrigger>
              <TabsTrigger value="nonexclusive">Non-Exclusive</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tracks..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Sort by Date</DropdownMenuItem>
                <DropdownMenuItem>Sort by Revenue</DropdownMenuItem>
                <DropdownMenuItem>Sort by Uses</DropdownMenuItem>
                <DropdownMenuItem>Sort by Name</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {filteredTracks.length === 0 ? (
          <div className="text-center py-12 border rounded-lg border-dashed">
            <Music2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-1">No tracks found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try a different search term' : 'Upload your first track to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={handleUpload}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Track
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTracks.map((track) => (
              <Card key={track.id} className="overflow-hidden">
                <div className="aspect-video bg-muted relative group">
                  <img 
                    src={track.thumbnail} 
                    alt={track.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="icon" className="rounded-full mr-2">
                      <PlayCircle className="h-5 w-5" />
                    </Button>
                    <Button variant="secondary" size="icon" className="rounded-full">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {track.isExclusive && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      Exclusive
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{track.title}</CardTitle>
                  <CardDescription>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {track.duration}
                      </span>
                      <span>Genre: {track.genre}</span>
                      <span>BPM: {track.bpm}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex justify-between text-sm">
                    <div>
                      <div className="text-muted-foreground">Uses</div>
                      <div className="font-medium">{track.uses.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted-foreground">Revenue</div>
                      <div className="font-medium">${track.revenue.toFixed(2)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMusic;
