
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DemoInviteCode = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateDemoCode = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-invite', {
        body: { isDemo: true }
      });

      if (error) throw error;
      
      setDemoCode(data.invite.code);
      toast.success('Demo invite code generated successfully!');
    } catch (error: any) {
      console.error('Error generating demo code:', error);
      toast.error('Failed to generate demo code');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!demoCode) return;
    
    navigator.clipboard.writeText(demoCode);
    setCopied(true);
    toast.success('Demo code copied to clipboard');
    
    setTimeout(() => setCopied(false), 2000);
  };

  const copyInviteLink = () => {
    if (!demoCode) return;
    
    const inviteLink = `${window.location.origin}/invite/${demoCode}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success('Invite link copied to clipboard');
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Demo Account Access</CardTitle>
        <CardDescription>
          Generate a demo invite code to test the sign-up process
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {demoCode ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Your demo invite code:</p>
                <div className="flex items-center gap-2">
                  <code className="font-mono bg-muted px-3 py-2 rounded text-sm flex-1">{demoCode}</code>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={copyToClipboard}
                    title="Copy code"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Use this link to sign up:</p>
              <div className="flex items-center gap-2">
                <Input 
                  value={`${window.location.origin}/invite/${demoCode}`}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={copyInviteLink}
                  title="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="bg-primary/10 p-3 rounded-md">
              <p className="text-sm">
                <span className="font-semibold">Note:</span> This demo code can be reused multiple times for testing.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 border rounded-lg border-dashed text-center">
            <p className="text-muted-foreground mb-4">
              Click the button below to generate a demo invite code
            </p>
            <Button 
              onClick={generateDemoCode} 
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Demo Code'}
            </Button>
          </div>
        )}
      </CardContent>
      {demoCode && (
        <CardFooter className="flex justify-center">
          <Badge variant="outline" className="text-xs">
            For testing purposes only
          </Badge>
        </CardFooter>
      )}
    </Card>
  );
};

export default DemoInviteCode;
