import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { normalizeFeatureName, getFeatureLimit, getFeatureLabel } from '../config/subscriptions';

export interface FeatureUsageState {
  featureName: string;
  normalizedFeature: string;
  label: string;
  plan: 'free' | 'premium';
  limit: number;
  used: number;
  remaining: number;
  isExhausted: boolean;
  resetInFormatted: string;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useFeatureUsage(featureName: string): FeatureUsageState {
  const normFeature = normalizeFeatureName(featureName);
  const label = getFeatureLabel(normFeature);

  const [plan, setPlan] = useState<'free' | 'premium'>('free');
  const [used, setUsed] = useState<number>(0);
  const [limit, setLimit] = useState<number>(() => getFeatureLimit('free', normFeature));
  const [resetInFormatted, setResetInFormatted] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUsage = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      const userId = session.user.id;

      // 1. Fetch user's server-side plan
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', userId)
        .maybeSingle();

      const userPlan: 'free' | 'premium' = subData?.plan === 'premium' ? 'premium' : 'free';
      const fLimit = getFeatureLimit(userPlan, normFeature);

      setPlan(userPlan);
      setLimit(fLimit);

      // 2. Fetch usage within the last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: usageRecords } = await supabase
        .from('ai_usage')
        .select('created_at')
        .eq('user_id', userId)
        .eq('feature_name', normFeature)
        .eq('success', true)
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: true });

      const count = usageRecords?.length || 0;
      setUsed(count);

      // 3. Compute reset countdown if limit exhausted or records exist
      if (usageRecords && usageRecords.length > 0) {
        const oldestRecord = usageRecords[0].created_at;
        const resetTimestamp = new Date(oldestRecord).getTime() + 24 * 60 * 60 * 1000;
        const diffMs = Math.max(0, resetTimestamp - Date.now());

        const totalMinutes = Math.ceil(diffMs / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;

        if (hours > 0) {
          setResetInFormatted(`~${hours}h ${mins > 0 ? `${mins}m` : ''}`);
        } else {
          setResetInFormatted(`~${mins}m`);
        }
      } else {
        setResetInFormatted('');
      }
    } catch (err) {
      console.error(`[useFeatureUsage] Error loading usage for ${normFeature}:`, err);
    } finally {
      setLoading(false);
    }
  }, [normFeature]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const remaining = Math.max(0, limit - used);
  const isExhausted = remaining === 0;

  return {
    featureName,
    normalizedFeature: normFeature,
    label,
    plan,
    limit,
    used,
    remaining,
    isExhausted,
    resetInFormatted,
    loading,
    refetch: fetchUsage,
  };
}
