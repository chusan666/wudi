from abc import ABC, abstractmethod
import requests
import re

class BaseParser(ABC):
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        })
    
    @abstractmethod
    def parse(self, url):
        pass
    
    def clean_text(self, text):
        if not text:
            return ''
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def extract_video_id(self, url):
        return None
