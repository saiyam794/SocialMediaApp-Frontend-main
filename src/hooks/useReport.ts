import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportAPI } from '@/services/api';

export const useReportFeed = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ feedId, reason }: { feedId: string; reason?: string }) => {
      console.log('🚨 Reporting feed:', feedId, 'Reason:', reason);
      return reportAPI.reportFeed(feedId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      console.log('✅ Feed reported successfully');
    },
    onError: (error: any) => {
      console.error('❌ Failed to report feed:', error);
    },
  });
};

export const useRemoveReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (feedId: string) => reportAPI.removeReport(feedId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      console.log('Report removed successfully');
    },
  });
};