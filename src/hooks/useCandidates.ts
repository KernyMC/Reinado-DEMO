import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { candidatesService, Candidate, CreateCandidateData, UpdateCandidateData } from '@/services/api';
import { toast } from 'sonner';

export const useCandidates = () => {
  const queryClient = useQueryClient();

  // Get all candidates
  const candidates = useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      console.log('🔄 Fetching candidates...');
      try {
        const result = await candidatesService.getAll();
        console.log('✅ Candidates fetched:', result.length, result);
        return result;
      } catch (error) {
        console.error('❌ Error fetching candidates:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Get candidate by ID
  const useCandidate = (id: string) => {
    return useQuery({
      queryKey: ['candidates', id],
      queryFn: () => candidatesService.getById(id),
      enabled: !!id,
    });
  };

  // Get candidate results
  const useCandidateResults = (eventId?: string) => {
    return useQuery({
      queryKey: ['candidates', 'results', eventId],
      queryFn: () => candidatesService.getResults(eventId),
      staleTime: 30 * 1000, // 30 seconds
    });
  };

  // Create candidate mutation with FormData support
  const createCandidate = useMutation({
    mutationFn: (data: CreateCandidateData) => {
      // Convert to FormData if image is included
      if (data.image) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('major', data.major);
        formData.append('department', data.department);
        formData.append('biography', data.biography);
        formData.append('image', data.image);
        return candidatesService.create(formData);
      }
      // Send as JSON if no image
      return candidatesService.create({
        name: data.name,
        major: data.major,
        department: data.department,
        biography: data.biography
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidata creada exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Error al crear candidata';
      toast.error(message);
    },
  });

  // Update candidate mutation with FormData support
  const updateCandidate = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCandidateData }) => {
      // Convert to FormData if image is included
      if (data.image) {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.major) formData.append('major', data.major);
        if (data.department) formData.append('department', data.department);
        if (data.biography) formData.append('biography', data.biography);
        formData.append('image', data.image);
        return candidatesService.update(id, formData);
      }
      // Send as JSON if no image
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.major) updateData.major = data.major;
      if (data.department) updateData.department = data.department;
      if (data.biography) updateData.biography = data.biography;
      return candidatesService.update(id, updateData);
    },
    onSuccess: (updatedCandidate) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.setQueryData(['candidates', updatedCandidate.id], updatedCandidate);
      toast.success('Candidata actualizada exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Error al actualizar candidata';
      toast.error(message);
    },
  });

  // Delete candidate mutation
  const deleteCandidate = useMutation({
    mutationFn: (id: string) => candidatesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidata eliminada exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Error al eliminar candidata';
      toast.error(message);
    },
  });

  return {
    candidates: candidates.data || [],
    isLoading: candidates.isLoading,
    error: candidates.error,
    refetch: candidates.refetch,
    useCandidate,
    useCandidateResults,
    createCandidate,
    updateCandidate,
    deleteCandidate,
  };
}; 