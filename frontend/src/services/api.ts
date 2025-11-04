import axios from 'axios';
import { VideoInfo, AnalysisResult, Platform } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const parseVideo = async (url: string): Promise<VideoInfo> => {
  const response = await api.post('/api/parse', { url });
  return response.data.data;
};

export const analyzeVideo = async (
  videoInfo: VideoInfo,
  analysisType: string = 'comprehensive'
): Promise<AnalysisResult> => {
  const response = await api.post('/api/analyze', {
    video_info: videoInfo,
    analysis_type: analysisType,
  });
  return response.data.data;
};

export const getPlatforms = async (): Promise<Platform[]> => {
  const response = await api.get('/api/platforms');
  return response.data.data;
};

export const healthCheck = async (): Promise<{ status: string; message: string }> => {
  const response = await api.get('/api/health');
  return response.data;
};
