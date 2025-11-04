# 🎬 社交媒体视频链接解析分析工具

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

一款强大的在线工具，用于解析和分析来自主流中文社交媒体平台的视频内容。支持小红书、抖音、B站、快手等平台，提供详细的视频信息提取和多维度内容分析。

## ✨ 功能特性

- 🔗 **多平台支持** - 支持小红书、抖音、B站、快手等主流平台
- 📹 **视频信息提取** - 自动提取标题、作者、封面、描述、互动数据
- 📊 **智能内容分析** - 多维度分析视频数据（互动率、内容类型、标题特征）
- 💡 **优化建议** - 基于数据分析提供个性化优化建议
- 🎨 **现代化界面** - 响应式设计，支持移动端和桌面端
- 🚀 **快速部署** - 支持Docker一键部署

## 📸 功能演示

### 视频解析
- 输入视频链接
- 自动识别平台
- 提取完整视频信息
- 展示互动数据和标签

### 深度分析
- **综合概览**: 平台、时长、发布时间、人气指数
- **互动数据**: 点赞、评论、分享、播放量、互动率
- **内容分析**: 标题特征、内容类型、标签分析
- **优化建议**: 智能生成内容优化建议

## 🛠️ 技术栈

### 后端
- **Python 3.9+** - 编程语言
- **Flask 3.0** - Web框架
- **Flask-CORS** - 跨域支持
- **Requests** - HTTP请求
- **BeautifulSoup4** - HTML解析
- **yt-dlp** - 视频处理

### 前端
- **React 18.2** - UI框架
- **TypeScript 5.2** - 类型系统
- **Vite 5.0** - 构建工具
- **Axios** - HTTP客户端

### 部署
- **Docker** - 容器化
- **Docker Compose** - 服务编排
- **Nginx** - 反向代理

## 🚀 快速开始

### 方法一：一键启动（推荐）

```bash
# 克隆项目
git clone <repository-url>
cd social-video-parser

# 运行启动脚本
./start.sh
```

访问 http://localhost:5173 开始使用

### 方法二：Docker部署

```bash
# 使用Docker Compose启动
docker-compose up -d

# 查看日志
docker-compose logs -f
```

访问 http://localhost

### 方法三：分别启动

#### 后端启动

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

后端运行在 http://localhost:5000

#### 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端运行在 http://localhost:5173

## 📖 详细文档

- **[快速开始指南](QUICKSTART.md)** - 5分钟快速上手
- **[使用示例](EXAMPLES.md)** - API使用示例和链接格式
- **[部署指南](DEPLOYMENT.md)** - 生产环境部署详解
- **[项目总览](PROJECT_OVERVIEW.md)** - 完整的项目架构说明
- **[贡献指南](CONTRIBUTING.md)** - 如何参与项目开发
- **[项目总结](SUMMARY.md)** - 项目完成情况总结

## 💻 使用说明

### 基本流程

1. **输入链接** - 在输入框中粘贴视频链接
2. **解析视频** - 点击"🔍 解析"按钮提取视频信息
3. **查看信息** - 浏览视频标题、作者、封面、互动数据
4. **深度分析** - 点击"🔬 拆解分析"按钮查看详细分析
5. **获取建议** - 查看系统生成的优化建议

### 支持的链接格式

#### 📱 小红书
```
https://www.xiaohongshu.com/discovery/item/[ID]
https://xhslink.com/[短链接]
```

#### 🎵 抖音
```
https://www.douyin.com/video/[ID]
https://v.douyin.com/[短链接]
```

#### 📺 哔哩哔哩
```
https://www.bilibili.com/video/BV[ID]
https://b23.tv/[短链接]
```

#### ⚡ 快手
```
https://www.kuaishou.com/short-video/[ID]
https://ksurl.cn/[短链接]
```

## 📁 项目结构

```
social-video-parser/
├── backend/                    # Python后端服务
│   ├── app.py                 # Flask主应用
│   ├── parsers/               # 各平台解析器
│   │   ├── xiaohongshu_parser.py
│   │   ├── douyin_parser.py
│   │   ├── bilibili_parser.py
│   │   └── kuaishou_parser.py
│   ├── analyzer/              # 视频分析模块
│   │   └── video_analyzer.py
│   └── requirements.txt       # Python依赖
├── frontend/                  # React前端应用
│   ├── src/
│   │   ├── components/        # React组件
│   │   ├── services/          # API服务
│   │   └── types/             # TypeScript类型
│   └── package.json           # Node依赖
├── docs/                      # 文档目录
├── docker-compose.yml         # Docker编排
└── start.sh                   # 启动脚本
```

## 🔌 API端点

- `GET /api/health` - 健康检查
- `GET /api/platforms` - 获取支持的平台列表
- `POST /api/parse` - 解析视频链接
- `POST /api/analyze` - 分析视频内容

详细API文档请查看 [EXAMPLES.md](EXAMPLES.md)

## 🧪 测试

### 检查项目完整性
```bash
python3 check_setup.py
```

### 测试平台检测
```bash
cd backend
python test_parsers.py
```

### 测试API（需先启动后端）
```bash
cd backend
python test_api.py
```

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

详见 [CONTRIBUTING.md](CONTRIBUTING.md)

## 📊 项目统计

- **Python文件**: 13个
- **TypeScript文件**: 8个
- **文档**: 7个
- **支持平台**: 4个
- **API端点**: 4个

## ⚠️ 注意事项

1. **使用限制** - 本工具仅供学习和个人使用
2. **服务条款** - 请遵守各平台的服务条款和使用规则
3. **请求频率** - 避免频繁请求，以免被平台封禁
4. **数据时效** - 平台API可能随时变更，需要维护更新
5. **隐私保护** - 工具不会存储任何用户数据

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

## 📮 联系方式

如有问题或建议，请：
- 提交 [Issue](https://github.com/your-repo/issues)
- 查看 [项目文档](QUICKSTART.md)

---

**Made with ❤️ for learning and education purposes**
