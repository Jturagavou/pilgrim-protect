import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getImpactStats,
  getMe,
  getMyReports,
  getSchoolDetails,
  getSchools,
  submitSprayReport,
  uploadImage,
} from '../lib/api';
import { getQueue, getSyncState } from '../lib/offlineQueue';

export const queryKeys = {
  me: ['me'],
  impact: ['impact'],
  queue: ['offlineQueue'],
  syncState: ['syncState'],
  schools: ['schools'],
  school: (id) => ['school', id],
  myReports: ['myReports'],
};

export function useMeQuery() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    retry: 1,
  });
}

export function useImpactQuery() {
  return useQuery({
    queryKey: queryKeys.impact,
    queryFn: getImpactStats,
    retry: 1,
  });
}

export function useQueueQuery() {
  return useQuery({
    queryKey: queryKeys.queue,
    queryFn: getQueue,
    staleTime: 5000,
  });
}

export function useSyncStateQuery() {
  return useQuery({
    queryKey: queryKeys.syncState,
    queryFn: getSyncState,
    staleTime: 5000,
  });
}

export function useSchoolsQuery() {
  return useQuery({
    queryKey: queryKeys.schools,
    queryFn: getSchools,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

export function useSchoolQuery(schoolId, initialSchool) {
  return useQuery({
    queryKey: queryKeys.school(schoolId),
    queryFn: () => getSchoolDetails(schoolId),
    initialData: initialSchool,
    retry: 1,
  });
}

export function useMyReportsQuery() {
  return useQuery({
    queryKey: queryKeys.myReports,
    queryFn: getMyReports,
    retry: 1,
  });
}

export function useSubmitReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ payload, localPhotos = [] }) => {
      const photoUrls = [];
      for (const uri of localPhotos) {
        const result = await uploadImage(uri);
        photoUrls.push(result.url);
      }
      return submitSprayReport({
        ...payload,
        photos: photoUrls.length ? photoUrls : payload.photos || [],
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myReports });
      queryClient.invalidateQueries({ queryKey: queryKeys.impact });
      queryClient.invalidateQueries({ queryKey: queryKeys.schools });
      if (variables?.payload?.school) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.school(variables.payload.school),
        });
      }
    },
  });
}
