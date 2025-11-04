import asyncio
import httpx


async def test_parse_api():
    base_url = "http://localhost:8000"
    
    test_urls = [
        "https://www.xiaohongshu.com/explore/xxxxx",
        "https://www.douyin.com/video/7xxxxx",
        "https://www.bilibili.com/video/BVxxxxxxx",
        "https://www.kuaishou.com/short-video/xxxxx",
    ]
    
    async with httpx.AsyncClient() as client:
        print("=" * 50)
        print("测试视频链接解析API")
        print("=" * 50)
        
        for url in test_urls:
            print(f"\n正在解析: {url}")
            try:
                response = await client.post(
                    f"{base_url}/parse",
                    json={"url": url},
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"平台: {data['platform']}")
                    print(f"成功: {data['success']}")
                    
                    if data['success'] and data.get('data'):
                        print(f"数据: {list(data['data'].keys())}")
                        if 'video_url' in data['data']:
                            print(f"视频地址: {data['data']['video_url'][:50]}...")
                else:
                    print(f"错误: HTTP {response.status_code}")
            
            except Exception as e:
                print(f"异常: {str(e)}")
        
        print("\n" + "=" * 50)
        print("获取支持的平台列表")
        print("=" * 50)
        
        response = await client.get(f"{base_url}/platforms")
        if response.status_code == 200:
            data = response.json()
            print("\n支持的平台:")
            for platform in data['platforms']:
                print(f"  - {platform['name']} ({platform['key']})")
                print(f"    域名: {', '.join(platform['domains'])}")


if __name__ == "__main__":
    print("开始测试...")
    print("请确保API服务正在运行: python main.py\n")
    
    try:
        asyncio.run(test_parse_api())
    except KeyboardInterrupt:
        print("\n测试已取消")
    except Exception as e:
        print(f"\n测试失败: {str(e)}")
