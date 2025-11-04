from typing import Optional, Dict, Any
import re
import json
from bs4 import BeautifulSoup
from .base import BaseParser
import httpx


class BilibiliParser(BaseParser):
    async def parse(self, url: str) -> Optional[Dict[str, Any]]:
        if "b23.tv" in url:
            url = await self.get_redirect_url(url)
        
        bv_match = re.search(r'BV[\w]+', url)
        av_match = re.search(r'av(\d+)', url)
        
        video_id = None
        if bv_match:
            video_id = bv_match.group()
        elif av_match:
            video_id = f"av{av_match.group(1)}"
        
        if not video_id:
            return None
        
        html = await self.fetch_page(url)
        soup = BeautifulSoup(html, 'html.parser')
        
        initial_state_pattern = r'window\.__INITIAL_STATE__\s*=\s*({.*?});'
        json_str = self.extract_json_from_html(html, initial_state_pattern)
        
        if json_str:
            try:
                data = json.loads(json_str)
                video_data = data.get('videoData', {})
                
                if video_data:
                    result = {
                        'bvid': video_data.get('bvid'),
                        'aid': video_data.get('aid'),
                        'title': video_data.get('title', ''),
                        'desc': video_data.get('desc', ''),
                        'pic': video_data.get('pic', ''),
                        'owner': {
                            'mid': video_data.get('owner', {}).get('mid'),
                            'name': video_data.get('owner', {}).get('name', ''),
                            'face': video_data.get('owner', {}).get('face', ''),
                        },
                        'duration': video_data.get('duration'),
                        'pubdate': video_data.get('pubdate'),
                        'statistics': {
                            'view': video_data.get('stat', {}).get('view', 0),
                            'danmaku': video_data.get('stat', {}).get('danmaku', 0),
                            'reply': video_data.get('stat', {}).get('reply', 0),
                            'favorite': video_data.get('stat', {}).get('favorite', 0),
                            'coin': video_data.get('stat', {}).get('coin', 0),
                            'share': video_data.get('stat', {}).get('share', 0),
                            'like': video_data.get('stat', {}).get('like', 0),
                        },
                        'pages': [],
                        'video_url': None,
                    }
                    
                    pages = video_data.get('pages', [])
                    if pages:
                        result['pages'] = [
                            {
                                'cid': page.get('cid'),
                                'page': page.get('page'),
                                'part': page.get('part', ''),
                                'duration': page.get('duration'),
                            }
                            for page in pages
                        ]
                    
                    if pages:
                        cid = pages[0].get('cid')
                        if cid:
                            video_url = await self._get_video_url(video_data.get('bvid'), cid)
                            if video_url:
                                result['video_url'] = video_url
                    
                    return result
            except json.JSONDecodeError:
                pass
        
        title_tag = soup.find('meta', {'property': 'og:title'})
        if title_tag:
            return {
                'title': title_tag.get('content', ''),
                'video_id': video_id,
            }
        
        return None
    
    async def _get_video_url(self, bvid: str, cid: int) -> Optional[str]:
        try:
            api_url = f"https://api.bilibili.com/x/player/playurl?bvid={bvid}&cid={cid}&qn=80&fnval=0"
            
            headers = self.headers.copy()
            headers['Referer'] = f'https://www.bilibili.com/video/{bvid}/'
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(api_url, headers=headers)
                data = response.json()
                
                if data.get('code') == 0:
                    durl = data.get('data', {}).get('durl', [])
                    if durl:
                        return durl[0].get('url')
        except Exception:
            pass
        
        return None
