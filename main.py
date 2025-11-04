from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, Any
import logging

from parsers.xiaohongshu import XiaohongshuParser
from parsers.douyin import DouyinParser
from parsers.bilibili import BilibiliParser
from parsers.kuaishou import KuaishouParser

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="视频链接解析API",
    description="支持小红书、抖音、B站、快手等平台的视频链接解析",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VideoRequest(BaseModel):
    url: str


class VideoResponse(BaseModel):
    platform: str
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


parsers = {
    "xiaohongshu": XiaohongshuParser(),
    "douyin": DouyinParser(),
    "bilibili": BilibiliParser(),
    "kuaishou": KuaishouParser(),
}


def detect_platform(url: str) -> Optional[str]:
    url_lower = url.lower()
    if "xiaohongshu.com" in url_lower or "xhslink.com" in url_lower:
        return "xiaohongshu"
    elif "douyin.com" in url_lower or "iesdouyin.com" in url_lower:
        return "douyin"
    elif "bilibili.com" in url_lower or "b23.tv" in url_lower:
        return "bilibili"
    elif "kuaishou.com" in url_lower or "ksurl.cn" in url_lower:
        return "kuaishou"
    return None


@app.get("/")
async def root():
    return {
        "message": "视频链接解析API",
        "supported_platforms": ["小红书", "抖音", "B站", "快手"],
        "endpoints": {
            "/parse": "POST - 解析视频链接",
            "/health": "GET - 健康检查"
        }
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/parse", response_model=VideoResponse)
async def parse_video(request: VideoRequest):
    url = request.url
    
    platform = detect_platform(url)
    
    if not platform:
        raise HTTPException(
            status_code=400,
            detail="不支持的平台或无效的链接"
        )
    
    parser = parsers.get(platform)
    if not parser:
        raise HTTPException(
            status_code=500,
            detail=f"平台 {platform} 的解析器未实现"
        )
    
    try:
        logger.info(f"正在解析 {platform} 链接: {url}")
        result = await parser.parse(url)
        
        if result:
            return VideoResponse(
                platform=platform,
                success=True,
                data=result
            )
        else:
            return VideoResponse(
                platform=platform,
                success=False,
                error="无法提取视频信息"
            )
    
    except Exception as e:
        logger.error(f"解析失败: {str(e)}", exc_info=True)
        return VideoResponse(
            platform=platform,
            success=False,
            error=str(e)
        )


@app.get("/platforms")
async def get_platforms():
    return {
        "platforms": [
            {
                "name": "小红书",
                "key": "xiaohongshu",
                "domains": ["xiaohongshu.com", "xhslink.com"]
            },
            {
                "name": "抖音",
                "key": "douyin",
                "domains": ["douyin.com", "iesdouyin.com"]
            },
            {
                "name": "B站",
                "key": "bilibili",
                "domains": ["bilibili.com", "b23.tv"]
            },
            {
                "name": "快手",
                "key": "kuaishou",
                "domains": ["kuaishou.com", "ksurl.cn"]
            }
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
