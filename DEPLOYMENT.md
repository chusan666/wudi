# 部署指南

## 本地开发部署

### 方法一：使用启动脚本（推荐）

```bash
# 克隆项目
git clone <repository-url>
cd social-video-parser

# 使用一键启动脚本
./start.sh
```

启动后访问：
- 前端：http://localhost:5173
- 后端：http://localhost:5000

### 方法二：手动启动

#### 启动后端

```bash
cd backend

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
# Linux/Mac:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 启动服务
python app.py
```

#### 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## Docker 部署

### 使用 Docker Compose（推荐）

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

服务访问：
- 前端：http://localhost
- 后端：http://localhost:5000

### 单独构建

#### 后端容器

```bash
docker build -f Dockerfile.backend -t video-parser-backend .
docker run -p 5000:5000 video-parser-backend
```

#### 前端容器

```bash
docker build -f Dockerfile.frontend -t video-parser-frontend .
docker run -p 80:80 video-parser-frontend
```

## 生产环境部署

### 环境变量配置

#### 后端 (.env)

```bash
FLASK_ENV=production
FLASK_APP=app.py
PORT=5000
SECRET_KEY=your-secret-key-here
```

#### 前端 (.env)

```bash
VITE_API_URL=https://your-api-domain.com
```

### Nginx 反向代理配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 使用 Systemd 管理后端服务

创建 `/etc/systemd/system/video-parser.service`:

```ini
[Unit]
Description=Video Parser Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/backend
Environment="PATH=/path/to/backend/venv/bin"
ExecStart=/path/to/backend/venv/bin/python app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl start video-parser
sudo systemctl enable video-parser
sudo systemctl status video-parser
```

## 性能优化建议

### 后端优化

1. 使用 Gunicorn 作为 WSGI 服务器：
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

2. 添加 Redis 缓存：
   ```python
   # 缓存视频解析结果，减少重复请求
   ```

3. 使用连接池管理请求

### 前端优化

1. 构建生产版本：
   ```bash
   npm run build
   ```

2. 启用 CDN 加速静态资源

3. 配置 Nginx gzip 压缩

## 监控和日志

### 后端日志

```python
# app.py 中配置日志
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

### 前端错误监控

考虑集成：
- Sentry - 错误追踪
- Google Analytics - 用户行为分析

## 安全建议

1. 启用 HTTPS（使用 Let's Encrypt）
2. 配置 CORS 白名单
3. 添加请求频率限制
4. 实施 API 密钥认证（可选）
5. 定期更新依赖包

## 备份策略

1. 定期备份数据库（如有）
2. 备份配置文件
3. 使用 Git 版本控制

## 故障排查

### 后端无法启动

```bash
# 检查端口占用
lsof -i :5000

# 查看详细错误
python app.py

# 检查依赖
pip list
```

### 前端无法访问后端

1. 检查 CORS 配置
2. 验证 API URL 配置
3. 查看浏览器控制台错误
4. 检查网络请求

### Docker 容器问题

```bash
# 查看容器日志
docker logs <container-id>

# 进入容器调试
docker exec -it <container-id> /bin/sh

# 重建容器
docker-compose down
docker-compose up --build -d
```

## 扩展建议

1. 添加数据库存储解析历史
2. 实现用户系统和认证
3. 支持批量解析
4. 添加视频下载功能
5. 集成更多分析维度
6. 支持更多视频平台
