# 贡献指南

感谢您对本项目的兴趣！

## 开发环境设置

### 后端
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 前端
```bash
cd frontend
npm install
npm run dev
```

## 项目结构

```
.
├── backend/              # Python后端
│   ├── app.py           # Flask应用
│   ├── parsers/         # 平台解析器
│   │   ├── xiaohongshu_parser.py
│   │   ├── douyin_parser.py
│   │   ├── bilibili_parser.py
│   │   └── kuaishou_parser.py
│   └── analyzer/        # 视频分析器
│       └── video_analyzer.py
├── frontend/            # React前端
│   ├── src/
│   │   ├── components/  # React组件
│   │   ├── services/    # API服务
│   │   └── types/       # TypeScript类型
│   └── public/
└── README.md
```

## 添加新平台支持

1. 在 `backend/parsers/` 中创建新的解析器类
2. 继承 `BaseParser` 类
3. 实现 `parse()` 方法
4. 在 `platform_detector.py` 中添加平台检测规则
5. 在 `app.py` 中注册新的解析器

## 代码规范

- Python: 遵循 PEP 8
- TypeScript/React: 使用 ESLint 配置
- 提交前请运行测试和代码检查

## 提交规范

- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- test: 测试相关
- chore: 构建/工具相关

## 许可证

本项目仅供学习使用，请勿用于商业目的。
