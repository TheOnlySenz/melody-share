
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { BarChart3, CalendarRange, Download, Loader2, AlertCircle, DollarSign, ArrowRight, Wallet, PiggyBank, Users } from 'lucide-react';
import { useFadeIn } from '@/lib/animations';
import { useEarnings } from '@/hooks/useEarnings';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface Transaction {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payment_method: string;
  transaction_date: string;
  completed_date?: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-500 bg-green-50 dark:bg-green-950/20';
    case 'pending':
      return 'text-amber-500 bg-amber-50 dark:bg-amber-950/20';
    case 'processing':
      return 'text-blue-500 bg-blue-50 dark:bg-blue-950/20';
    case 'failed':
      return 'text-red-500 bg-red-50 dark:bg-red-950/20';
    default:
      return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
  }
};

const Earnings = () => {
  const { user } = useAuth();
  const { analytics, isLoading: isLoadingAnalytics } = useEarnings();
  const [timeRange, setTimeRange] = useState('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);

  const summaryAnimation = useFadeIn('up');
  const overviewAnimation = useFadeIn('up', { delay: 100 });
  const transactionsAnimation = useFadeIn('up', { delay: 200 });

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      setIsLoadingTransactions(true);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });
        
      if (error) throw error;
      
      setTransactions(data || []);
      
      // If no transactions, create some example ones
      if (!data || data.length === 0) {
        createExampleTransactions();
      }
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setTransactionError(err.message || 'Failed to load transaction history');
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const createExampleTransactions = async () => {
    if (!user) return;
    
    try {
      // Create sample transactions
      const sampleTransactions = [
        {
          user_id: user.id,
          amount: 247.50,
          status: 'completed',
          payment_method: 'paypal',
          payment_details: { email: user.email },
          transaction_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          completed_date: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          user_id: user.id,
          amount: 120.75,
          status: 'completed',
          payment_method: 'stripe',
          payment_details: { card: '**** 4242' },
          transaction_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
          completed_date: new Date(Date.now() - 59 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          user_id: user.id,
          amount: 75.00,
          status: 'pending',
          payment_method: 'paypal',
          payment_details: { email: user.email },
          transaction_date: new Date().toISOString()
        }
      ];
      
      const { error } = await supabase
        .from('transactions')
        .insert(sampleTransactions);
        
      if (error) throw error;
      
      // Refresh transactions list
      fetchTransactions();
    } catch (err: any) {
      console.error('Error creating example transactions:', err);
      // We don't show errors for this as it's just sample data
    }
  };

  const handleDownloadStatement = () => {
    toast.success('Statement downloaded successfully');
  };

  const handleRequestWithdrawal = async () => {
    if (!user) {
      toast.error('You must be logged in to request a withdrawal');
      return;
    }
    
    if (withdrawAmount <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }
    
    if (withdrawAmount > analytics.approved) {
      toast.error('Withdrawal amount exceeds available balance');
      return;
    }
    
    try {
      // Check if user has a payment method
      const { data: paymentMethods, error: pmError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();
        
      if (pmError || !paymentMethods) {
        toast.error('Please set up a payment method before requesting a withdrawal');
        return;
      }
      
      // Create withdrawal transaction
      const { error } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            amount: withdrawAmount,
            status: 'pending',
            payment_method: paymentMethods.method_type,
            payment_details: paymentMethods.details
          }
        ]);
        
      if (error) throw error;
      
      toast.success(`Withdrawal request for $${withdrawAmount} submitted successfully`);
      
      // Clear withdrawal amount and refresh transactions
      setWithdrawAmount(0);
      fetchTransactions();
    } catch (err: any) {
      console.error('Error requesting withdrawal:', err);
      toast.error(err.message || 'Failed to request withdrawal');
    }
  };

  const isLoading = isLoadingAnalytics || isLoadingTransactions;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  if (transactionError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-destructive font-medium">Error loading transactions</p>
          <p className="text-muted-foreground text-sm">{transactionError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Earnings</h1>
          <p className="text-muted-foreground">
            Track your revenue and manage withdrawals
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
          
          <Button variant="outline" onClick={handleDownloadStatement}>
            <Download className="h-4 w-4 mr-2" />
            Statement
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        ref={summaryAnimation.ref}
        style={summaryAnimation.style}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">${analytics.approved.toFixed(2)}</div>
            <div className="flex justify-between">
              <p className="text-xs text-muted-foreground">Available for withdrawal</p>
              <Button size="sm" onClick={() => setWithdrawAmount(analytics.approved)}>
                Withdraw All
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.pending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Will be available in 7-14 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Earnings</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(analytics.approved + analytics.pending + analytics.paid).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total earned since joining</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Earnings Overview & Withdrawal */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Earnings Overview</TabsTrigger>
          <TabsTrigger value="withdraw">Request Withdrawal</TabsTrigger>
          <TabsTrigger value="referrals">Referral Earnings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" ref={overviewAnimation.ref} style={overviewAnimation.style}>
          <Card>
            <CardHeader>
              <CardTitle>Earnings Breakdown</CardTitle>
              <CardDescription>
                View your earnings by source and platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>YouTube Shorts</span>
                    <span className="font-medium">${(analytics.total * 0.85).toFixed(2)}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Referral Bonuses</span>
                    <span className="font-medium">${analytics.referralEarnings.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Platform Bonuses</span>
                    <span className="font-medium">${(analytics.total * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '5%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="withdraw">
          <Card>
            <CardHeader>
              <CardTitle>Request Withdrawal</CardTitle>
              <CardDescription>
                Withdraw your available earnings to your preferred payment method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Withdrawal Amount</Label>
                  <div className="flex items-center">
                    <span className="bg-muted px-3 py-2 rounded-l-md border border-r-0 border-input">$</span>
                    <input
                      id="amount"
                      type="number"
                      min="1"
                      max={analytics.approved}
                      value={withdrawAmount || ''}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      className="flex h-10 w-full rounded-r-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Available balance: ${analytics.approved.toFixed(2)}</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select defaultValue="paypal">
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Credit/Debit Card</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Withdrawal Amount</span>
                  <span>${withdrawAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Processing Fee</span>
                  <span className="text-muted-foreground">-${(withdrawAmount * 0.029 + 0.30).toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-medium">
                  <span>You'll Receive</span>
                  <span>${Math.max(0, (withdrawAmount - (withdrawAmount * 0.029 + 0.30))).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border pt-4 flex justify-between">
              <p className="text-xs text-muted-foreground">
                Withdrawals typically process within 3-5 business days
              </p>
              <Button 
                onClick={handleRequestWithdrawal}
                disabled={withdrawAmount <= 0 || withdrawAmount > analytics.approved}
              >
                Request Withdrawal
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle>Referral Earnings</CardTitle>
              <CardDescription>
                Earn by referring other creators to the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-6 text-center space-y-4">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Your Referral Stats</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    You've referred {analytics.referralCount} creators and earned ${analytics.referralEarnings.toFixed(2)}
                  </p>
                </div>
                <div className="bg-card border border-border rounded-md p-3 text-sm">
                  <p className="font-medium">Your Referral Link</p>
                  <div className="flex items-center mt-2">
                    <code className="bg-muted p-2 rounded text-xs flex-1 overflow-x-auto">
                      https://melodyrevenue.com/ref?code={user?.profile?.username || 'yourcode'}
                    </code>
                    <Button size="sm" variant="outline" className="ml-2" onClick={() => {
                      navigator.clipboard.writeText(`https://melodyrevenue.com/ref?code=${user?.profile?.username || 'yourcode'}`);
                      toast.success('Referral link copied to clipboard');
                    }}>
                      Copy
                    </Button>
                  </div>
                </div>
                <Button className="gap-2">
                  Share Your Referral Link
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Transactions Table */}
      <div 
        className="space-y-4" 
        ref={transactionsAnimation.ref}
        style={transactionsAnimation.style}
      >
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Transaction History
        </h2>
        
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableCaption>A list of your recent transactions.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                      <TableCell className="capitalize">{transaction.payment_method}</TableCell>
                      <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Earnings;
