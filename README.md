# 视频链接解析API

这是一个用于提取小红书、抖音、B站、快手等社交媒体平台视频地址的全栈应用，包含后端API和前端界面。

## 项目概览

- **后端API**: FastAPI服务，提供社交媒体内容解析功能
- **前端界面**: Next.js应用，提供用户友好的界面查看详细内容
- **支持平台**: 小红书、抖音、B站、快手

## 支持的平台

- 🟥 **小红书** (Xiaohongshu) - xiaohongshu.com, xhslink.com
- 🎵 **抖音** (Douyin) - douyin.com, iesdouyin.com
- 📺 **B站** (Bilibili) - bilibili.com, b23.tv
- ⚡ **快手** (Kuaishou) - kuaishou.com, ksurl.cn

## 快速开始

### 1. 启动后端服务

```bash
# 安装后端依赖
pip install -r requirements.txt

# 启动API服务
python main.py
```

后端服务将在 `http://localhost:8000` 启动

### 2. 启动前端应用

```bash
# 进入前端目录
cd frontend

# 安装前端依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用将在 `http://localhost:3000` 启动

### 3. 访问应用

- **前端界面**: http://localhost:3000
- **API文档**: http://localhost:8000/docs
- **API健康检查**: http://localhost:8000/health

## 功能特性

### 后端API
- ✅ 自动识别平台类型
- ✅ 提取视频直链地址
- ✅ 获取视频元信息（标题、作者、统计数据等）
- ✅ 处理短链接重定向
- ✅ RESTful API 接口
- ✅ 跨域支持 (CORS)

### 前端界面
- ✅ 现代化响应式设计
- ✅ 详细内容展示页面
- ✅ 用户资料和统计信息
- ✅ 交互式图表和数据可视化
- ✅ 智能缓存和数据管理
- ✅ 移动端适配

## 安装

### 1. 克隆项目

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. 安装依赖

```bash
# 安装后端依赖
pip install -r requirements.txt

# 安装前端依赖
cd frontend
npm install
cd ..
```

## 使用方法

### 前端界面

1. 启动前端应用：`cd frontend && npm run dev`
2. 访问 http://localhost:3000
3. 使用界面功能：
   - **首页**: 查看应用概览和快速导航
   - **解析页面**: 输入社交媒体URL进行解析
   - **笔记详情**: `/notes/[id]` - 查看笔记详细信息和统计数据
   - **用户资料**: `/users/[id]` - 查看用户资料和内容列表

### API 接口

后端API在 `http://localhost:8000` 提供以下接口：

#### 1. 解析视频链接

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
├── frontend/              # Next.js 前端应用
│   ├── app/              # 页面路由
│   ├── components/       # React 组件
│   ├── hooks/           # 自定义 Hooks
│   ├── lib/             # 工具函数和 API 客户端
│   ├── package.json     # 前端依赖
│   └── README.md        # 前端文档
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

### 后端
- **FastAPI**: 现代、快速的Web框架
- **httpx**: 异步HTTP客户端
- **BeautifulSoup4**: HTML解析库
- **Pydantic**: 数据验证和设置管理

### 前端
- **Next.js 14**: React全栈框架
- **TypeScript**: 类型安全的JavaScript
- **Tailwind CSS**: 实用优先的CSS框架
- **shadcn/ui**: 现代化组件库
- **TanStack Query**: 数据获取和状态管理
- **Recharts**: 数据可视化图表库
- **Jest**: JavaScript测试框架

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
