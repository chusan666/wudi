from typing import Optional, Dict, Any
import re
import json
from bs4 import BeautifulSoup
from .base import BaseParser


class XiaohongshuParser(BaseParser):
    async def parse(self, url: str) -> Optional[Dict[str, Any]]:
        if "xhslink.com" in url:
            url = await self.get_redirect_url(url)
        
        html = await self.fetch_page(url)
        
        soup = BeautifulSoup(html, 'html.parser')
        
        data_pattern = r'window\.__INITIAL_STATE__\s*=\s*({.*?})</script>'
        json_str = self.extract_json_from_html(html, data_pattern)
        
        if json_str:
            try:
                data = json.loads(json_str)
                note_data = data.get('note', {}).get('noteDetailMap', {})
                
                if note_data:
                    note_id = list(note_data.keys())[0] if note_data else None
                    note = note_data.get(note_id, {}).get('note', {}) if note_id else {}
                    
                    video_info = note.get('video', {})
                    
                    result = {
                        'note_id': note.get('noteId'),
                        'title': note.get('title', ''),
                        'desc': note.get('desc', ''),
                        'type': note.get('type', ''),
                        'user': {
                            'nickname': note.get('user', {}).get('nickname', ''),
                            'user_id': note.get('user', {}).get('userId', ''),
                        },
                        'video': {
                            'duration': video_info.get('duration'),
                            'width': video_info.get('width'),
                            'height': video_info.get('height'),
                        },
                        'images': [],
                        'video_url': None,
                    }
                    
                    if video_info:
                        video_consumer = video_info.get('consumer', {})
                        video_url = video_consumer.get('originVideoKey') or video_consumer.get('videoKey')
                        if video_url:
                            result['video_url'] = video_url
                    
                    image_list = note.get('imageList', [])
                    if image_list:
                        result['images'] = [
                            {
                                'url': img.get('urlDefault', ''),
                                'width': img.get('width'),
                                'height': img.get('height'),
                            }
                            for img in image_list
                        ]
                    
                    return result
            except json.JSONDecodeError as e:
                pass
        
        video_pattern = r'"originVideoKey"\s*:\s*"([^"]+)"'
        match = re.search(video_pattern, html)
        if match:
            return {
                'video_url': match.group(1),
                'title': self._extract_title(soup),
            }
        
        return None
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        title_tag = soup.find('meta', {'property': 'og:title'})
        if title_tag and title_tag.get('content'):
            return title_tag.get('content')
        
        title_tag = soup.find('title')
        if title_tag:
            return title_tag.text.strip()
        
        return ''
