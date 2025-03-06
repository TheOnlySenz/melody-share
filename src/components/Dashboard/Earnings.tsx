
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import {
  AreaChart,
  Area,
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
import { Button } from '@/components/ui/button';
import { Download, ArrowUpRight, TrendingUp, CreditCard, Calendar, Filter } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { useFadeIn } from '@/lib/animations';

// Mock data for revenue chart
const revenueData = [
  { month: 'Jan', revenue: 1490 },
  { month: 'Feb', revenue: 1800 },
  { month: 'Mar', revenue: 2400 },
  { month: 'Apr', revenue: 1800 },
  { month: 'May', revenue: 2600 },
  { month: 'Jun', revenue: 3100 },
  { month: 'Jul', revenue: 3500 },
  { month: 'Aug', revenue: 4100 },
  { month: 'Sep', revenue: 4800 },
  { month: 'Oct', revenue: 5200 },
  { month: 'Nov', revenue: 5900 },
  { month: 'Dec', revenue: 6700 },
];

// Mock data for platform split
const platformData = [
  { name: 'YouTube', value: 68 },
  { name: 'Instagram', value: 22 },
  { name: 'TikTok', value: 10 },
];

// Mock data for source split
const sourceData = [
  { name: 'Shorts Revenue', value: 55 },
  { name: 'Music Licensing', value: 30 },
  { name: 'Sponsorships', value: 15 },
];

// Mock data for weekly earnings
const weeklyData = [
  { day: 'Mon', revenue: 340 },
  { day: 'Tue', revenue: 290 },
  { day: 'Wed', revenue: 410 },
  { day: 'Thu', revenue: 380 },
  { day: 'Fri', revenue: 520 },
  { day: 'Sat', revenue: 610 },
  { day: 'Sun', revenue: 490 },
];

// Mock transactions data
const transactions = [
  { id: 1, date: '2023-12-15', amount: 840.50, status: 'completed', platform: 'YouTube' },
  { id: 2, date: '2023-12-01', amount: 1200.75, status: 'completed', platform: 'YouTube' },
  { id: 3, date: '2023-11-15', amount: 950.20, status: 'completed', platform: 'Instagram' },
  { id: 4, date: '2023-11-01', amount: 1100.00, status: 'completed', platform: 'YouTube' },
  { id: 5, date: '2023-10-15', amount: 780.30, status: 'completed', platform: 'TikTok' },
];

// Colors for pie charts
const PLATFORM_COLORS = ['#ff4d4f', '#ff7875', '#ffccc7'];
const SOURCE_COLORS = ['#ff4d4f', '#ff7875', '#ffccc7'];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-2 rounded-md shadow-sm">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-primary">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }

  return null;
};

const Earnings = () => {
  const [period, setPeriod] = useState('year');
  
  const headerAnimation = useFadeIn('up');
  const statsAnimation = useFadeIn('up', { delay: 100 });
  const revenueChartAnimation = useFadeIn('up', { delay: 200 });
  const distributionAnimation = useFadeIn('up', { delay: 300 });
  const transactionsAnimation = useFadeIn('up', { delay: 400 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        ref={headerAnimation.ref}
        style={headerAnimation.style}
      >
        <div>
          <h1 className="text-3xl font-bold">Revenue & Earnings</h1>
          <p className="text-muted-foreground">
            Track your earnings, payouts, and revenue sources
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            <Select
              value={period}
              onValueChange={setPeriod}
            >
              <SelectTrigger className="border-0 p-0 h-auto w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
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
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$38,489.25</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 font-medium flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +18.2%
              </span> from previous period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$7,842.50</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Next payout on 15th
              </p>
              <Button variant="link" className="h-auto p-0 text-xs">Request payout</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Monthly</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$3,207.44</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 font-medium flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +9.7%
              </span> vs. previous 6 months
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Revenue Chart */}
      <Card 
        className="overflow-hidden"
        ref={revenueChartAnimation.ref}
        style={revenueChartAnimation.style}
      >
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>
            Your earnings over time
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="monthly" className="w-full">
            <div className="px-6">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="weekly" className="mt-0">
              <div className="h-[300px] w-full p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <XAxis 
                      dataKey="day" 
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
                    <Bar 
                      dataKey="revenue" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]} 
                      barSize={30} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="monthly" className="mt-0">
              <div className="h-[300px] w-full p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
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
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary)/0.2)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Distribution charts */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        ref={distributionAnimation.ref}
        style={distributionAnimation.style}
      >
        {/* Platform distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
            <CardDescription>
              Revenue breakdown by platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[index % PLATFORM_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Source distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Sources</CardTitle>
            <CardDescription>
              Revenue breakdown by source
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Transactions */}
      <Card
        ref={transactionsAnimation.ref}
        style={transactionsAnimation.style}
      >
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Your latest payouts and earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-medium p-2 pl-0">Date</th>
                  <th className="text-left font-medium p-2">Platform</th>
                  <th className="text-left font-medium p-2">Amount</th>
                  <th className="text-left font-medium p-2 pr-0">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b last:border-0">
                    <td className="p-2 pl-0">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="p-2">{transaction.platform}</td>
                    <td className="p-2 font-medium">${transaction.amount.toFixed(2)}</td>
                    <td className="p-2 pr-0">
                      <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Earnings;
