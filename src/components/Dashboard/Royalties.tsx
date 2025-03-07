
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  CalendarRange,
  Download,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Music,
  Layers
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFadeIn } from '@/lib/animations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for royalties
const monthlyRoyalties = [
  { month: 'Jan', amount: 120 },
  { month: 'Feb', amount: 145 },
  { month: 'Mar', amount: 190 },
  { month: 'Apr', amount: 210 },
  { month: 'May', amount: 250 },
  { month: 'Jun', amount: 320 },
  { month: 'Jul', amount: 380 },
  { month: 'Aug', amount: 420 },
  { month: 'Sep', amount: 470 },
  { month: 'Oct', amount: 540 },
  { month: 'Nov', amount: 580 },
  { month: 'Dec', amount: 650 }
];

const trackRoyalties = [
  { name: 'Sunset Waves', value: 235 },
  { name: 'Urban Beats', value: 187 },
  { name: 'Midnight Drive', value: 342 },
  { name: 'Morning Coffee', value: 125 }
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-2 rounded-md shadow-sm">
        <p className="text-sm font-medium">{label || payload[0].name}</p>
        <p className="text-sm">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }

  return null;
};

const Royalties = () => {
  const [timeRange, setTimeRange] = useState('year');
  
  const headerAnimation = useFadeIn('up');
  const statsAnimation = useFadeIn('up', { delay: 100 });
  const chartsAnimation = useFadeIn('up', { delay: 200 });
  
  // Calculate total royalties
  const totalRoyalties = monthlyRoyalties.reduce((sum, item) => sum + item.amount, 0);
  const thisMonthRoyalties = monthlyRoyalties[monthlyRoyalties.length - 1].amount;
  const lastMonthRoyalties = monthlyRoyalties[monthlyRoyalties.length - 2].amount;
  const percentChange = ((thisMonthRoyalties - lastMonthRoyalties) / lastMonthRoyalties) * 100;
  
  return (
    <div className="space-y-6">
      <div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        ref={headerAnimation.ref}
        style={headerAnimation.style}
      >
        <div>
          <h1 className="text-3xl font-bold">Royalties</h1>
          <p className="text-muted-foreground">
            Track your music earnings and royalty payments
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
      
      {/* Stats Summary */}
      <div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        ref={statsAnimation.ref}
        style={statsAnimation.style}
      >
        {/* Total Royalties */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Royalties</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRoyalties.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime music earnings
            </p>
          </CardContent>
        </Card>
        
        {/* Monthly Royalties */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${thisMonthRoyalties.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`font-medium flex items-center ${percentChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%
              </span> from last month
            </p>
          </CardContent>
        </Card>
        
        {/* Track Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Tracks</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trackRoyalties.length}</div>
            <p className="text-xs text-muted-foreground">
              Generating royalties
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div 
        ref={chartsAnimation.ref}
        style={chartsAnimation.style}
      >
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Royalty Overview</TabsTrigger>
            <TabsTrigger value="tracks">By Track</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Royalties</CardTitle>
                <CardDescription>
                  Your royalty earnings over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyRoyalties} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="amount" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tracks">
            <Card>
              <CardHeader>
                <CardTitle>Royalties by Track</CardTitle>
                <CardDescription>
                  See which tracks are generating the most revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      layout="vertical" 
                      data={trackRoyalties} 
                      margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
                    >
                      <XAxis 
                        type="number" 
                        axisLine={false} 
                        tickLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="value" 
                        fill="hsl(var(--primary))" 
                        radius={[0, 4, 4, 0]}
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="distribution">
            <Card>
              <CardHeader>
                <CardTitle>Royalty Distribution</CardTitle>
                <CardDescription>
                  Revenue breakdown by track
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trackRoyalties}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {trackRoyalties.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Royalty Policies */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Royalty Policies</CardTitle>
            <CardDescription>
              Understanding how you earn from your music
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Exclusive Tracks</h3>
            <div className="flex justify-between text-sm bg-muted p-3 rounded-md">
              <span>Base Rate</span>
              <span className="font-medium">$0.02 per 1,000 views</span>
            </div>
            <div className="flex justify-between text-sm bg-muted p-3 rounded-md">
              <span>Premium Bonuses</span>
              <span className="font-medium">Up to 2.5x for trending content</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Non-Exclusive Tracks</h3>
            <div className="flex justify-between text-sm bg-muted p-3 rounded-md">
              <span>Base Rate</span>
              <span className="font-medium">$0.01 per 1,000 views</span>
            </div>
            <div className="flex justify-between text-sm bg-muted p-3 rounded-md">
              <span>Viral Bonuses</span>
              <span className="font-medium">Up to 2x for viral content</span>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Royalty payments are processed monthly with a minimum threshold of $50.</p>
            <p>Earnings become available 30 days after the end of each month to allow for verification.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Royalties;
