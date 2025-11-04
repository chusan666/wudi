# 视频链接解析API

这是一个用于提取小红书、抖音、B站、快手等社交媒体平台视频地址的API工具。

## 支持的平台

- 🟥 **小红书** (Xiaohongshu) - xiaohongshu.com, xhslink.com
- 🎵 **抖音** (Douyin) - douyin.com, iesdouyin.com
- 📺 **B站** (Bilibili) - bilibili.com, b23.tv
- ⚡ **快手** (Kuaishou) - kuaishou.com, ksurl.cn

## 功能特性

- ✅ 自动识别平台类型
- ✅ 提取视频直链地址
- ✅ 获取视频元信息（标题、作者、统计数据等）
- ✅ 处理短链接重定向
- ✅ RESTful API 接口
- ✅ 跨域支持 (CORS)

## 安装

### 1. 克隆项目

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

## 使用方法

### 启动服务

```bash
python main.py
```

或使用 uvicorn:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

服务将在 `http://localhost:8000` 启动

### API 文档

启动服务后，访问以下地址查看自动生成的API文档：

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API 接口

### 1. 解析视频链接

**接口:** `POST /parse`

**请求体:**
```json
{
  "url": "https://www.douyin.com/video/7xxxxxx"
}
```

**响应示例 (抖音):**
```json
{
  "platform": "douyin",
  "success": true,
  "data": {
    "aweme_id": "7xxxxxx",
    "title": "视频标题",
    "author": {
      "nickname": "作者昵称",
      "uid": "123456",
      "avatar": "头像URL"
    },
    "statistics": {
      "digg_count": 1000,
      "comment_count": 100,
      "share_count": 50
    },
    "video": {
      "duration": 30000,
      "width": 1080,
      "height": 1920,
      "cover": "封面URL"
    },
    "video_url": "视频直链地址",
    "music": {
      "title": "音乐标题",
      "author": "音乐作者",
      "url": "音乐URL"
    }
  }
}
```

**响应示例 (B站):**
```json
{
  "platform": "bilibili",
  "success": true,
  "data": {
    "bvid": "BVxxxxxxx",
    "aid": 123456,
    "title": "视频标题",
    "desc": "视频描述",
    "owner": {
      "mid": 123456,
      "name": "UP主名称",
      "face": "头像URL"
    },
    "duration": 300,
    "statistics": {
      "view": 10000,
      "danmaku": 500,
      "reply": 200,
      "favorite": 800,
      "coin": 300,
      "share": 100,
      "like": 1500
    },
    "video_url": "视频直链地址"
  }
}
```

### 2. 获取支持的平台列表

**接口:** `GET /platforms`

**响应:**
```json
{
  "platforms": [
    {
      "name": "小红书",
      "key": "xiaohongshu",
      "domains": ["xiaohongshu.com", "xhslink.com"]
    },
    {
      "name": "抖音",
      "key": "douyin",
      "domains": ["douyin.com", "iesdouyin.com"]
    }
  ]
}
```

### 3. 健康检查

**接口:** `GET /health`

**响应:**
```json
{
  "status": "ok"
}
```

## 使用示例

### Python

```python
import requests

url = "https://www.douyin.com/video/7xxxxxx"
response = requests.post(
    "http://localhost:8000/parse",
    json={"url": url}
)

data = response.json()
if data["success"]:
    print(f"视频地址: {data['data']['video_url']}")
    print(f"视频标题: {data['data']['title']}")
```

### cURL

```bash
curl -X POST "http://localhost:8000/parse" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.douyin.com/video/7xxxxxx"}'
```

### JavaScript/Fetch

```javascript
fetch('http://localhost:8000/parse', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://www.douyin.com/video/7xxxxxx'
  })
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('视频地址:', data.data.video_url);
    console.log('视频标题:', data.data.title);
  }
});
```

## 项目结构

```
.
├── main.py                 # FastAPI 主应用
├── requirements.txt        # 项目依赖
├── README.md              # 项目文档
├── parsers/               # 解析器模块
│   ├── __init__.py
│   ├── base.py           # 基础解析器类
│   ├── xiaohongshu.py    # 小红书解析器
│   ├── douyin.py         # 抖音解析器
│   ├── bilibili.py       # B站解析器
│   └── kuaishou.py       # 快手解析器
└── tests/                # 测试文件
    └── test_api.py
```

## 注意事项

1. **法律合规**: 本工具仅供学习和研究使用，请遵守各平台的使用条款和相关法律法规
2. **反爬虫**: 各平台可能有反爬虫机制，建议合理使用，避免频繁请求
3. **数据时效性**: 视频链接可能有时效性，建议及时使用获取的链接
4. **隐私保护**: 请尊重内容创作者的权益，不要滥用获取的数据

## 技术栈

- **FastAPI**: 现代、快速的Web框架
- **httpx**: 异步HTTP客户端
- **BeautifulSoup4**: HTML解析库
- **Pydantic**: 数据验证和设置管理

## 开发路线图

- [ ] 添加更多平台支持（TikTok、Instagram、YouTube等）
- [ ] 实现缓存机制提高性能
- [ ] 添加下载功能
- [ ] 支持批量解析
- [ ] 添加代理支持
- [ ] Docker 部署支持

## License

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 免责声明

本项目仅供学习交流使用，不得用于商业用途。使用本工具时请遵守相关平台的使用协议和法律法规。由使用本工具产生的任何问题，开发者概不负责。
