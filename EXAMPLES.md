# 使用示例

## 支持的链接格式

### 小红书 (Xiaohongshu)
```
https://www.xiaohongshu.com/discovery/item/[笔记ID]
https://xhslink.com/[短链接]
```

### 抖音 (Douyin)
```
https://www.douyin.com/video/[视频ID]
https://v.douyin.com/[短链接]
```

### 哔哩哔哩 (Bilibili)
```
https://www.bilibili.com/video/BV[视频ID]
https://b23.tv/[短链接]
```

### 快手 (Kuaishou)
```
https://www.kuaishou.com/short-video/[视频ID]
https://ksurl.cn/[短链接]
```

## API 使用示例

### 解析视频

**请求:**
```bash
curl -X POST http://localhost:5000/api/parse \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.bilibili.com/video/BVxxx"}'
```

**响应:**
```json
{
  "success": true,
  "data": {
    "title": "视频标题",
    "author": "作者名称",
    "description": "视频描述",
    "cover": "封面URL",
    "video_url": "视频URL",
    "likes": 1000,
    "comments": 100,
    "shares": 50,
    "views": 10000,
    "tags": ["标签1", "标签2"],
    "platform": "bilibili"
  }
}
```

### 分析视频

**请求:**
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "video_info": {...},
    "analysis_type": "comprehensive"
  }'
```

**响应:**
```json
{
  "success": true,
  "data": {
    "basic_info": {
      "title": "视频标题",
      "author": "作者",
      "platform": "bilibili",
      "duration": "3分25秒",
      "duration_category": "中短视频（1-3分钟）"
    },
    "engagement": {
      "likes": "1000",
      "comments": "100",
      "shares": "50",
      "views": "1.0万",
      "engagement_rate": "11.50%",
      "engagement_level": "优秀",
      "popularity_score": "爆款视频"
    },
    "content": {
      "title_length": 20,
      "tags_count": 5,
      "content_type": ["教程/教学"]
    },
    "recommendations": [
      {
        "type": "engagement",
        "level": "success",
        "message": "优秀的互动率！内容很受欢迎，继续保持"
      }
    ]
  }
}
```

### 获取支持的平台

**请求:**
```bash
curl http://localhost:5000/api/platforms
```

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": "xiaohongshu",
      "name": "小红书",
      "icon": "📱",
      "example": "https://www.xiaohongshu.com/discovery/item/..."
    },
    ...
  ]
}
```

## 前端集成示例

```typescript
import { parseVideo, analyzeVideo } from './services/api';

// 解析视频
const videoInfo = await parseVideo('https://www.bilibili.com/video/BVxxx');

// 分析视频
const analysis = await analyzeVideo(videoInfo, 'comprehensive');
```

## 分析类型

- `comprehensive`: 综合分析（默认）
- `engagement`: 仅互动数据分析
- `content`: 仅内容分析

## 注意事项

1. 某些平台可能需要登录才能访问完整数据
2. 短链接会自动重定向到原始链接
3. 解析速度取决于目标网站的响应时间
4. 建议合理使用，避免频繁请求
