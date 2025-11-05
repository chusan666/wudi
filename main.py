from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, Any, List
import logging
import json
import csv
import io
from datetime import datetime, timedelta
import random

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


# KOL Analytics Models
class KOLProfile(BaseModel):
    id: str
    name: str
    platform: str
    avatar: Optional[str] = None
    followers: int
    verified: bool
    bio: Optional[str] = None

class KOLPricing(BaseModel):
    id: str
    kolId: str
    platform: str
    postPrice: float
    videoPrice: float
    storyPrice: float
    livestreamPrice: float
    currency: str
    lastUpdated: str

class KOLAudience(BaseModel):
    id: str
    kolId: str
    ageGroups: Dict[str, float]
    gender: Dict[str, float]
    locations: Dict[str, float]
    interests: List[str]
    languages: List[str]

class KOLPerformance(BaseModel):
    id: str
    kolId: str
    engagementRate: float
    avgLikes: float
    avgComments: float
    avgShares: float
    reach: float
    impressions: float
    videoViews: float
    monthlyGrowth: float
    month: str

class KOLConversion(BaseModel):
    id: str
    kolId: str
    clickThroughRate: float
    conversionRate: float
    costPerClick: float
    costPerConversion: float
    returnOnAdSpend: float
    revenueGenerated: float

class KOLMarketingIndex(BaseModel):
    id: str
    kolId: str
    overallScore: float
    reachScore: float
    engagementScore: float
    conversionScore: float
    contentQualityScore: float
    brandSafetyScore: float
    trendAlignmentScore: float
    date: str


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


# KOL Analytics Endpoints

def generate_mock_kol_profile(kolId: str) -> KOLProfile:
    platforms = ["xiaohongshu", "douyin", "bilibili", "kuaishou"]
    names = ["FashionGuru", "TechReviewer", "BeautyExpert", "FoodBlogger", "TravelVlogger"]
    return KOLProfile(
        id=kolId,
        name=random.choice(names) + f"_{kolId}",
        platform=random.choice(platforms),
        followers=random.randint(10000, 5000000),
        verified=random.choice([True, False]),
        bio=f"Content creator passionate about {random.choice(['fashion', 'technology', 'beauty', 'food', 'travel'])}"
    )

def generate_mock_kol_pricing(kolId: str) -> KOLPricing:
    return KOLPricing(
        id=f"pricing_{kolId}",
        kolId=kolId,
        platform="xiaohongshu",
        postPrice=random.uniform(500, 5000),
        videoPrice=random.uniform(1000, 10000),
        storyPrice=random.uniform(200, 2000),
        livestreamPrice=random.uniform(2000, 15000),
        currency="USD",
        lastUpdated=datetime.now().isoformat()
    )

def generate_mock_kol_audience(kolId: str) -> KOLAudience:
    return KOLAudience(
        id=f"audience_{kolId}",
        kolId=kolId,
        ageGroups={
            "18-24": random.uniform(15, 35),
            "25-34": random.uniform(30, 50),
            "35-44": random.uniform(15, 30),
            "45-54": random.uniform(5, 15),
            "55+": random.uniform(2, 10)
        },
        gender={
            "female": random.uniform(55, 85),
            "male": random.uniform(15, 45)
        },
        locations={
            "United States": random.uniform(25, 45),
            "China": random.uniform(15, 35),
            "United Kingdom": random.uniform(5, 15),
            "Canada": random.uniform(3, 10),
            "Australia": random.uniform(2, 8)
        },
        interests=["Fashion", "Beauty", "Lifestyle", "Technology", "Travel", "Food", "Fitness"],
        languages=["English", "Mandarin", "Spanish", "French"]
    )

def generate_mock_kol_performance(kolId: str) -> KOLPerformance:
    return KOLPerformance(
        id=f"performance_{kolId}",
        kolId=kolId,
        engagementRate=random.uniform(2.0, 8.0),
        avgLikes=random.uniform(1000, 50000),
        avgComments=random.uniform(100, 5000),
        avgShares=random.uniform(50, 2000),
        reach=random.uniform(50000, 2000000),
        impressions=random.uniform(100000, 5000000),
        videoViews=random.uniform(10000, 1000000),
        monthlyGrowth=random.uniform(-5, 25),
        month=datetime.now().strftime("%Y-%m")
    )

def generate_mock_kol_conversion(kolId: str) -> KOLConversion:
    return KOLConversion(
        id=f"conversion_{kolId}",
        kolId=kolId,
        clickThroughRate=random.uniform(2.0, 8.0),
        conversionRate=random.uniform(1.0, 5.0),
        costPerClick=random.uniform(0.5, 3.0),
        costPerConversion=random.uniform(20, 150),
        returnOnAdSpend=random.uniform(2.0, 8.0),
        revenueGenerated=random.uniform(10000, 500000)
    )

def generate_mock_kol_marketing_index(kolId: str) -> KOLMarketingIndex:
    scores = [random.uniform(60, 95) for _ in range(7)]
    return KOLMarketingIndex(
        id=f"marketing_index_{kolId}",
        kolId=kolId,
        overallScore=sum(scores) / 7,
        reachScore=scores[0],
        engagementScore=scores[1],
        conversionScore=scores[2],
        contentQualityScore=scores[3],
        brandSafetyScore=scores[4],
        trendAlignmentScore=scores[5],
        date=datetime.now().isoformat()
    )

@app.get("/api/kol/profiles")
async def get_kol_profiles():
    """Get all KOL profiles"""
    profiles = []
    for i in range(1, 11):
        profiles.append(generate_mock_kol_profile(f"kol_{i}"))
    return profiles

@app.get("/api/kol/{kolId}/profile")
async def get_kol_profile(kolId: str):
    """Get specific KOL profile"""
    return generate_mock_kol_profile(kolId)

@app.get("/api/kol/{kolId}/pricing")
async def get_kol_pricing(kolId: str):
    """Get KOL pricing information"""
    return generate_mock_kol_pricing(kolId)

@app.get("/api/kol/{kolId}/pricing/history")
async def get_kol_pricing_history(kolId: str):
    """Get KOL pricing history"""
    history = []
    for i in range(6):
        date = datetime.now() - timedelta(days=30 * i)
        pricing = generate_mock_kol_pricing(kolId)
        pricing.lastUpdated = date.isoformat()
        history.append(pricing)
    return history

@app.get("/api/kol/{kolId}/audience")
async def get_kol_audience(kolId: str):
    """Get KOL audience demographics"""
    return generate_mock_kol_audience(kolId)

@app.get("/api/kol/{kolId}/audience/timeline")
async def get_kol_audience_timeline(kolId: str):
    """Get KOL audience timeline data"""
    timeline = []
    for i in range(6):
        date = datetime.now() - timedelta(days=30 * i)
        audience = generate_mock_kol_audience(kolId)
        timeline.append(audience)
    return timeline

@app.get("/api/kol/{kolId}/performance")
async def get_kol_performance(kolId: str):
    """Get KOL performance metrics"""
    return generate_mock_kol_performance(kolId)

@app.get("/api/kol/{kolId}/performance/timeline")
async def get_kol_performance_timeline(kolId: str):
    """Get KOL performance timeline"""
    timeline = []
    for i in range(6):
        date = datetime.now() - timedelta(days=30 * i)
        performance = generate_mock_kol_performance(kolId)
        performance.month = date.strftime("%Y-%m")
        timeline.append(performance)
    return timeline

@app.get("/api/kol/{kolId}/conversion")
async def get_kol_conversion(kolId: str):
    """Get KOL conversion metrics"""
    return generate_mock_kol_conversion(kolId)

@app.get("/api/kol/{kolId}/conversion/funnel")
async def get_kol_conversion_funnel(kolId: str):
    """Get KOL conversion funnel data"""
    return [
        {"stage": "Impressions", "count": 1000000, "conversionRate": 100.0},
        {"stage": "Clicks", "count": 45000, "conversionRate": 4.5},
        {"stage": "Landing Page", "count": 12000, "conversionRate": 26.7},
        {"stage": "Add to Cart", "count": 3400, "conversionRate": 28.3},
        {"stage": "Purchase", "count": 890, "conversionRate": 26.2}
    ]

@app.get("/api/kol/{kolId}/marketing-index")
async def get_kol_marketing_index(kolId: str):
    """Get KOL marketing index"""
    return generate_mock_kol_marketing_index(kolId)

@app.get("/api/kol/{kolId}/marketing-index/history")
async def get_kol_marketing_index_history(kolId: str):
    """Get KOL marketing index history"""
    history = []
    for i in range(6):
        date = datetime.now() - timedelta(days=30 * i)
        index = generate_mock_kol_marketing_index(kolId)
        index.date = date.isoformat()
        history.append(index)
    return history

@app.get("/api/kol/{kolId}/export")
async def export_kol_data(kolId: str, format: str = "csv"):
    """Export KOL data in CSV or PDF format"""
    # Get all KOL data
    profile = generate_mock_kol_profile(kolId)
    pricing = generate_mock_kol_pricing(kolId)
    audience = generate_mock_kol_audience(kolId)
    performance = generate_mock_kol_performance(kolId)
    conversion = generate_mock_kol_conversion(kolId)
    marketing_index = generate_mock_kol_marketing_index(kolId)
    
    if format.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(["KOL Analytics Export"])
        writer.writerow([f"Generated: {datetime.now().isoformat()}"])
        writer.writerow([])
        
        # Profile data
        writer.writerow(["Profile Information"])
        writer.writerow(["Field", "Value"])
        writer.writerow(["ID", profile.id])
        writer.writerow(["Name", profile.name])
        writer.writerow(["Platform", profile.platform])
        writer.writerow(["Followers", profile.followers])
        writer.writerow(["Verified", profile.verified])
        writer.writerow(["Bio", profile.bio])
        writer.writerow([])
        
        # Performance data
        writer.writerow(["Performance Metrics"])
        writer.writerow(["Metric", "Value"])
        writer.writerow(["Engagement Rate", f"{performance.engagementRate}%"])
        writer.writerow(["Average Likes", performance.avgLikes])
        writer.writerow(["Average Comments", performance.avgComments])
        writer.writerow(["Average Shares", performance.avgShares])
        writer.writerow(["Reach", performance.reach])
        writer.writerow(["Impressions", performance.impressions])
        writer.writerow(["Video Views", performance.videoViews])
        writer.writerow(["Monthly Growth", f"{performance.monthlyGrowth}%"])
        writer.writerow([])
        
        # Conversion data
        writer.writerow(["Conversion Metrics"])
        writer.writerow(["Metric", "Value"])
        writer.writerow(["Click-Through Rate", f"{conversion.clickThroughRate}%"])
        writer.writerow(["Conversion Rate", f"{conversion.conversionRate}%"])
        writer.writerow(["Cost Per Click", f"${conversion.costPerClick}"])
        writer.writerow(["Cost Per Conversion", f"${conversion.costPerConversion}"])
        writer.writerow(["Return on Ad Spend", f"{conversion.returnOnAdSpend}x"])
        writer.writerow(["Revenue Generated", f"${conversion.revenueGenerated}"])
        writer.writerow([])
        
        # Marketing Index
        writer.writerow(["Marketing Index"])
        writer.writerow(["Component", "Score"])
        writer.writerow(["Overall Score", f"{marketing_index.overallScore}/100"])
        writer.writerow(["Reach Score", f"{marketing_index.reachScore}/100"])
        writer.writerow(["Engagement Score", f"{marketing_index.engagementScore}/100"])
        writer.writerow(["Conversion Score", f"{marketing_index.conversionScore}/100"])
        writer.writerow(["Content Quality Score", f"{marketing_index.contentQualityScore}/100"])
        writer.writerow(["Brand Safety Score", f"{marketing_index.brandSafetyScore}/100"])
        writer.writerow(["Trend Alignment Score", f"{marketing_index.trendAlignmentScore}/100"])
        
        output.seek(0)
        
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode('utf-8')),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=kol_{kolId}_analytics.csv"}
        )
    
    elif format.lower() == "pdf":
        # For PDF, we'll return a simple text response as placeholder
        pdf_content = f"""
KOL Analytics Report - {profile.name}
Generated: {datetime.now().isoformat()}

PROFILE INFORMATION
ID: {profile.id}
Name: {profile.name}
Platform: {profile.platform}
Followers: {profile.followers:,}
Verified: {profile.verified}
Bio: {profile.bio}

PERFORMANCE METRICS
Engagement Rate: {performance.engagementRate}%
Average Likes: {performance.avgLikes:,}
Average Comments: {performance.avgComments:,}
Average Shares: {performance.avgShares:,}
Reach: {performance.reach:,}
Impressions: {performance.impressions:,}
Video Views: {performance.videoViews:,}
Monthly Growth: {performance.monthlyGrowth}%

CONVERSION METRICS
Click-Through Rate: {conversion.clickThroughRate}%
Conversion Rate: {conversion.conversionRate}%
Cost Per Click: ${conversion.costPerClick}
Cost Per Conversion: ${conversion.costPerConversion}
Return on Ad Spend: {conversion.returnOnAdSpend}x
Revenue Generated: ${conversion.revenueGenerated:,}

MARKETING INDEX
Overall Score: {marketing_index.overallScore}/100
Reach Score: {marketing_index.reachScore}/100
Engagement Score: {marketing_index.engagementScore}/100
Conversion Score: {marketing_index.conversionScore}/100
Content Quality Score: {marketing_index.contentQualityScore}/100
Brand Safety Score: {marketing_index.brandSafetyScore}/100
Trend Alignment Score: {marketing_index.trendAlignmentScore}/100
        """
        
        return StreamingResponse(
            io.BytesIO(pdf_content.encode('utf-8')),
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename=kol_{kolId}_analytics.txt"}
        )
    
    else:
        raise HTTPException(status_code=400, detail="Unsupported format. Use 'csv' or 'pdf'")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
