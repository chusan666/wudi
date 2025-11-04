import { useState } from 'react';
import { AnalysisResult } from '../types';

interface AnalysisCardProps {
  analysisResult: AnalysisResult;
}

type TabType = 'overview' | 'engagement' | 'content' | 'recommendations';

const AnalysisCard = ({ analysisResult }: AnalysisCardProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  return (
    <div className="analysis-section">
      <div className="analysis-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 综合概览
        </button>
        <button
          className={`tab ${activeTab === 'engagement' ? 'active' : ''}`}
          onClick={() => setActiveTab('engagement')}
        >
          📈 互动数据
        </button>
        <button
          className={`tab ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          📝 内容分析
        </button>
        <button
          className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          💡 优化建议
        </button>
      </div>

      <div className="analysis-content">
        {activeTab === 'overview' && analysisResult.basic_info && (
          <div className="analysis-grid">
            <div className="analysis-item">
              <h4>平台</h4>
              <div className="value">{getPlatformName(analysisResult.basic_info.platform)}</div>
            </div>
            {analysisResult.basic_info.duration_category && (
              <div className="analysis-item">
                <h4>时长类型</h4>
                <div className="value">{analysisResult.basic_info.duration_category}</div>
                {analysisResult.basic_info.duration && (
                  <div className="label">{analysisResult.basic_info.duration}</div>
                )}
              </div>
            )}
            {analysisResult.basic_info.publish_date && (
              <div className="analysis-item">
                <h4>发布时间</h4>
                <div className="value">{analysisResult.basic_info.days_since_publish}天前</div>
                <div className="label">{analysisResult.basic_info.publish_date}</div>
              </div>
            )}
            {analysisResult.engagement && (
              <div className="analysis-item">
                <h4>人气指数</h4>
                <div className="value">{analysisResult.engagement.popularity_score}</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'engagement' && analysisResult.engagement && (
          <div className="analysis-grid">
            <div className="analysis-item">
              <h4>点赞数</h4>
              <div className="value">❤️ {analysisResult.engagement.likes}</div>
            </div>
            <div className="analysis-item">
              <h4>评论数</h4>
              <div className="value">💬 {analysisResult.engagement.comments}</div>
            </div>
            <div className="analysis-item">
              <h4>分享数</h4>
              <div className="value">🔗 {analysisResult.engagement.shares}</div>
            </div>
            {analysisResult.engagement.views && (
              <div className="analysis-item">
                <h4>播放量</h4>
                <div className="value">👁️ {analysisResult.engagement.views}</div>
              </div>
            )}
            <div className="analysis-item">
              <h4>总互动数</h4>
              <div className="value">✨ {analysisResult.engagement.total_interactions}</div>
            </div>
            {analysisResult.engagement.engagement_rate && (
              <div className="analysis-item">
                <h4>互动率</h4>
                <div className="value">{analysisResult.engagement.engagement_rate}</div>
                <div className="label">
                  {analysisResult.engagement.engagement_level}
                </div>
              </div>
            )}
            {analysisResult.engagement.comment_like_ratio && (
              <div className="analysis-item">
                <h4>评论/点赞比</h4>
                <div className="value">{analysisResult.engagement.comment_like_ratio}</div>
              </div>
            )}
            {analysisResult.engagement.share_like_ratio && (
              <div className="analysis-item">
                <h4>分享/点赞比</h4>
                <div className="value">{analysisResult.engagement.share_like_ratio}</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'content' && analysisResult.content && (
          <div>
            <div className="analysis-grid">
              <div className="analysis-item">
                <h4>标题长度</h4>
                <div className="value">{analysisResult.content.title_length} 字</div>
              </div>
              <div className="analysis-item">
                <h4>描述长度</h4>
                <div className="value">{analysisResult.content.description_length} 字</div>
              </div>
              <div className="analysis-item">
                <h4>标签数量</h4>
                <div className="value">{analysisResult.content.tags_count} 个</div>
              </div>
              {analysisResult.content.content_type && (
                <div className="analysis-item">
                  <h4>内容类型</h4>
                  <div className="value" style={{ fontSize: '1rem' }}>
                    {analysisResult.content.content_type.join('、')}
                  </div>
                </div>
              )}
            </div>

            {analysisResult.content.title_features && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ marginBottom: '15px', color: '#667eea' }}>标题特征</h3>
                <div className="analysis-grid">
                  {analysisResult.content.title_features.has_emoji && (
                    <div className="analysis-item">
                      <div className="label">✅ 包含表情符号</div>
                    </div>
                  )}
                  {analysisResult.content.title_features.has_numbers && (
                    <div className="analysis-item">
                      <div className="label">✅ 包含数字</div>
                    </div>
                  )}
                  {analysisResult.content.title_features.has_question && (
                    <div className="analysis-item">
                      <div className="label">✅ 包含疑问句</div>
                    </div>
                  )}
                  {analysisResult.content.title_features.has_exclamation && (
                    <div className="analysis-item">
                      <div className="label">✅ 包含感叹号</div>
                    </div>
                  )}
                  {analysisResult.content.title_features.has_engaging_keywords && (
                    <div className="analysis-item">
                      <div className="label">✅ 包含吸引力关键词</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && analysisResult.recommendations && (
          <div className="recommendations">
            {analysisResult.recommendations.map((rec, index) => (
              <div key={index} className={`recommendation ${rec.level}`}>
                <div className="type">{getRecommendationIcon(rec.level)} {rec.type}</div>
                <div className="message">{rec.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const getPlatformName = (platform: string): string => {
  const platforms: { [key: string]: string } = {
    'xiaohongshu': '小红书',
    'douyin': '抖音',
    'bilibili': '哔哩哔哩',
    'kuaishou': '快手',
  };
  return platforms[platform] || platform;
};

const getRecommendationIcon = (level: string): string => {
  const icons: { [key: string]: string } = {
    'success': '✅',
    'info': 'ℹ️',
    'warning': '⚠️',
    'error': '❌',
  };
  return icons[level] || 'ℹ️';
};

export default AnalysisCard;
