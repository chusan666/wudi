import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert "supported_platforms" in response.json()


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_get_platforms():
    response = client.get("/platforms")
    assert response.status_code == 200
    data = response.json()
    assert "platforms" in data
    assert len(data["platforms"]) == 4
    
    platform_keys = [p["key"] for p in data["platforms"]]
    assert "xiaohongshu" in platform_keys
    assert "douyin" in platform_keys
    assert "bilibili" in platform_keys
    assert "kuaishou" in platform_keys


def test_parse_invalid_url():
    response = client.post("/parse", json={"url": "https://example.com/video"})
    assert response.status_code == 400


def test_parse_xiaohongshu_url_structure():
    response = client.post("/parse", json={
        "url": "https://www.xiaohongshu.com/explore/xxxxx"
    })
    assert response.status_code == 200
    data = response.json()
    assert "platform" in data
    assert data["platform"] == "xiaohongshu"
    assert "success" in data


def test_parse_douyin_url_structure():
    response = client.post("/parse", json={
        "url": "https://www.douyin.com/video/7xxxxx"
    })
    assert response.status_code == 200
    data = response.json()
    assert "platform" in data
    assert data["platform"] == "douyin"
    assert "success" in data


def test_parse_bilibili_url_structure():
    response = client.post("/parse", json={
        "url": "https://www.bilibili.com/video/BVxxxxxxx"
    })
    assert response.status_code == 200
    data = response.json()
    assert "platform" in data
    assert data["platform"] == "bilibili"
    assert "success" in data


def test_parse_kuaishou_url_structure():
    response = client.post("/parse", json={
        "url": "https://www.kuaishou.com/short-video/xxxxx"
    })
    assert response.status_code == 200
    data = response.json()
    assert "platform" in data
    assert data["platform"] == "kuaishou"
    assert "success" in data
