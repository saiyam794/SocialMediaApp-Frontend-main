import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { feedAPI } from "@/services/api";
import { Feed, PaginatedResponse } from "@/types";

export const useFeed = (feedId: string) => {
  return useQuery({
    queryKey: ['feed', feedId],
    queryFn: () => feedAPI.getFeed(feedId),
  });
};

export const useFeeds = (page: number = 1, limit: number = 10) => {
  return useQuery<PaginatedResponse<Feed>>({
    queryKey: ['feeds', page, limit],
    queryFn: () => feedAPI.getFeeds(page, limit),
    placeholderData: keepPreviousData, // 🔥 pagination smooth
  });
};

export const useCreateFeed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      content: string;
      images?: string[];
      imageLayout?: string;
    }) => feedAPI.createFeed(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['feeds'],
        exact: false, // ✅ IMPORTANT
      });
    },
  });
};

export const useUpdateFeed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      feedAPI.updateFeed(id, data),

    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['feed', id] });

      queryClient.invalidateQueries({
        queryKey: ['feeds'],
        exact: false, // ✅ IMPORTANT
      });
    },
  });
};

export const useDeleteFeed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => feedAPI.deleteFeed(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['feeds'],
        exact: false, // ✅ IMPORTANT
      });
    },
  });
};
