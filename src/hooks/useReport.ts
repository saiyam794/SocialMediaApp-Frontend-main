import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportAPI } from '@/services/api';

export const useReportFeed = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ feedId, reason }: { feedId: string; reason?: string }) => {
      return reportAPI.reportFeed(feedId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
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
    },
  });
};