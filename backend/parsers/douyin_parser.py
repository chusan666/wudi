from .base_parser import BaseParser
import re
import json
from bs4 import BeautifulSoup

class DouyinParser(BaseParser):
    def parse(self, url):
        try:
            if 'v.douyin.com' in url:
                response = self.session.get(url, allow_redirects=True, timeout=10)
                url = response.url
            
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            video_info = {
                'title': '',
                'author': '',
                'description': '',
                'cover': '',
                'video_url': '',
                'likes': 0,
                'comments': 0,
                'shares': 0,
                'tags': []
            }
            
            script_tags = soup.find_all('script', {'id': 'RENDER_DATA'})
            for script in script_tags:
                if script.string:
                    try:
                        import urllib.parse
                        decoded = urllib.parse.unquote(script.string)
                        data = json.loads(decoded)
                        
                        detail = data
                        for key in ['', '0', 'aweme', 'awemeDetail']:
                            if key and key in detail:
                                detail = detail[key]
                        
                        if isinstance(detail, dict):
                            video_info['title'] = self.clean_text(detail.get('desc', ''))
                            video_info['description'] = self.clean_text(detail.get('desc', ''))
                            
                            author_info = detail.get('author', {})
                            video_info['author'] = author_info.get('nickname', '')
                            
                            video = detail.get('video', {})
                            if video:
                                play_addr = video.get('playAddr', {})
                                if isinstance(play_addr, dict):
                                    url_list = play_addr.get('urlList', [])
                                    if url_list:
                                        video_info['video_url'] = url_list[0]
                                
                                cover = video.get('cover', {})
                                if isinstance(cover, dict):
                                    url_list = cover.get('urlList', [])
                                    if url_list:
                                        video_info['cover'] = url_list[0]
                            
                            statistics = detail.get('statistics', {})
                            video_info['likes'] = statistics.get('diggCount', 0)
                            video_info['comments'] = statistics.get('commentCount', 0)
                            video_info['shares'] = statistics.get('shareCount', 0)
                            
                            text_extra = detail.get('textExtra', [])
                            video_info['tags'] = [tag.get('hashtagName', '') for tag in text_extra if tag.get('hashtagName')]
                            
                            break
                    except (json.JSONDecodeError, AttributeError, KeyError) as e:
                        continue
            
            if not video_info['title']:
                title_tag = soup.find('meta', property='og:title')
                if title_tag:
                    video_info['title'] = title_tag.get('content', '')
                
                desc_tag = soup.find('meta', property='og:description')
                if desc_tag:
                    video_info['description'] = desc_tag.get('content', '')
                
                image_tag = soup.find('meta', property='og:image')
                if image_tag:
                    video_info['cover'] = image_tag.get('content', '')
            
            return video_info if video_info['title'] or video_info['description'] else None
            
        except Exception as e:
            print(f"抖音解析错误: {str(e)}")
            return None
