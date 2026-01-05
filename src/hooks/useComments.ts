
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentAPI } from '@/services/api';

export const useComments = (feedId: string, page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['comments', feedId, page, limit],
    queryFn: () => commentAPI.getComments(feedId, page, limit),
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ feedId, content }: { feedId: string; content: string }) =>
      commentAPI.createComment(feedId, content),
    onSuccess: (_, { feedId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', feedId] });
      queryClient.invalidateQueries({ queryKey: ['feed', feedId] });
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      commentAPI.updateComment(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commentAPI.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
};
