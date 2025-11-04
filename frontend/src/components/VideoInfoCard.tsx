import { VideoInfo } from '../types';

interface VideoInfoCardProps {
  videoInfo: VideoInfo;
}

const VideoInfoCard = ({ videoInfo }: VideoInfoCardProps) => {
  return (
    <div className="video-info">
      <div className="info-header">
        {videoInfo.cover && (
          <img
            src={videoInfo.cover}
            alt={videoInfo.title}
            className="cover-image"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <div className="info-details">
          <h2>{videoInfo.title}</h2>
          {videoInfo.author && (
            <div className="author">
              👤 作者：{videoInfo.author}
            </div>
          )}
          {videoInfo.description && (
            <div className="description">
              {videoInfo.description}
            </div>
          )}
          <div className="stats">
            {videoInfo.likes > 0 && (
              <div className="stat-item">
                <span className="icon">❤️</span>
                <span>{formatNumber(videoInfo.likes)} 点赞</span>
              </div>
            )}
            {videoInfo.comments > 0 && (
              <div className="stat-item">
                <span className="icon">💬</span>
                <span>{formatNumber(videoInfo.comments)} 评论</span>
              </div>
            )}
            {videoInfo.shares > 0 && (
              <div className="stat-item">
                <span className="icon">🔗</span>
                <span>{formatNumber(videoInfo.shares)} 分享</span>
              </div>
            )}
            {videoInfo.views && videoInfo.views > 0 && (
              <div className="stat-item">
                <span className="icon">👁️</span>
                <span>{formatNumber(videoInfo.views)} 播放</span>
              </div>
            )}
            {videoInfo.coins && videoInfo.coins > 0 && (
              <div className="stat-item">
                <span className="icon">🪙</span>
                <span>{formatNumber(videoInfo.coins)} 投币</span>
              </div>
            )}
            {videoInfo.favorites && videoInfo.favorites > 0 && (
              <div className="stat-item">
                <span className="icon">⭐</span>
                <span>{formatNumber(videoInfo.favorites)} 收藏</span>
              </div>
            )}
          </div>
          {videoInfo.tags && videoInfo.tags.length > 0 && (
            <div className="tags">
              {videoInfo.tags.map((tag, index) => (
                <span key={index} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  return num.toString();
};

export default VideoInfoCard;
