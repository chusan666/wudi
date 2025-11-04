from .base_parser import BaseParser
import re
import json
from bs4 import BeautifulSoup

class KuaishouParser(BaseParser):
    def parse(self, url):
        try:
            if 'ksurl.cn' in url or 'v.kuaishou.com' in url:
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
            
            script_tags = soup.find_all('script')
            for script in script_tags:
                if script.string and 'window.__APOLLO_STATE__' in script.string:
                    try:
                        json_match = re.search(r'window\.__APOLLO_STATE__\s*=\s*({.*?});', script.string, re.DOTALL)
                        if json_match:
                            data = json.loads(json_match.group(1))
                            
                            for key, value in data.items():
                                if isinstance(value, dict) and 'caption' in value:
                                    video_info['title'] = self.clean_text(value.get('caption', ''))
                                    video_info['description'] = self.clean_text(value.get('caption', ''))
                                    
                                    video_info['cover'] = value.get('poster', '')
                                    video_info['video_url'] = value.get('playUrl', '')
                                    
                                    video_info['likes'] = value.get('likeCount', 0)
                                    video_info['comments'] = value.get('commentCount', 0)
                                    video_info['shares'] = value.get('shareCount', 0)
                                    video_info['views'] = value.get('viewCount', 0)
                                    
                                    author = value.get('author', {})
                                    if isinstance(author, dict):
                                        video_info['author'] = author.get('name', '')
                                    
                                    break
                            
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
                
                video_tag = soup.find('meta', property='og:video:url')
                if video_tag:
                    video_info['video_url'] = video_tag.get('content', '')
            
            return video_info if video_info['title'] or video_info['description'] else None
            
        except Exception as e:
            print(f"快手解析错误: {str(e)}")
            return None
