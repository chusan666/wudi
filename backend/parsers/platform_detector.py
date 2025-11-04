import re

def detect_platform(url):
    url = url.lower().strip()
    
    patterns = {
        'xiaohongshu': [
            r'xiaohongshu\.com',
            r'xhslink\.com',
            r'xhs\.link'
        ],
        'douyin': [
            r'douyin\.com',
            r'iesdouyin\.com',
            r'v\.douyin\.com'
        ],
        'bilibili': [
            r'bilibili\.com',
            r'b23\.tv',
            r'acg\.tv'
        ],
        'kuaishou': [
            r'kuaishou\.com',
            r'ksurl\.cn',
            r'gifshow\.com'
        ]
    }
    
    for platform, pattern_list in patterns.items():
        for pattern in pattern_list:
            if re.search(pattern, url):
                return platform
    
    return None
