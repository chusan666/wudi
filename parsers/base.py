from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import httpx
import re


class BaseParser(ABC):
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
    
    @abstractmethod
    async def parse(self, url: str) -> Optional[Dict[str, Any]]:
        pass
    
    async def get_redirect_url(self, short_url: str) -> str:
        async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
            response = await client.get(short_url, headers=self.headers)
            return str(response.url)
    
    async def fetch_page(self, url: str) -> str:
        async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            return response.text
    
    def extract_json_from_html(self, html: str, pattern: str) -> Optional[str]:
        match = re.search(pattern, html, re.DOTALL)
        if match:
            return match.group(1)
        return None
