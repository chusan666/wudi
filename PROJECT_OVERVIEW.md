# 项目总览

## 🎯 项目简介

**社交媒体视频链接解析分析工具** 是一款功能强大的在线工具，帮助用户快速解析和分析来自主流中文社交媒体平台的视频内容。

### 核心功能

1. **多平台支持**
   - 📱 小红书 (Xiaohongshu)
   - 🎵 抖音 (Douyin)
   - 📺 哔哩哔哩 (Bilibili)
   - ⚡ 快手 (Kuaishou)

2. **视频信息提取**
   - 标题、描述、作者
   - 封面图片、视频链接
   - 互动数据（点赞、评论、分享、播放量）
   - 标签信息

3. **智能内容分析**
   - 基础信息分析（平台、时长、发布时间）
   - 互动数据分析（互动率、人气指数）
   - 内容特征分析（标题特征、内容类型）
   - 个性化优化建议

## 🏗️ 技术架构

### 后端技术栈
- **框架**: Flask 3.0.0
- **HTTP请求**: Requests
- **HTML解析**: BeautifulSoup4
- **跨域支持**: Flask-CORS
- **视频处理**: yt-dlp (可选)

### 前端技术栈
- **框架**: React 18.2.0
- **类型系统**: TypeScript
- **构建工具**: Vite 5.0
- **HTTP客户端**: Axios
- **样式**: 原生CSS（渐变设计）

### 部署方案
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx
- **进程管理**: Systemd (可选)

## 📂 项目结构

```
social-video-parser/
├── backend/                    # Python后端服务
│   ├── app.py                 # Flask主应用
│   ├── parsers/               # 平台解析器模块
│   │   ├── __init__.py
│   │   ├── base_parser.py     # 解析器基类
│   │   ├── platform_detector.py  # 平台识别
│   │   ├── xiaohongshu_parser.py # 小红书解析
│   │   ├── douyin_parser.py   # 抖音解析
│   │   ├── bilibili_parser.py # B站解析
│   │   └── kuaishou_parser.py # 快手解析
│   ├── analyzer/              # 分析模块
│   │   ├── __init__.py
│   │   └── video_analyzer.py  # 视频内容分析
│   ├── requirements.txt       # Python依赖
│   ├── test_parsers.py        # 解析器测试
│   └── test_api.py           # API测试
│
├── frontend/                  # React前端应用
│   ├── src/
│   │   ├── components/        # React组件
│   │   │   ├── VideoInfoCard.tsx   # 视频信息卡片
│   │   │   └── AnalysisCard.tsx    # 分析结果卡片
│   │   ├── services/          # API服务层
│   │   │   └── api.ts
│   │   ├── types/             # TypeScript类型
│   │   │   └── index.ts
│   │   ├── App.tsx            # 主应用组件
│   │   ├── App.css            # 样式文件
│   │   ├── main.tsx           # 入口文件
│   │   └── vite-env.d.ts      # Vite类型定义
│   ├── public/                # 静态资源
│   ├── index.html             # HTML模板
│   ├── package.json           # Node依赖
│   ├── tsconfig.json          # TS配置
│   ├── tsconfig.node.json     # TS Node配置
│   └── vite.config.ts         # Vite配置
│
├── docs/                      # 文档
│   ├── README.md             # 项目说明
│   ├── CONTRIBUTING.md       # 贡献指南
│   ├── DEPLOYMENT.md         # 部署指南
│   ├── EXAMPLES.md           # 使用示例
│   └── PROJECT_OVERVIEW.md   # 项目总览
│
├── .gitignore                # Git忽略文件
├── LICENSE                   # 许可证
├── start.sh                  # 启动脚本
├── check_setup.py            # 项目检查脚本
├── docker-compose.yml        # Docker编排
├── Dockerfile.backend        # 后端Docker配置
├── Dockerfile.frontend       # 前端Docker配置
└── nginx.conf                # Nginx配置

```

## 🔄 工作流程

1. **用户输入**: 用户在前端界面粘贴视频链接
2. **平台识别**: 系统自动识别视频所属平台
3. **视频解析**: 调用对应平台的解析器提取视频信息
4. **信息展示**: 在界面上展示视频的基本信息
5. **深度分析**: 用户点击分析按钮，系统进行多维度分析
6. **结果呈现**: 以可视化方式展示分析结果和优化建议

## 🌟 核心特性

### 平台检测
- 自动识别多种链接格式（包括短链接）
- 支持重定向跟踪
- 灵活的URL模式匹配

### 数据提取
- 智能HTML/JSON解析
- 支持动态渲染页面（部分平台）
- 容错处理机制

### 内容分析
- **基础分析**: 平台、时长、发布时间
- **互动分析**: 互动率、人气指数、各项比率
- **内容分析**: 标题特征、内容类型识别
- **智能建议**: 基于数据的优化建议

### 用户体验
- 响应式设计，支持移动端
- 清晰的视觉层次
- 实时加载状态反馈
- 友好的错误提示

## 🔌 API端点

### GET /api/health
健康检查接口
```json
Response: {
  "status": "ok",
  "message": "服务运行正常"
}
```

### GET /api/platforms
获取支持的平台列表
```json
Response: {
  "success": true,
  "data": [...]
}
```

### POST /api/parse
解析视频链接
```json
Request: {
  "url": "视频链接"
}
Response: {
  "success": true,
  "data": { VideoInfo }
}
```

### POST /api/analyze
分析视频内容
```json
Request: {
  "video_info": { VideoInfo },
  "analysis_type": "comprehensive"
}
Response: {
  "success": true,
  "data": { AnalysisResult }
}
```

## 🚀 快速开始

### 本地开发
```bash
# 克隆项目
git clone <repository-url>
cd social-video-parser

# 使用启动脚本
./start.sh
```

### Docker部署
```bash
# 使用Docker Compose
docker-compose up -d
```

访问 http://localhost:5173 即可使用

## 📊 数据分析维度

### 互动数据
- 点赞数、评论数、分享数、播放量
- 互动率计算
- 评论/点赞比、分享/点赞比
- 人气指数评级

### 内容特征
- 标题长度和特征（表情、数字、疑问句等）
- 描述完整性
- 标签数量和相关性
- 内容类型识别（教程、评测、日常等）

### 优化建议
- 标题优化建议
- 描述完善建议
- 标签使用建议
- 互动提升建议

## 🔧 扩展性

### 添加新平台
1. 创建新的解析器类继承 `BaseParser`
2. 实现 `parse()` 方法
3. 在 `platform_detector.py` 中添加识别规则
4. 在 `app.py` 中注册解析器

### 添加新分析维度
1. 在 `VideoAnalyzer` 类中添加分析方法
2. 更新 `AnalysisResult` 类型定义
3. 在前端添加对应的展示组件

## ⚠️ 注意事项

1. **使用限制**: 仅供学习和个人使用
2. **服务条款**: 遵守各平台的使用规则
3. **请求频率**: 避免频繁请求
4. **数据时效性**: 平台API可能变更
5. **隐私保护**: 不存储用户数据

## 📝 许可证

MIT License - 详见 LICENSE 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

详见 CONTRIBUTING.md

## 📮 联系方式

如有问题或建议，请提交 Issue。

---

**项目状态**: ✅ 活跃开发中

**最后更新**: 2024年

**版本**: 1.0.0
