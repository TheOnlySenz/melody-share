
import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { CalendarRange, Download, TrendingUp, ArrowUpRight, BarChart3, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFadeIn } from '@/lib/animations';
import MusicCard, { Song } from '@/components/MusicCard';
import { useEarnings } from '@/hooks/useEarnings';

// Mock data for top songs
const topSongs: Song[] = [
  {
    id: '1',
    title: 'Sunset Waves',
    artist: 'Ocean Dreams',
    genre: 'Lo-Fi',
    duration: '2:34',
    coverUrl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    audioUrl: 'https://example.com/audio1.mp3',
    isExclusive: true,
  },
  {
    id: '3',
    title: 'Midnight Drive',
    artist: 'Synthwave Runner',
    genre: 'Synthwave',
    duration: '4:15',
    coverUrl: 'https://images.unsplash.com/photo-1603899968034-80a3937611ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    audioUrl: 'https://example.com/audio3.mp3',
    isExclusive: true,
  },
  {
    id: '5',
    title: 'Electric Dreams',
    artist: 'Neon Future',
    genre: 'Electronic',
    duration: '3:18',
    coverUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
    audioUrl: 'https://example.com/audio5.mp3',
  },
];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-2 rounded-md shadow-sm">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm">
          {payload[0].name === 'views' 
            ? `${payload[0].value.toLocaleString()} views`
            : `$${payload[0].value.toLocaleString()}`}
        </p>
      </div>
    );
  }

  return null;
};

// Generate views data based on earnings
const generateViewsData = (earningsData: any[]) => {
  return earningsData.map(item => ({
    name: item.month,
    views: Math.round(item.earnings * 1000 * (0.8 + Math.random() * 0.4)) // Random multiplier for variation
  }));
};

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('year');
  const { analytics, earningsHistory, isLoading, error } = useEarnings();
  
  const headerAnimation = useFadeIn('up');
  const statsAnimation = useFadeIn('up', { delay: 100 });
  const viewsChartAnimation = useFadeIn('up', { delay: 200 });
  const earningsChartAnimation = useFadeIn('up', { delay: 300 });
  const topSongsAnimation = useFadeIn('up', { delay: 400 });

  // Generate views data based on earnings
  const viewsData = generateViewsData(earningsHistory);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-destructive">Error loading analytics</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        ref={headerAnimation.ref}
        style={headerAnimation.style}
      >
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track performance and earnings from your YouTube Shorts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <CalendarRange className="h-4 w-4" />
            <Select
              value={timeRange}
              onValueChange={setTimeRange}
            >
              <SelectTrigger className="border-0 p-0 h-auto w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="year">Last 12 Months</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Stats cards */}
      <div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        ref={statsAnimation.ref}
        style={statsAnimation.style}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(analytics.total * 1000).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 font-medium flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12.4%
              </span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.total.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 font-medium flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +8.6%
              </span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Songs</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topSongs.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 font-medium flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +3
              </span> from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <Card 
          className="overflow-hidden"
          ref={viewsChartAnimation.ref}
          style={viewsChartAnimation.style}
        >
          <CardHeader>
            <CardTitle>Views</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[300px] w-full p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewsData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={12}
                    tickMargin={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={12}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="views" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                    barSize={30} 
                    name="views"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Earnings Chart */}
        <Card 
          className="overflow-hidden"
          ref={earningsChartAnimation.ref}
          style={earningsChartAnimation.style}
        >
          <CardHeader>
            <CardTitle>Earnings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[300px] w-full p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsHistory} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={12}
                    tickMargin={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary)/0.2)" 
                    name="earnings"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Top performing songs */}
      <div 
        className="space-y-4"
        ref={topSongsAnimation.ref}
        style={topSongsAnimation.style}
      >
        <h2 className="text-xl font-semibold">Top Performing Songs</h2>
        <div className="space-y-3">
          {topSongs.map((song) => (
            <div key={song.id} className="bg-card border border-border rounded-lg overflow-hidden">
              <MusicCard song={song} isCompact={true} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
