# 使用指南

## 快速开始

### 1. 本地运行

```bash
# 安装依赖
pip install -r requirements.txt

# 启动服务
python main.py
```

### 2. Docker 运行

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## API 调用示例

### cURL 示例

#### 解析抖音视频

```bash
curl -X POST "http://localhost:8000/parse" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.douyin.com/video/7123456789"
  }'
```

#### 解析B站视频

```bash
curl -X POST "http://localhost:8000/parse" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.bilibili.com/video/BV1xx411c7XZ"
  }'
```

### Python 示例

```python
import requests

def parse_video(url):
    api_url = "http://localhost:8000/parse"
    response = requests.post(api_url, json={"url": url})
    
    if response.status_code == 200:
        data = response.json()
        if data['success']:
            print(f"平台: {data['platform']}")
            print(f"视频URL: {data['data'].get('video_url')}")
            print(f"标题: {data['data'].get('title')}")
        else:
            print(f"解析失败: {data.get('error')}")
    else:
        print(f"请求失败: {response.status_code}")

# 使用示例
urls = [
    "https://www.douyin.com/video/7123456789",
    "https://www.bilibili.com/video/BV1xx411c7XZ",
    "https://www.xiaohongshu.com/explore/xxxxx",
    "https://www.kuaishou.com/short-video/xxxxx"
]

for url in urls:
    parse_video(url)
```

### JavaScript 示例

```javascript
async function parseVideo(url) {
  try {
    const response = await fetch('http://localhost:8000/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: url })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('平台:', data.platform);
      console.log('视频URL:', data.data.video_url);
      console.log('标题:', data.data.title);
    } else {
      console.error('解析失败:', data.error);
    }
  } catch (error) {
    console.error('请求失败:', error);
  }
}

// 使用示例
parseVideo('https://www.douyin.com/video/7123456789');
```

### Go 示例

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

type ParseRequest struct {
    URL string `json:"url"`
}

type ParseResponse struct {
    Platform string                 `json:"platform"`
    Success  bool                   `json:"success"`
    Data     map[string]interface{} `json:"data"`
    Error    string                 `json:"error"`
}

func parseVideo(url string) error {
    reqBody := ParseRequest{URL: url}
    jsonData, err := json.Marshal(reqBody)
    if err != nil {
        return err
    }
    
    resp, err := http.Post(
        "http://localhost:8000/parse",
        "application/json",
        bytes.NewBuffer(jsonData),
    )
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return err
    }
    
    var result ParseResponse
    err = json.Unmarshal(body, &result)
    if err != nil {
        return err
    }
    
    if result.Success {
        fmt.Printf("平台: %s\n", result.Platform)
        fmt.Printf("视频URL: %v\n", result.Data["video_url"])
        fmt.Printf("标题: %v\n", result.Data["title"])
    } else {
        fmt.Printf("解析失败: %s\n", result.Error)
    }
    
    return nil
}

func main() {
    parseVideo("https://www.douyin.com/video/7123456789")
}
```

## 平台特定说明

### 小红书 (Xiaohongshu)

支持的URL格式：
- `https://www.xiaohongshu.com/explore/[note_id]`
- `https://xhslink.com/[short_code]` (短链接)

返回数据包含：
- 笔记ID
- 标题和描述
- 作者信息
- 视频URL（视频笔记）
- 图片列表（图文笔记）

### 抖音 (Douyin)

支持的URL格式：
- `https://www.douyin.com/video/[video_id]`
- `https://v.douyin.com/[short_code]` (短链接)

返回数据包含：
- 视频ID
- 标题
- 作者信息
- 统计数据（点赞、评论、分享）
- 视频URL
- 音乐信息

### B站 (Bilibili)

支持的URL格式：
- `https://www.bilibili.com/video/[BV_id]`
- `https://www.bilibili.com/video/av[av_id]`
- `https://b23.tv/[short_code]` (短链接)

返回数据包含：
- BV号和AV号
- 标题和描述
- UP主信息
- 视频时长
- 统计数据（播放、点赞、收藏等）
- 视频URL
- 分P信息

### 快手 (Kuaishou)

支持的URL格式：
- `https://www.kuaishou.com/short-video/[video_id]`
- `https://v.kuaishou.com/[short_code]` (短链接)
- `https://ksurl.cn/[short_code]` (短链接)

返回数据包含：
- 视频ID
- 标题
- 作者信息
- 统计数据（播放、点赞、评论）
- 视频URL
- 封面图

## 常见问题

### Q: 为什么有些视频解析不出来？

A: 可能的原因：
1. 视频链接无效或已被删除
2. 平台更新了页面结构
3. 需要登录才能访问
4. 地区限制

### Q: 视频URL的有效期是多久？

A: 不同平台的视频URL有效期不同，通常为几小时到几天。建议获取后尽快使用。

### Q: 可以下载视频吗？

A: 本API只提供视频链接提取，不提供下载功能。你可以使用返回的URL自行下载。

### Q: 如何批量解析？

A: 可以编写脚本循环调用API，但请注意：
1. 控制请求频率，避免被封IP
2. 添加适当的延迟（建议每个请求间隔1-3秒）
3. 使用代理池分散请求

### Q: API有访问限制吗？

A: 本地部署的API没有限制，但建议：
1. 合理控制并发请求数
2. 避免频繁请求同一平台
3. 遵守各平台的使用条款

## 性能优化建议

1. **使用缓存**: 对相同URL的解析结果进行缓存
2. **异步请求**: 使用异步方式批量处理
3. **代理池**: 使用代理避免IP限制
4. **重试机制**: 实现自动重试逻辑
5. **监控日志**: 记录失败请求便于排查

## 开发与调试

### 启用调试模式

```bash
# 设置环境变量
export DEBUG=true

# 或在 .env 文件中设置
DEBUG=true
```

### 查看详细日志

```bash
# 设置日志级别
export LOG_LEVEL=DEBUG
```

### 运行测试

```bash
# 运行所有测试
pytest

# 运行特定测试
pytest tests/test_api.py -v

# 查看覆盖率
pytest --cov=.
```

## 部署建议

### 生产环境

1. 使用进程管理器（如 Supervisor, PM2）
2. 配置反向代理（Nginx）
3. 启用 HTTPS
4. 设置请求限制
5. 实现日志轮转
6. 监控服务状态

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 许可与免责

使用本工具时请：
1. 遵守各平台的使用条款
2. 尊重内容创作者的权益
3. 不要用于商业用途
4. 遵守相关法律法规
