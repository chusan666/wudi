from typing import Optional, Dict, Any
import re
import json
from bs4 import BeautifulSoup
from .base import BaseParser


class KuaishouParser(BaseParser):
    async def parse(self, url: str) -> Optional[Dict[str, Any]]:
        if "ksurl.cn" in url or "v.kuaishou.com" in url:
            url = await self.get_redirect_url(url)
        
        html = await self.fetch_page(url)
        soup = BeautifulSoup(html, 'html.parser')
        
        script_pattern = r'window\.pageData\s*=\s*({.*?});</script>'
        json_str = self.extract_json_from_html(html, script_pattern)
        
        if json_str:
            try:
                data = json.loads(json_str)
                video_info = data.get('video', {})
                
                if video_info:
                    result = {
                        'photo_id': video_info.get('photoId'),
                        'caption': video_info.get('caption', ''),
                        'photo_type': video_info.get('photoType'),
                        'author': {
                            'user_id': video_info.get('userId'),
                            'user_name': video_info.get('userName', ''),
                            'user_sex': video_info.get('userSex', ''),
                        },
                        'timestamp': video_info.get('timestamp'),
                        'statistics': {
                            'view_count': video_info.get('viewCount', 0),
                            'like_count': video_info.get('likeCount', 0),
                            'comment_count': video_info.get('commentCount', 0),
                        },
                        'video': {
                            'duration': video_info.get('duration'),
                            'width': video_info.get('width'),
                            'height': video_info.get('height'),
                        },
                        'cover': video_info.get('coverUrl', ''),
                        'video_url': None,
                    }
                    
                    main_mv_urls = video_info.get('mainMvUrls', [])
                    if main_mv_urls:
                        result['video_url'] = main_mv_urls[0].get('url')
                    
                    photo_url = video_info.get('photoUrl')
                    if photo_url and not result['video_url']:
                        result['video_url'] = photo_url
                    
                    return result
            except json.JSONDecodeError:
                pass
        
        ssr_data_pattern = r'window\.SSR_DATA\s*=\s*({.*?});</script>'
        json_str = self.extract_json_from_html(html, ssr_data_pattern)
        
        if json_str:
            try:
                data = json.loads(json_str)
                
                if 'videoResource' in data:
                    video_res = data['videoResource']
                    return {
                        'video_url': video_res.get('url'),
                        'caption': data.get('caption', ''),
                        'cover': data.get('coverUrl', ''),
                    }
            except json.JSONDecodeError:
                pass
        
        video_pattern = r'"srcNoMark"\s*:\s*"([^"]+)"'
        match = re.search(video_pattern, html)
        if match:
            return {
                'video_url': match.group(1),
                'caption': self._extract_title(soup),
            }
        
        return None
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        title_tag = soup.find('meta', {'name': 'description'})
        if title_tag and title_tag.get('content'):
            return title_tag.get('content')
        
        title_tag = soup.find('title')
        if title_tag:
            return title_tag.text.strip()
        
        return ''
