from .base_parser import BaseParser
import re
import json
from bs4 import BeautifulSoup

class XiaohongshuParser(BaseParser):
    def parse(self, url):
        try:
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
                if script.string and '__INITIAL_STATE__' in script.string:
                    try:
                        json_text = script.string
                        json_text = re.search(r'window\.__INITIAL_STATE__\s*=\s*({.*?})\s*(?:</script>|$)', json_text, re.DOTALL)
                        if json_text:
                            data = json.loads(json_text.group(1))
                            note_data = data.get('note', {}).get('noteDetailMap', {})
                            
                            if note_data:
                                first_note = list(note_data.values())[0] if note_data else {}
                                note = first_note.get('note', {})
                                
                                video_info['title'] = self.clean_text(note.get('title', ''))
                                video_info['description'] = self.clean_text(note.get('desc', ''))
                                
                                user_info = note.get('user', {})
                                video_info['author'] = user_info.get('nickname', '')
                                
                                video = note.get('video', {})
                                if video:
                                    video_info['video_url'] = video.get('media', {}).get('stream', {}).get('h264', [{}])[0].get('masterUrl', '')
                                    video_info['cover'] = video.get('cover', {}).get('url', '')
                                
                                interact_info = note.get('interactInfo', {})
                                video_info['likes'] = interact_info.get('likedCount', 0)
                                video_info['comments'] = interact_info.get('commentCount', 0)
                                video_info['shares'] = interact_info.get('shareCount', 0)
                                
                                video_info['tags'] = [tag.get('name', '') for tag in note.get('tagList', [])]
                                
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
            print(f"小红书解析错误: {str(e)}")
            return None
