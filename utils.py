import re
from typing import Optional
from urllib.parse import urlparse, parse_qs


class UrlUtils:
    @staticmethod
    def extract_video_id(url: str, platform: str) -> Optional[str]:
        if platform == "xiaohongshu":
            match = re.search(r'/explore/([a-zA-Z0-9]+)', url)
            return match.group(1) if match else None
        
        elif platform == "douyin":
            match = re.search(r'/video/(\d+)', url)
            return match.group(1) if match else None
        
        elif platform == "bilibili":
            bv_match = re.search(r'(BV[\w]+)', url)
            if bv_match:
                return bv_match.group(1)
            av_match = re.search(r'av(\d+)', url)
            if av_match:
                return f"av{av_match.group(1)}"
            return None
        
        elif platform == "kuaishou":
            match = re.search(r'/short-video/([a-zA-Z0-9]+)', url)
            if match:
                return match.group(1)
            match = re.search(r'photoId=([a-zA-Z0-9]+)', url)
            return match.group(1) if match else None
        
        return None
    
    @staticmethod
    def is_short_url(url: str) -> bool:
        short_domains = ['xhslink.com', 'v.douyin.com', 'b23.tv', 'ksurl.cn', 'v.kuaishou.com']
        parsed = urlparse(url)
        return any(domain in parsed.netloc for domain in short_domains)
    
    @staticmethod
    def clean_url(url: str) -> str:
        url = url.strip()
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        return url


class VideoInfoFormatter:
    @staticmethod
    def format_duration(milliseconds: int) -> str:
        seconds = milliseconds // 1000
        minutes = seconds // 60
        hours = minutes // 60
        
        if hours > 0:
            return f"{hours:02d}:{minutes % 60:02d}:{seconds % 60:02d}"
        else:
            return f"{minutes:02d}:{seconds % 60:02d}"
    
    @staticmethod
    def format_count(count: int) -> str:
        if count >= 10000:
            return f"{count / 10000:.1f}万"
        elif count >= 1000:
            return f"{count / 1000:.1f}千"
        else:
            return str(count)
    
    @staticmethod
    def format_file_size(bytes: int) -> str:
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes < 1024.0:
                return f"{bytes:.2f} {unit}"
            bytes /= 1024.0
        return f"{bytes:.2f} TB"
