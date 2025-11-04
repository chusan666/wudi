# 更新日志

## [1.1.0] - 2025-01-05

### 新增功能
- ✅ 支持抖音分享短链接 (`v.douyin.com`)
- ✅ 支持小红书discovery路径 (`/discovery/item/`)
- ✅ 改进URL识别和重定向处理

### 改进
- 🔧 **抖音解析器优化**
  - 智能识别短链接并自动重定向
  - 从重定向URL中提取video_id和modal_id
  - 使用`jingxuan?modal_id=`格式访问以获取完整数据
  - 添加完整的浏览器headers模拟
  - 支持多种URL格式：`/video/{id}`, `?modal_id={id}`, 短链接等

- 🔧 **小红书解析器优化**
  - 自动将video key转换为完整CDN URL
  - 支持`/explore/`和`/discovery/item/`两种路径
  - 同时返回video_key和video_url便于调试

### 技术细节
- 添加Sec-Ch-Ua和Sec-Fetch系列headers
- 实现video_id提取逻辑
- 改进重定向处理流程

### 测试验证
已测试的真实链接：
1. 抖音分享链接: `https://v.douyin.com/afq0ekmPr9g/` ✅
2. 小红书分享链接: `https://www.xiaohongshu.com/discovery/item/...` ✅

## [1.0.0] - 2025-01-04

### 初始版本
- 基础解析功能
- 支持小红书、抖音、B站、快手四大平台
- FastAPI RESTful API
- 基础文档和示例

---

## 待办事项

### 短期
- [ ] 添加更多错误处理和重试机制
- [ ] 实现请求缓存
- [ ] 添加速率限制
- [ ] 优化B站和快手解析器

### 中期
- [ ] 考虑使用Playwright处理完全动态页面
- [ ] 添加代理池支持
- [ ] 实现批量解析接口
- [ ] 添加视频下载功能

### 长期  
- [ ] 支持更多平台（TikTok, Instagram, YouTube等）
- [ ] 构建Web前端界面
- [ ] 添加用户认证系统
- [ ] 实现分布式部署
