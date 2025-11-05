from typing import Optional, Dict, Any
import re
import json
from bs4 import BeautifulSoup
from .base import BaseParser


class DouyinParser(BaseParser):
    async def parse(self, url: str) -> Optional[Dict[str, Any]]:
        video_id = None
        
        if "v.douyin.com" in url or "iesdouyin.com" in url or "/share/" in url:
            redirect_url = await self.get_redirect_url(url)
            
            video_id_match = re.search(r'video/(\d+)', redirect_url)
            modal_id_match = re.search(r'modal_id=(\d+)', redirect_url)
            
            if video_id_match:
                video_id = video_id_match.group(1)
            elif modal_id_match:
                video_id = modal_id_match.group(1)
            
            if video_id:
                url = f"https://www.douyin.com/jingxuan?modal_id={video_id}"
            else:
                url = redirect_url
        
        headers = self.headers.copy()
        headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.douyin.com/',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Cache-Control': 'max-age=0',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
        })
        
        import httpx
        cookies = {
            '__ac_nonce': '0',
            '__ac_signature': '_',
        }
        
        async with httpx.AsyncClient(follow_redirects=True, timeout=10.0, cookies=cookies) as client:
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
                    if 'app' in data and isinstance(data['app'], dict):
                        if 'videoDetail' in data['app']:
                            aweme_detail = data['app']['videoDetail']
                        elif 'aweme' in data['app']:
                            aweme_detail = data['app']['aweme'].get('detail')
                    
                    for key, value in data.items():
                        if aweme_detail:
                            break
                        if isinstance(value, dict) and 'aweme' in value:
                            aweme_detail = value['aweme'].get('detail')
                            break
                        elif isinstance(value, dict) and 'awemeDetail' in value:
                            aweme_detail = value['awemeDetail']
                            break
                        elif isinstance(value, dict) and 'videoDetail' in value:
                            aweme_detail = value['videoDetail']
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
                        if isinstance(play_addr, list) and len(play_addr) > 0:
                            if isinstance(play_addr[0], dict) and 'src' in play_addr[0]:
                                result['video_url'] = play_addr[0]['src']
                            elif isinstance(play_addr[0], str):
                                result['video_url'] = play_addr[0]
                        elif isinstance(play_addr, dict):
                            url_list = play_addr.get('urlList', [])
                            if url_list:
                                result['video_url'] = url_list[0]
                    
                    bit_rate_list = video_info.get('bitRateList', [])
                    if bit_rate_list:
                        result['video']['bitrate_urls'] = []
                        for item in bit_rate_list:
                            if isinstance(item, dict):
                                play_addr_item = item.get('playAddr')
                                url = None
                                if isinstance(play_addr_item, list) and len(play_addr_item) > 0:
                                    url = play_addr_item[0].get('src') if isinstance(play_addr_item[0], dict) else play_addr_item[0]
                                elif isinstance(play_addr_item, dict):
                                    url_list = play_addr_item.get('urlList', [])
                                    url = url_list[0] if url_list else None
                                
                                result['video']['bitrate_urls'].append({
                                    'bit_rate': item.get('bitRate'),
                                    'gear_name': item.get('gearName'),
                                    'url': url
                                })
                    
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
