import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Draft } from '@shared/schema';

export function useDrafts(toolType?: string) {
  const queryClient = useQueryClient();
  
  const draftsQuery = useQuery({
    queryKey: ['/api/drafts', toolType],
    queryFn: async () => {
      const params = toolType ? `?toolType=${toolType}` : '';
      const response = await fetch(`/api/drafts${params}`);
      if (!response.ok) throw new Error('Failed to fetch drafts');
      return response.json() as Promise<Draft[]>;
    },
  });

  const createDraftMutation = useMutation({
    mutationFn: async (draftData: {
      toolType: string;
      title: string;
      formData: Record<string, any>;
      partialOutput?: Record<string, any>;
      caseId?: number;
    }) => {
      return apiRequest('POST', '/api/drafts', draftData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drafts'] });
    },
  });

  const updateDraftMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<Draft>) => {
      return apiRequest('PUT', `/api/drafts/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drafts'] });
    },
  });

  const deleteDraftMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/drafts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drafts'] });
    },
  });

  return {
    drafts: draftsQuery.data || [],
    isDraftsLoading: draftsQuery.isLoading,
    createDraft: createDraftMutation.mutate,
    updateDraft: updateDraftMutation.mutate,
    deleteDraft: deleteDraftMutation.mutate,
    isCreating: createDraftMutation.isPending,
    isUpdating: updateDraftMutation.isPending,
    isDeleting: deleteDraftMutation.isPending,
  };
}