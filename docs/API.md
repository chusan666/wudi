# KOL Analytics API Documentation

## Overview

The KOL Analytics API provides comprehensive endpoints for retrieving influencer analytics data including profiles, pricing, audience demographics, performance metrics, conversion data, and marketing indices.

## Base URL

```
https://api.kol-analytics.com/v1
```

## Authentication

Currently, the API does not require authentication. However, rate limiting is enforced:
- **Rate Limit**: 100 requests per minute per IP
- **Rate Limit Window**: 60 seconds

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data specific to the endpoint
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req_123456789",
    "cache": {
      "hit": true,
      "ttl": 3600
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req_123456789"
  }
}
```

## Endpoints

### 1. KOL Profile

**GET** `/api/kol/:id/profile`

Retrieves comprehensive influencer profile information including basic data, recent campaigns, and certifications.

#### Parameters
- `id` (path, required): KOL unique identifier
- `refresh` (query, optional): Set to `true` to force data refresh from source

#### Response
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "kol_123",
      "platform": "xiaohongshu",
      "platformUserId": "user_456",
      "username": "influencer_name",
      "displayName": "Display Name",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "Influencer bio",
      "verified": true,
      "verificationType": "blue_v",
      "followerCount": 50000,
      "followingCount": 1000,
      "postCount": 250,
      "categories": ["fashion", "beauty"],
      "certifications": {},
      "location": "Shanghai",
      "website": "https://example.com",
      "contactEmail": "contact@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "recentCampaigns": [],
    "certifications": {},
    "categories": ["fashion", "beauty"]
  }
}
```

#### Data Freshness
- **Cache TTL**: 1 hour
- **Auto-refresh**: Data older than 1 hour is automatically refreshed
- **Force refresh**: Use `?refresh=true` to bypass cache

---

### 2. KOL Pricing

**GET** `/api/kol/:id/pricing`

Retrieves pricing information including current rates, historical pricing, and cooperation history.

#### Parameters
- `id` (path, required): KOL unique identifier

#### Response
```json
{
  "success": true,
  "data": {
    "currentPricing": [
      {
        "id": "price_123",
        "kolId": "kol_123",
        "serviceType": "post",
        "basePrice": 5000.00,
        "currency": "CNY",
        "priceUnit": "per_post",
        "minFollowers": 10000,
        "maxFollowers": 100000,
        "engagementRate": 0.05,
        "validFrom": "2024-01-01T00:00:00.000Z",
        "validTo": "2024-12-31T23:59:59.999Z",
        "isActive": true
      }
    ],
    "pricingHistory": [],
    "cooperationHistory": []
  }
}
```

#### Data Freshness
- **Cache TTL**: 30 minutes

---

### 3. KOL Audience

**GET** `/api/kol/:id/audience`

Retrieves audience demographics and insights.

#### Parameters
- `id` (path, required): KOL unique identifier

#### Response
```json
{
  "success": true,
  "data": {
    "demographics": {
      "id": "aud_123",
      "kolId": "kol_123",
      "totalFollowers": 50000,
      "genderDistribution": {
        "male": 30,
        "female": 68,
        "other": 2
      },
      "ageDistribution": {
        "18-24": 20,
        "25-34": 45,
        "35-44": 25,
        "45+": 10
      },
      "locationDistribution": {
        "Shanghai": 25,
        "Beijing": 20,
        "Guangzhou": 15
      },
      "interests": ["fashion", "beauty", "lifestyle", "travel"],
      "languages": ["zh", "en"],
      "engagementRate": 0.05,
      "avgSessionTime": 180,
      "dataFreshness": "2024-01-01T00:00:00.000Z"
    },
    "insights": {
      "topInterests": ["fashion", "beauty", "lifestyle"],
      "growthTrend": "growing",
      "engagementQuality": "high"
    }
  }
}
```

#### Data Freshness
- **Cache TTL**: 2 hours

---

### 4. KOL Performance

**GET** `/api/kol/:id/performance`

Retrieves content performance metrics and KPIs.

#### Parameters
- `id` (path, required): KOL unique identifier
- `contentType` (query, optional): Filter by content type (`image`, `video`, `live`, `story`)
- `period` (query, optional): Time period (`7d`, `30d`, `90d`)

#### Response
```json
{
  "success": true,
  "data": {
    "metrics": [
      {
        "id": "perf_123",
        "kolId": "kol_123",
        "contentType": "video",
        "period": "30d",
        "avgViews": 10000,
        "avgLikes": 500,
        "avgComments": 50,
        "avgShares": 25,
        "avgSaves": 100,
        "engagementRate": 0.0675,
        "reach": 15000,
        "impressions": 25000,
        "videoCompletionRate": 0.75,
        "clickThroughRate": 0.03,
        "conversionRate": 0.01,
        "dataFreshness": "2024-01-01T00:00:00.000Z"
      }
    ],
    "summary": {
      "overallEngagementRate": 0.0675,
      "topPerformingContentType": "video",
      "growthMetrics": {
        "avgViews": 10000,
        "avgLikes": 500
      }
    }
  }
}
```

#### Data Freshness
- **Cache TTL**: 30 minutes

---

### 5. KOL Conversion

**GET** `/api/kol/:id/conversion`

Retrieves conversion-focused campaign metrics.

#### Parameters
- `id` (path, required): KOL unique identifier
- `campaignId` (query, optional): Filter by specific campaign

#### Response
```json
{
  "success": true,
  "data": {
    "conversionMetrics": [
      {
        "id": "conv_123",
        "kolId": "kol_123",
        "campaignId": "camp_456",
        "conversionType": "purchase",
        "period": "30d",
        "totalConversions": 100,
        "conversionRate": 0.02,
        "avgOrderValue": 150.00,
        "revenue": 15000.00,
        "costPerAcquisition": 30.00,
        "returnOnAdSpend": 5.00,
        "attributionModel": "last_click",
        "dataFreshness": "2024-01-01T00:00:00.000Z"
      }
    ],
    "summary": {
      "totalConversions": 100,
      "avgConversionRate": 0.02,
      "totalRevenue": 15000.00,
      "roi": 500.00
    }
  }
}
```

#### Data Freshness
- **Cache TTL**: 1 hour

---

### 6. KOL Marketing Index

**GET** `/api/kol/:id/marketing-index`

Retrieves marketing indices including RED index and trend data.

#### Parameters
- `id` (path, required): KOL unique identifier
- `indexType` (query, optional): Filter by index type (`RED`, `engagement`, `growth`, `influence`)

#### Response
```json
{
  "success": true,
  "data": {
    "indices": [
      {
        "id": "idx_123",
        "kolId": "kol_123",
        "indexType": "RED",
        "indexValue": 85.50,
        "indexRank": 150,
        "percentile": 85.5,
        "trendDirection": "rising",
        "trendChange": 5.2,
        "category": "fashion",
        "platform": "xiaohongshu",
        "calculationDate": "2024-01-01T00:00:00.000Z",
        "dataFreshness": "2024-01-01T00:00:00.000Z"
      }
    ],
    "trends": {
      "redIndex": {
        "current": 85.50,
        "rank": 150,
        "trend": "rising"
      },
      "growthIndex": {
        "current": 78.20,
        "trend": "stable"
      },
      "influenceIndex": {
        "current": 92.10,
        "trend": "rising"
      }
    }
  }
}
```

#### Data Freshness
- **Cache TTL**: 15 minutes

---

### 7. Cache Management

**POST** `/api/kol/:id/refresh-cache`

Manually invalidate cache for a specific KOL to force fresh data on next request.

#### Parameters
- `id` (path, required): KOL unique identifier

#### Response
```json
{
  "success": true,
  "data": {
    "message": "Cache invalidated successfully"
  }
}
```

---

## Health Check

**GET** `/health`

Basic health check endpoint.

**GET** `/health/detailed`

Detailed health check including database and Redis status.

#### Response
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "checks": {
      "database": "healthy",
      "redis": "healthy",
      "memory": {
        "used": 45.67,
        "total": 128.00
      }
    },
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 3600
  }
}
```

## Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Access forbidden |
| `NOT_FOUND` | 404 | Resource not found |
| `CRAWLER_ERROR` | 502 | External data source error |
| `CACHE_ERROR` | 500 | Cache operation failed |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

## Rate Limits

- **Default**: 100 requests per minute per IP
- **Burst**: 10 requests per second
- **Headers**: Rate limit info included in response headers:
  - `X-RateLimit-Limit`: Request limit per window
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time until reset (Unix timestamp)

## Data Freshness Strategy

- **Profile Data**: Auto-refresh every hour, manual refresh available
- **Pricing Data**: Cached for 30 minutes, updated on business logic changes
- **Audience Data**: Cached for 2 hours, updated from platform analytics
- **Performance Data**: Cached for 30 minutes, real-time aggregation
- **Conversion Data**: Cached for 1 hour, updated from campaign tracking
- **Marketing Index**: Cached for 15 minutes, frequent updates for trend data

## SDKs and Libraries

Official SDKs are available for:
- JavaScript/TypeScript
- Python
- Go

Contact support for additional language support.

## Support

For API support and questions:
- Email: api-support@kol-analytics.com
- Documentation: https://docs.kol-analytics.com
- Status Page: https://status.kol-analytics.com