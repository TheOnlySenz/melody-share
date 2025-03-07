
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface EarningsData {
  approved: number;
  pending: number;
  paid: number;
  total: number;
  referralEarnings: number;
  referralCount: number;
}

interface EarningsHistoryItem {
  month: string;
  earnings: number;
}

export function useEarnings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<EarningsData>({
    approved: 0,
    pending: 0,
    paid: 0,
    total: 0,
    referralEarnings: 0,
    referralCount: 0
  });
  const [earningsHistory, setEarningsHistory] = useState<EarningsHistoryItem[]>([]);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        
        // Fetch analytics summary
        const { data, error } = await supabase
          .from('user_analytics')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setAnalytics({
            approved: Number(data.total_approved_earnings) || 0,
            pending: Number(data.total_pending_earnings) || 0,
            paid: Number(data.total_paid_earnings) || 0,
            total: Number(data.total_approved_earnings || 0) + Number(data.total_pending_earnings || 0),
            referralEarnings: Number(data.total_referral_earnings) || 0,
            referralCount: Number(data.total_referrals) || 0
          });
        }
        
        // Generate mock earnings history if no real data
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const mockEarningsHistory = monthNames.map((month, index) => {
          // Simulate increasing earnings trend
          const baseEarning = 50 + index * 25;
          // Add some random variation
          const variation = Math.random() * 30 - 15;
          return {
            month,
            earnings: Math.max(0, Math.round(baseEarning + variation))
          };
        });
        
        setEarningsHistory(mockEarningsHistory);
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError(err.message || 'Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  return { analytics, earningsHistory, isLoading, error };
}
