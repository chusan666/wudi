import { useState, useEffect } from 'react';
import './App.css';
import { VideoInfo, AnalysisResult, Platform } from './types';
import { parseVideo, analyzeVideo, getPlatforms } from './services/api';
import VideoInfoCard from './components/VideoInfoCard';
import AnalysisCard from './components/AnalysisCard';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    try {
      const data = await getPlatforms();
      setPlatforms(data);
    } catch (err) {
      console.error('Failed to load platforms:', err);
    }
  };

  const handleParse = async () => {
    if (!url.trim()) {
      setError('请输入视频链接');
      return;
    }

    setLoading(true);
    setError('');
    setVideoInfo(null);
    setAnalysisResult(null);

    try {
      const data = await parseVideo(url);
      setVideoInfo(data);
    } catch (err: any) {
      setError(err.response?.data?.error || '解析失败，请检查链接是否正确');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!videoInfo) {
      setError('请先解析视频');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const data = await analyzeVideo(videoInfo);
      setAnalysisResult(data);
    } catch (err: any) {
      setError(err.response?.data?.error || '分析失败，请重试');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleParse();
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🎬 社交媒体视频解析分析工具</h1>
          <p>支持小红书、抖音、B站、快手等主流平台</p>
        </header>

        <div className="main-card">
          <div className="input-section">
            <div className="input-group">
              <input
                type="text"
                placeholder="请粘贴视频链接..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <button
                className="btn btn-primary"
                onClick={handleParse}
                disabled={loading}
              >
                {loading ? '解析中...' : '🔍 解析'}
              </button>
            </div>

            {platforms.length > 0 && (
              <div className="platforms">
                {platforms.map((platform) => (
                  <div key={platform.id} className="platform-tag">
                    <span className="icon">{platform.icon}</span>
                    <span>{platform.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="error">
              ⚠️ {error}
            </div>
          )}

          {loading && (
            <div className="loading">
              正在解析视频
            </div>
          )}

          {videoInfo && (
            <>
              <VideoInfoCard videoInfo={videoInfo} />

              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                >
                  {analyzing ? '分析中...' : '🔬 拆解分析'}
                </button>
              </div>

              {analyzing && (
                <div className="loading">
                  正在分析视频内容
                </div>
              )}

              {analysisResult && (
                <AnalysisCard analysisResult={analysisResult} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
