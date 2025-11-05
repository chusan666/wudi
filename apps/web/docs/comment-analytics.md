# Comment Analytics Documentation

## Overview

The Comment Analytics page provides comprehensive insights into comment data for individual notes. It offers real-time analysis, interactive visualizations, and export capabilities to help users understand engagement patterns and sentiment trends.

## Features

### Core Analytics
- **Summary Metrics**: Total comments, likes, replies, and sentiment scores
- **Interactive Charts**: Like distribution, sentiment breakdown, activity timeline, and word frequency
- **Advanced Filtering**: Filter by minimum likes, reply status, keywords, and date ranges
- **Export Functionality**: Download data in CSV or JSON formats
- **State Persistence**: Filters are preserved across browser sessions

### Visualizations
1. **Like Distribution Bar Chart**: Shows how likes are distributed across comment ranges
2. **Sentiment Pie Chart**: Displays positive, neutral, and negative sentiment breakdown
3. **Activity Timeline Line Chart**: Tracks comment activity over time
4. **Word Frequency List**: Shows the most common words in comments

## Architecture

### Component Structure
```
/app/notes/[id]/comments/
├── page.tsx                    # Main analytics page
└── __tests__/
    └── page.test.tsx          # Component tests

/store/
└── comment-analytics-store.ts # Zustand store for filters and state

/lib/
├── comment-analytics.ts       # Analytics utilities and algorithms
└── __tests__/
    └── comment-analytics.test.ts # Utility tests

/components/ui/
├── date-range-picker.tsx      # Date range selection component
├── select.tsx                 # Select dropdown component
├── textarea.tsx               # Textarea component
└── badge.tsx                  # Badge component for metrics
```

### Data Flow
1. **API Integration**: Comments are fetched via TanStack Query with server-side initial fetch
2. **State Management**: Zustand store manages filters and export preferences
3. **Data Processing**: Client-side text analytics process comment data
4. **Visualization**: Recharts library renders interactive charts
5. **Export**: Utility functions generate CSV/JSON downloads

## Analytics Pipeline

### 1. Data Collection
- Comments are fetched from the API with applied filters
- Each comment includes: content, likes, replies, timestamp, author, and metadata

### 2. Data Processing
```typescript
interface Comment {
  id: string;
  content: string;
  likes: number;
  replies: number;
  createdAt: string;
  author: string;
  hasReplies: boolean;
}
```

### 3. Text Analytics

#### Word Frequency Analysis
- Processes comment text to extract word frequencies
- Filters out words shorter than 3 characters
- Removes punctuation and normalizes to lowercase
- Returns top 20 most frequent words

#### Sentiment Analysis (Current Implementation)
- Uses keyword-based sentiment analysis
- Positive words: 'good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'wonderful', 'fantastic'
- Negative words: 'bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disgusting', 'poor'
- Calculates sentiment score: (positive - negative) / total

#### Like Distribution
- Categorizes comments into like ranges:
  - 0 likes
  - 1-5 likes
  - 6-10 likes
  - 11-25 likes
  - 26-50 likes
  - 50+ likes

#### Activity Timeline
- Groups comments by date
- Sorted chronologically
- Shows daily comment volume

## Filter System

### Available Filters
1. **Minimum Likes**: Integer input (0+)
2. **Has Replies**: Boolean toggle (All/Only with replies)
3. **Keyword Search**: Text search within comment content
4. **Date Range**: From/to date selection

### Filter Persistence
- Filters are automatically saved to localStorage
- Persisted across browser sessions
- Reset functionality restores defaults

## Export Functionality

### CSV Export
- Headers: ID, Content, Likes, Replies, Author, Created At
- Proper CSV escaping for quotes and special characters
- Filename format: `comments-{noteId}-{timestamp}.csv`

### JSON Export
- Complete analytics object
- Full comment array
- Export timestamp
- Filename format: `comments-{noteId}-{timestamp}.json`

## State Management

### Store Structure
```typescript
interface CommentAnalyticsState {
  filters: {
    minLikes: number;
    hasReplies: boolean;
    timeRange: { from: Date | null; to: Date | null };
    keyword: string;
  };
  exportFormat: 'csv' | 'json';
  // Actions
  setFilters: (filters: Partial<Filter>) => void;
  resetFilters: () => void;
  setExportFormat: (format: 'csv' | 'json') => void;
}
```

### Persistence Strategy
- Uses Zustand persist middleware
- Only filters are persisted (not export format)
- Storage key: `comment-analytics-filters`

## Testing Strategy

### Unit Tests
- **Analytics Utilities**: Test all data processing functions
- **Store Functions**: Test state management and persistence
- **Component Tests**: Test UI interactions and rendering

### Test Coverage
- Word frequency analysis edge cases
- Sentiment analysis with various comment types
- Filter interactions and state updates
- Export functionality
- Loading states and error handling

## Performance Considerations

### Client-Side Processing
- All text analytics performed client-side for responsiveness
- Efficient algorithms for word frequency and sentiment analysis
- Memoized calculations prevent unnecessary reprocessing

### Data Optimization
- Comments are fetched with applied filters to reduce data transfer
- Analytics are recalculated only when comment data changes
- Chart rendering optimized with Recharts built-in performance features

## Accessibility

### Chart Accessibility
- All charts have proper ARIA labels
- Keyboard navigation support
- Screen reader compatible data tables as fallbacks
- High contrast color schemes

### Filter Controls
- Proper form labels and descriptions
- Keyboard navigation support
- Clear focus indicators
- Error announcements for invalid inputs

## Future Enhancements

### Planned Features

#### Advanced Sentiment Analysis
- Integration with ML-based sentiment analysis API
- Emotion detection (joy, anger, fear, etc.)
- Aspect-based sentiment analysis
- Real-time sentiment tracking

#### Enhanced Analytics
- Comment thread analysis
- User engagement patterns
- Topic modeling and clustering
- Spam detection and filtering

#### Performance Improvements
- Server-side text analytics for large datasets
- Caching strategy for computed analytics
- Progressive loading for large comment sets
- Real-time updates with WebSocket integration

#### Export Enhancements
- Excel export format
- PDF report generation
- Custom date range exports
- Scheduled report generation

### Technical Debt
- Replace keyword-based sentiment with ML model
- Implement proper error boundaries
- Add comprehensive logging
- Optimize for mobile devices

## API Integration Notes

### Expected API Endpoints
```typescript
// GET /api/notes/{id}/comments
interface CommentsResponse {
  comments: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  analytics?: {
    // Optional server-side analytics
  };
}
```

### Query Parameters
- `minLikes`: Filter by minimum likes
- `hasReplies`: Filter by reply status
- `keyword`: Search in comment content
- `dateFrom`: Start date filter
- `dateTo`: End date filter
- `page`: Pagination page
- `limit`: Results per page

## Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features
- ES2020+ JavaScript features
- CSS Grid and Flexbox
- LocalStorage for persistence
- File download API for exports

## Security Considerations

### Data Privacy
- All processing happens client-side when possible
- No sensitive data stored in localStorage
- Sanitized content before processing
- XSS prevention in comment rendering

### Input Validation
- Server-side validation for all filters
- Client-side sanitization for user inputs
- SQL injection prevention in API calls
- Rate limiting for API requests

## Known Limitations

### Current Limitations
1. **Sentiment Analysis**: Basic keyword-based approach, may miss context
2. **Scalability**: Client-side processing may struggle with >10,000 comments
3. **Real-time**: No live updates, requires manual refresh
4. **Languages**: Optimized for English text only

### Mitigation Strategies
- Implement pagination for large comment sets
- Add loading states for long-running calculations
- Provide feedback for processing status
- Consider server-side processing for enterprise scale

## Troubleshooting

### Common Issues

#### Charts Not Rendering
- Check that Recharts is properly installed
- Verify data structure matches expected format
- Ensure container has proper dimensions

#### Filters Not Persisting
- Check localStorage availability
- Verify Zustand persist configuration
- Clear browser cache and retry

#### Export Not Working
- Check File API support
- Verify content generation
- Test in different browsers

#### Performance Issues
- Reduce comment count with filters
- Check for memory leaks
- Monitor processing time

### Debug Information
- Store state available in browser dev tools
- Analytics data logged to console in development
- Error boundaries provide detailed error messages
- Network tab shows API request details