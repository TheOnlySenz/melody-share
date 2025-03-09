
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { usePayouts } from '@/hooks/usePayouts';
import { useEarnings } from '@/hooks/useEarnings';
import { ArrowDownToLine, Loader2 } from 'lucide-react';

interface PaymentMethod {
  id: string;
  method_type: 'stripe' | 'paypal';
  details: {
    account?: string;
    email?: string;
    last4?: string;
  };
}

interface PaymentWithdrawalProps {
  paymentMethods: PaymentMethod[];
}

const PaymentWithdrawal = ({ paymentMethods }: PaymentWithdrawalProps) => {
  const { analytics, isLoading: isLoadingEarnings } = useEarnings();
  const { isProcessing, processPayoutRequest } = usePayouts();
  const [amount, setAmount] = useState<number | ''>('');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');

  const handleWithdrawal = async () => {
    if (!selectedMethodId) {
      toast.error('Please select a payment method');
      return;
    }

    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > analytics.approved) {
      toast.error('Withdrawal amount cannot exceed your available balance');
      return;
    }

    const result = await processPayoutRequest(Number(amount), selectedMethodId);
    if (result) {
      // Reset form
      setAmount('');
    }
  };

  const hasPaymentMethods = paymentMethods && paymentMethods.length > 0;
  const availableBalance = analytics?.approved || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownToLine className="h-5 w-5" />
          Withdraw Earnings
        </CardTitle>
        <CardDescription>
          Transfer your approved earnings to your connected payment method
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingEarnings ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-md">
              <div>
                <p className="text-sm font-medium">Available Balance</p>
                <p className="text-2xl font-bold">${availableBalance.toFixed(2)}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                {availableBalance > 0 ? 'Available for withdrawal' : 'No funds available'}
              </div>
            </div>
            
            {!hasPaymentMethods ? (
              <div className="text-center py-4">
                <p>You need to connect a payment method before withdrawing funds.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-method">Select Payment Method</Label>
                  <Select value={selectedMethodId} onValueChange={setSelectedMethodId}>
                    <SelectTrigger id="payment-method">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.method_type === 'stripe' 
                            ? `Credit Card (••••${method.details.last4})` 
                            : `PayPal (${method.details.email})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount to Withdraw</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">$</span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      className="pl-8"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      min={0}
                      max={availableBalance}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum withdrawal: $50.00
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleWithdrawal}
          disabled={!hasPaymentMethods || !amount || amount <= 0 || amount > availableBalance || isProcessing}
        >
          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isProcessing ? 'Processing...' : 'Withdraw Funds'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentWithdrawal;
