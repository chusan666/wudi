from parsers.platform_detector import detect_platform

def test_platform_detection():
    test_cases = [
        ('https://www.xiaohongshu.com/discovery/item/xxx', 'xiaohongshu'),
        ('https://www.douyin.com/video/xxx', 'douyin'),
        ('https://v.douyin.com/xxx', 'douyin'),
        ('https://www.bilibili.com/video/BVxxx', 'bilibili'),
        ('https://b23.tv/xxx', 'bilibili'),
        ('https://www.kuaishou.com/short-video/xxx', 'kuaishou'),
        ('https://invalid-url.com', None),
    ]
    
    print("🧪 测试平台检测功能...\n")
    
    for url, expected in test_cases:
        result = detect_platform(url)
        status = "✅" if result == expected else "❌"
        print(f"{status} URL: {url[:50]}...")
        print(f"   期望: {expected}, 结果: {result}\n")

if __name__ == '__main__':
    test_platform_detection()
