from typing import Optional, Dict, Any
import re
import json
from bs4 import BeautifulSoup
from .base import BaseParser


class DouyinParser(BaseParser):
    async def parse(self, url: str) -> Optional[Dict[str, Any]]:
        if "v.douyin.com" in url or "iesdouyin.com" in url:
            url = await self.get_redirect_url(url)
        
        headers = self.headers.copy()
        headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
        
        import httpx
        async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
            response = await client.get(url, headers=headers)
            html = response.text
        
        soup = BeautifulSoup(html, 'html.parser')
        
        render_data_pattern = r'<script id="RENDER_DATA" type="application/json">([^<]+)</script>'
        match = re.search(render_data_pattern, html)
        
        if match:
            try:
                import urllib.parse
                encoded_data = match.group(1)
                decoded_data = urllib.parse.unquote(encoded_data)
                data = json.loads(decoded_data)
                
                aweme_detail = None
                if isinstance(data, dict):
                    for key, value in data.items():
                        if isinstance(value, dict) and 'aweme' in value:
                            aweme_detail = value['aweme'].get('detail')
                            break
                        elif isinstance(value, dict) and 'awemeDetail' in value:
                            aweme_detail = value['awemeDetail']
                            break
                
                if aweme_detail:
                    video_info = aweme_detail.get('video', {})
                    author_info = aweme_detail.get('author', {})
                    
                    result = {
                        'aweme_id': aweme_detail.get('awemeId'),
                        'title': aweme_detail.get('desc', ''),
                        'author': {
                            'nickname': author_info.get('nickname', ''),
                            'uid': author_info.get('uid', ''),
                            'avatar': author_info.get('avatarThumb', ''),
                        },
                        'statistics': {
                            'digg_count': aweme_detail.get('stats', {}).get('diggCount', 0),
                            'comment_count': aweme_detail.get('stats', {}).get('commentCount', 0),
                            'share_count': aweme_detail.get('stats', {}).get('shareCount', 0),
                        },
                        'video': {
                            'duration': video_info.get('duration'),
                            'width': video_info.get('width'),
                            'height': video_info.get('height'),
                            'ratio': video_info.get('ratio'),
                            'cover': video_info.get('cover', ''),
                            'dynamic_cover': video_info.get('dynamicCover', ''),
                        },
                        'video_url': None,
                        'music': {
                            'title': aweme_detail.get('music', {}).get('title', ''),
                            'author': aweme_detail.get('music', {}).get('authorName', ''),
                            'url': aweme_detail.get('music', {}).get('playUrl', ''),
                        }
                    }
                    
                    play_addr = video_info.get('playAddr')
                    if play_addr:
                        url_list = play_addr.get('urlList', [])
                        if url_list:
                            result['video_url'] = url_list[0]
                    
                    bit_rate_list = video_info.get('bitRateList', [])
                    if bit_rate_list:
                        result['video']['bitrate_urls'] = [
                            {
                                'bit_rate': item.get('bitRate'),
                                'gear_name': item.get('gearName'),
                                'url': item.get('playAddr', {}).get('urlList', [None])[0]
                            }
                            for item in bit_rate_list
                        ]
                    
                    return result
            except Exception as e:
                pass
        
        video_pattern = r'"playAddr":\s*\[{[^}]*"src"\s*:\s*"([^"]+)"'
        match = re.search(video_pattern, html)
        if match:
            return {
                'video_url': match.group(1),
                'title': self._extract_title(soup),
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
