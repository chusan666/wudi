import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export function useParseVideo(url: string) {
  return useQuery({
    queryKey: ['parse-video', url],
    queryFn: () => apiClient.parseVideo(url),
    enabled: !!url,
  });
}

export function usePlatforms() {
  return useQuery({
    queryKey: ['platforms'],
    queryFn: apiClient.getPlatforms,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: apiClient.getHealth,
    retry: false,
    refetchInterval: 30000, // Check every 30 seconds
  });
}