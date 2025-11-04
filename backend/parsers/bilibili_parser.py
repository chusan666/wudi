from .base_parser import BaseParser
import re
import json
from bs4 import BeautifulSoup

class BilibiliParser(BaseParser):
    def parse(self, url):
        try:
            if 'b23.tv' in url:
                response = self.session.get(url, allow_redirects=True, timeout=10)
                url = response.url
            
            video_id = self.extract_video_id(url)
            if not video_id:
                return None
            
            api_url = f"https://api.bilibili.com/x/web-interface/view?bvid={video_id}"
            
            response = self.session.get(api_url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('code') != 0:
                return None
            
            video_data = data.get('data', {})
            
            video_info = {
                'title': self.clean_text(video_data.get('title', '')),
                'author': video_data.get('owner', {}).get('name', ''),
                'description': self.clean_text(video_data.get('desc', '')),
                'cover': video_data.get('pic', ''),
                'video_url': url,
                'likes': video_data.get('stat', {}).get('like', 0),
                'comments': video_data.get('stat', {}).get('reply', 0),
                'shares': video_data.get('stat', {}).get('share', 0),
                'views': video_data.get('stat', {}).get('view', 0),
                'coins': video_data.get('stat', {}).get('coin', 0),
                'favorites': video_data.get('stat', {}).get('favorite', 0),
                'tags': [],
                'duration': video_data.get('duration', 0),
                'pubdate': video_data.get('pubdate', 0)
            }
            
            tag_url = f"https://api.bilibili.com/x/tag/archive/tags?bvid={video_id}"
            try:
                tag_response = self.session.get(tag_url, timeout=5)
                tag_data = tag_response.json()
                if tag_data.get('code') == 0:
                    video_info['tags'] = [tag.get('tag_name', '') for tag in tag_data.get('data', [])]
            except:
                pass
            
            return video_info
            
        except Exception as e:
            print(f"B站解析错误: {str(e)}")
            return None
    
    def extract_video_id(self, url):
        patterns = [
            r'bilibili\.com/video/([Bb][Vv][A-Za-z0-9]+)',
            r'/([Bb][Vv][A-Za-z0-9]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None
