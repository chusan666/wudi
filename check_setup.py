#!/usr/bin/env python3
import os
import sys

def check_file(path, description):
    if os.path.exists(path):
        print(f"✅ {description}: {path}")
        return True
    else:
        print(f"❌ 缺失 {description}: {path}")
        return False

def check_directory(path, description):
    if os.path.isdir(path):
        print(f"✅ {description}: {path}")
        return True
    else:
        print(f"❌ 缺失 {description}: {path}")
        return False

def main():
    print("🔍 检查项目结构...\n")
    
    all_checks = []
    
    print("📁 检查根目录文件:")
    all_checks.append(check_file("README.md", "README文档"))
    all_checks.append(check_file(".gitignore", "Git忽略文件"))
    all_checks.append(check_file("LICENSE", "许可证文件"))
    all_checks.append(check_file("start.sh", "启动脚本"))
    all_checks.append(check_file("docker-compose.yml", "Docker配置"))
    print()
    
    print("🐍 检查后端文件:")
    all_checks.append(check_directory("backend", "后端目录"))
    all_checks.append(check_file("backend/app.py", "Flask应用"))
    all_checks.append(check_file("backend/requirements.txt", "Python依赖"))
    all_checks.append(check_directory("backend/parsers", "解析器目录"))
    all_checks.append(check_file("backend/parsers/platform_detector.py", "平台检测器"))
    all_checks.append(check_file("backend/parsers/xiaohongshu_parser.py", "小红书解析器"))
    all_checks.append(check_file("backend/parsers/douyin_parser.py", "抖音解析器"))
    all_checks.append(check_file("backend/parsers/bilibili_parser.py", "B站解析器"))
    all_checks.append(check_file("backend/parsers/kuaishou_parser.py", "快手解析器"))
    all_checks.append(check_directory("backend/analyzer", "分析器目录"))
    all_checks.append(check_file("backend/analyzer/video_analyzer.py", "视频分析器"))
    print()
    
    print("⚛️  检查前端文件:")
    all_checks.append(check_directory("frontend", "前端目录"))
    all_checks.append(check_file("frontend/package.json", "Node依赖配置"))
    all_checks.append(check_file("frontend/vite.config.ts", "Vite配置"))
    all_checks.append(check_file("frontend/tsconfig.json", "TypeScript配置"))
    all_checks.append(check_file("frontend/index.html", "HTML入口"))
    all_checks.append(check_directory("frontend/src", "源代码目录"))
    all_checks.append(check_file("frontend/src/main.tsx", "主入口文件"))
    all_checks.append(check_file("frontend/src/App.tsx", "主应用组件"))
    all_checks.append(check_directory("frontend/src/components", "组件目录"))
    all_checks.append(check_file("frontend/src/components/VideoInfoCard.tsx", "视频信息卡片"))
    all_checks.append(check_file("frontend/src/components/AnalysisCard.tsx", "分析卡片"))
    all_checks.append(check_directory("frontend/src/services", "服务目录"))
    all_checks.append(check_file("frontend/src/services/api.ts", "API服务"))
    all_checks.append(check_directory("frontend/src/types", "类型目录"))
    all_checks.append(check_file("frontend/src/types/index.ts", "类型定义"))
    print()
    
    total = len(all_checks)
    passed = sum(all_checks)
    
    print("=" * 50)
    print(f"\n📊 检查结果: {passed}/{total} 通过")
    
    if passed == total:
        print("🎉 项目结构完整！可以开始使用。\n")
        print("🚀 快速启动:")
        print("   ./start.sh")
        print("\n或分别启动:")
        print("   后端: cd backend && python app.py")
        print("   前端: cd frontend && npm install && npm run dev")
        return 0
    else:
        print("⚠️  项目结构不完整，请检查缺失的文件。\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
