
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CreditCard, DollarSign, Users, ArrowRight, Check } from 'lucide-react';
import { useFadeIn } from '@/lib/animations';

const Payments = () => {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSplitForm, setShowSplitForm] = useState(false);
  const [collaborators, setCollaborators] = useState<Array<{ email: string, percentage: number }>>([
    { email: '', percentage: 50 }
  ]);

  const headerAnimation = useFadeIn('up');
  const paymentMethodsAnimation = useFadeIn('up', { delay: 100 });
  const revenueShareAnimation = useFadeIn('up', { delay: 200 });

  const handleConnectPayment = (method: 'stripe' | 'paypal') => {
    setIsConnecting(true);
    setPaymentMethod(method);
    
    // Simulate connection to payment provider
    setTimeout(() => {
      toast.success(`Successfully connected to ${method === 'stripe' ? 'Stripe' : 'PayPal'}`);
      setIsConnecting(false);
    }, 2000);
  };

  const handleAddCollaborator = () => {
    if (collaborators.length < 5) {
      setCollaborators([...collaborators, { email: '', percentage: 0 }]);
    } else {
      toast.error('Maximum 5 collaborators allowed');
    }
  };

  const handleRemoveCollaborator = (index: number) => {
    if (collaborators.length > 1) {
      const newCollaborators = [...collaborators];
      newCollaborators.splice(index, 1);
      setCollaborators(newCollaborators);
    }
  };

  const handleCollaboratorChange = (index: number, field: 'email' | 'percentage', value: string) => {
    const newCollaborators = [...collaborators];
    if (field === 'email') {
      newCollaborators[index].email = value;
    } else {
      // Ensure percentage is a valid number between 0-100
      const percentage = parseInt(value);
      newCollaborators[index].percentage = isNaN(percentage) ? 0 : Math.min(100, Math.max(0, percentage));
    }
    setCollaborators(newCollaborators);
  };

  const handleSaveSplitSettings = () => {
    // Validate total percentage equals 100%
    const totalPercentage = collaborators.reduce((sum, collab) => sum + collab.percentage, 0);
    
    if (totalPercentage !== 100) {
      toast.error('Total percentage must equal 100%');
      return;
    }
    
    if (collaborators.some(collab => !collab.email)) {
      toast.error('All collaborator emails must be filled');
      return;
    }
    
    toast.success('Revenue split settings saved successfully');
    setShowSplitForm(false);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        ref={headerAnimation.ref}
        style={headerAnimation.style}
      >
        <h1 className="text-3xl font-bold">Payments & Revenue</h1>
        <p className="text-muted-foreground">
          Manage your payment methods and revenue distribution
        </p>
      </div>
      
      {/* Payment Methods */}
      <Card
        ref={paymentMethodsAnimation.ref}
        style={paymentMethodsAnimation.style}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Collection Methods
          </CardTitle>
          <CardDescription>
            Connect your preferred payment processor to collect revenue from your content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className={`cursor-pointer border-2 transition-all ${paymentMethod === 'stripe' ? 'border-primary' : 'border-border'}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Stripe</CardTitle>
                <CardDescription>
                  Process credit card payments with low fees
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm pb-2">
                <ul className="space-y-1">
                  <li className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-primary" /> 2.9% + 30¢ per transaction
                  </li>
                  <li className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-primary" /> Global payment support
                  </li>
                  <li className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-primary" /> Instant payouts available
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant={paymentMethod === 'stripe' ? 'default' : 'outline'} 
                  className="w-full"
                  onClick={() => handleConnectPayment('stripe')}
                  disabled={isConnecting}
                >
                  {paymentMethod === 'stripe' ? 'Connected' : 'Connect Stripe'}
                </Button>
              </CardFooter>
            </Card>

            <Card className={`cursor-pointer border-2 transition-all ${paymentMethod === 'paypal' ? 'border-primary' : 'border-border'}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">PayPal</CardTitle>
                <CardDescription>
                  Accept payments via PayPal accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm pb-2">
                <ul className="space-y-1">
                  <li className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-primary" /> 3.49% + 49¢ per transaction
                  </li>
                  <li className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-primary" /> Widely used payment method
                  </li>
                  <li className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-primary" /> Easy integration
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant={paymentMethod === 'paypal' ? 'default' : 'outline'} 
                  className="w-full"
                  onClick={() => handleConnectPayment('paypal')}
                  disabled={isConnecting}
                >
                  {paymentMethod === 'paypal' ? 'Connected' : 'Connect PayPal'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      {/* Revenue Sharing */}
      <Card
        ref={revenueShareAnimation.ref}
        style={revenueShareAnimation.style}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Revenue Sharing
          </CardTitle>
          <CardDescription>
            Split your earnings with collaborators and team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showSplitForm ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Set up revenue sharing</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Split your earnings automatically with collaborators, producers, and others involved in your content creation
              </p>
              <Button onClick={() => setShowSplitForm(true)}>
                Configure Revenue Split
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Revenue Split Settings</Label>
                <p className="text-sm text-muted-foreground">
                  Add collaborators and assign percentage shares. Total must equal 100%.
                </p>
              </div>
              
              {collaborators.map((collaborator, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 items-center">
                  <div className="col-span-3">
                    <Input
                      placeholder="Email address"
                      value={collaborator.email}
                      onChange={(e) => handleCollaboratorChange(index, 'email', e.target.value)}
                    />
                  </div>
                  <div className="col-span-1">
                    <div className="flex items-center">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={collaborator.percentage}
                        onChange={(e) => handleCollaboratorChange(index, 'percentage', e.target.value)}
                      />
                      <span className="ml-1">%</span>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <Button 
                      variant="ghost"
                      onClick={() => handleRemoveCollaborator(index)}
                      disabled={collaborators.length === 1}
                      className="w-full"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between items-center pt-2">
                <Button 
                  variant="outline" 
                  onClick={handleAddCollaborator}
                  disabled={collaborators.length >= 5}
                >
                  Add Collaborator
                </Button>
                
                <div className="text-sm font-medium">
                  Total: {collaborators.reduce((sum, collab) => sum + collab.percentage, 0)}%
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowSplitForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSplitSettings}>
                  Save Split Settings
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;
