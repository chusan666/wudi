# 快速开始指南

## 🚀 5分钟快速启动

### 前置要求
- Python 3.9+
- Node.js 18+
- npm 或 yarn

### 方法一：一键启动（最简单）

```bash
# 1. 进入项目目录
cd social-video-parser

# 2. 运行启动脚本
./start.sh
```

启动后访问：**http://localhost:5173**

### 方法二：Docker启动（推荐生产环境）

```bash
# 1. 确保安装了 Docker 和 Docker Compose

# 2. 启动服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 停止服务
docker-compose down
```

启动后访问：**http://localhost**

### 方法三：分别启动（开发环境）

#### 启动后端

```bash
# 1. 进入后端目录
cd backend

# 2. 创建虚拟环境
python3 -m venv venv

# 3. 激活虚拟环境
source venv/bin/activate  # Mac/Linux
# venv\Scripts\activate  # Windows

# 4. 安装依赖
pip install -r requirements.txt

# 5. 启动服务
python app.py
```

后端运行在：**http://localhost:5000**

#### 启动前端（新终端）

```bash
# 1. 进入前端目录
cd frontend

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

前端运行在：**http://localhost:5173**

## 📖 基本使用

### 1. 打开应用
浏览器访问 http://localhost:5173

### 2. 输入视频链接
支持的链接格式：

**小红书：**
```
https://www.xiaohongshu.com/discovery/item/[ID]
https://xhslink.com/[短链接]
```

**抖音：**
```
https://www.douyin.com/video/[ID]
https://v.douyin.com/[短链接]
```

**B站：**
```
https://www.bilibili.com/video/BV[ID]
https://b23.tv/[短链接]
```

**快手：**
```
https://www.kuaishou.com/short-video/[ID]
https://ksurl.cn/[短链接]
```

### 3. 解析视频
- 粘贴链接到输入框
- 点击"🔍 解析"按钮
- 等待几秒钟

### 4. 查看信息
解析成功后会显示：
- 视频封面
- 标题和描述
- 作者信息
- 互动数据（点赞、评论、分享、播放量）
- 标签列表

### 5. 深度分析
- 点击"🔬 拆解分析"按钮
- 查看4个维度的分析结果：
  - 📊 综合概览
  - 📈 互动数据
  - 📝 内容分析
  - 💡 优化建议

## 🔧 验证安装

### 检查项目完整性
```bash
python3 check_setup.py
```

### 测试平台检测
```bash
cd backend
python test_parsers.py
```

### 测试API（需要先启动后端）
```bash
cd backend
python test_api.py
```

## ❓ 常见问题

### Q1: 启动脚本无法执行？
```bash
chmod +x start.sh
./start.sh
```

### Q2: 后端端口被占用？
```bash
# 查找占用5000端口的进程
lsof -i :5000

# 或修改 backend/app.py 中的端口号
```

### Q3: 前端无法连接后端？
检查 `frontend/vite.config.ts` 中的代理配置：
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true
  }
}
```

### Q4: 解析失败？
- 确认链接格式正确
- 检查网络连接
- 某些平台可能需要登录才能访问
- 平台API可能已更新，需要维护代码

### Q5: Docker启动失败？
```bash
# 查看详细日志
docker-compose logs

# 重新构建
docker-compose down
docker-compose up --build -d
```

## 📊 API测试

### 使用 curl 测试

**健康检查：**
```bash
curl http://localhost:5000/api/health
```

**获取平台列表：**
```bash
curl http://localhost:5000/api/platforms
```

**解析视频：**
```bash
curl -X POST http://localhost:5000/api/parse \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.bilibili.com/video/BVxxx"}'
```

## 🎯 下一步

- 查看 [README.md](README.md) 了解项目详情
- 阅读 [EXAMPLES.md](EXAMPLES.md) 查看更多示例
- 参考 [DEPLOYMENT.md](DEPLOYMENT.md) 部署到生产环境
- 阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 参与贡献

## 💡 提示

1. **使用真实链接**: 测试时使用真实的视频链接
2. **遵守规则**: 不要频繁请求，遵守平台使用条款
3. **定期更新**: 平台API可能变更，需要更新解析器
4. **错误反馈**: 遇到问题请提交 Issue

## 📞 获取帮助

- 查看文档：所有 `.md` 文件
- 运行测试：`python3 check_setup.py`
- 提交问题：GitHub Issues

---

**祝使用愉快！🎉**
