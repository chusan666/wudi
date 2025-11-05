# Visualization Architecture

This document outlines the visualization architecture and chart library usage in the KOL Analytics Dashboard.

## Chart Libraries

### Primary: Recharts

We use **Recharts** as our primary charting library for the following reasons:

- **React-native**: Built specifically for React with component-based architecture
- **Declarative**: Simple, declarative API that integrates well with React patterns
- **Customizable**: Extensive customization options with consistent styling
- **Performance**: Efficient rendering with SVG-based charts
- **Accessibility**: Built-in accessibility features

### Secondary: VisX (Optional)

For advanced visualizations requiring more control, we have **VisX** available:

- **Modular**: Low-level visualization primitives
- **Flexible**: Maximum control over visual elements
- **Performance**: Highly optimized for complex visualizations
- **D3-based**: Leverages D3.js power in React components

## Chart Components Architecture

### Base Chart Components

All chart components are located in `components/charts/index.tsx`:

```typescript
// DemographicChart - Bar and Pie charts for demographics
export function DemographicChart({ data, title, type = 'bar' })

// TimeSeriesChart - Line and Area charts for trends
export function TimeSeriesChart({ data, title, type = 'line' })

// ConversionFunnel - Horizontal bar chart for conversion funnels
export function ConversionFunnel({ data, title })

// MetricCard - Key metric display with trend indicators
export function MetricCard({ title, value, change, changeType })
```

### Chart Data Structure

All charts expect a consistent data structure:

```typescript
interface ChartData {
  name: string        // Label for the data point
  value: number       // Primary value
  [key: string]: any  // Additional properties for multi-series charts
}
```

### Color Palette

We use a consistent color palette across all charts:

```typescript
const COLORS = [
  '#0088FE', // Blue
  '#00C49F', // Green
  '#FFBB28', // Yellow
  '#FF8042', // Orange
  '#8884D8', // Purple
  '#82CA9D'  // Teal
]
```

## Chart Usage Patterns

### 1. Demographic Breakdowns

Used for age groups, gender distribution, and geographic data:

```typescript
<DemographicChart
  data={ageData}
  title="Age Distribution"
  type="bar"  // or "pie"
/>
```

### 2. Time Series Data

Used for performance trends, pricing history, and growth metrics:

```typescript
<TimeSeriesChart
  data={timelineData}
  title="Engagement Trends"
  type="line"  // or "area"
  dataKey="engagement"
/>
```

### 3. Conversion Funnels

Used for conversion tracking and user journey analysis:

```typescript
<ConversionFunnel
  data={funnelData}
  title="Conversion Funnel"
/>
```

### 4. Key Metrics

Used for displaying important KPIs with trend indicators:

```typescript
<MetricCard
  title="Engagement Rate"
  value="5.8%"
  change={12.5}
  changeType="increase"
  description="Above industry average"
/>
```

## Responsive Design

All charts are wrapped in `ResponsiveContainer` to ensure they adapt to different screen sizes:

```typescript
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    {/* Chart configuration */}
  </BarChart>
</ResponsiveContainer>
```

### Breakpoint Strategy

- **Mobile (< 768px)**: Charts stack vertically, simplified legends
- **Tablet (768px - 1024px)**: 2-column layouts where appropriate
- **Desktop (> 1024px)**: Full multi-column layouts

## Performance Optimization

### Data Fetching Strategy

Charts use TanStack Query with intelligent caching:

```typescript
const { data: chartData } = useQuery({
  queryKey: ['chart-data', kolId],
  queryFn: () => fetchChartData(kolId),
  staleTime: 5 * 60 * 1000, // 5 minutes
})
```

### Prefetching

Data is prefetched when navigating to improve perceived performance:

```typescript
const prefetchData = usePrefetchKOLData(kolId)
useEffect(() => {
  prefetchData() // Prefetch all tab data
}, [kolId, prefetchData])
```

### Chart Optimization

1. **Data Limiting**: Limit data points to prevent performance issues
2. **Memoization**: Use React.memo for chart components
3. **Debouncing**: Debounce resize events for responsive charts
4. **Lazy Loading**: Load charts only when tab becomes active

## Accessibility

### Keyboard Navigation

All interactive chart elements support keyboard navigation:

```typescript
<BarChart>
  <Bar
    dataKey="value"
    onFocus={(e) => handleFocus(e)}
    onBlur={(e) => handleBlur(e)}
  />
</BarChart>
```

### Screen Reader Support

Charts include ARIA labels and descriptions:

```typescript
<div role="img" aria-label={`Chart showing ${title}`}>
  <ChartComponent />
</div>
```

### High Contrast Mode

Charts adapt to high contrast preferences using CSS custom properties:

```css
@media (prefers-contrast: high) {
  .chart-container {
    --chart-stroke: black;
    --chart-fill: white;
  }
}
```

## Customization Guidelines

### Adding New Chart Types

1. **Create Component**: Add new chart component to `components/charts/`
2. **Define Props**: Use TypeScript interfaces for props
3. **Consistent Styling**: Follow existing color and spacing patterns
4. **Responsive**: Wrap in ResponsiveContainer
5. **Test**: Add unit tests for new chart types

### Example: Custom Chart Component

```typescript
interface CustomChartProps {
  data: ChartData[]
  title: string
  height?: number
}

export function CustomChart({ data, title, height = 300 }: CustomChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {/* Custom chart implementation */}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

## Error Handling

### Chart Error Boundaries

Charts are wrapped in error boundaries to prevent crashes:

```typescript
<ChartErrorBoundary fallback={<ErrorDisplay />}>
  <ChartComponent data={data} />
</ChartErrorBoundary>
```

### Data Validation

Chart data is validated before rendering:

```typescript
const isValidChartData = (data: any[]): data is ChartData[] => {
  return Array.isArray(data) && 
         data.every(item => 
           typeof item.name === 'string' && 
           typeof item.value === 'number'
         )
}
```

### Loading States

Charts show loading states while data is being fetched:

```typescript
if (isLoading) return <ChartSkeleton />
if (error) return <ErrorMessage error={error} />
if (!data || data.length === 0) return <EmptyState />
```

## Future Enhancements

### Planned Features

1. **Interactive Tooltips**: Enhanced tooltips with drill-down capabilities
2. **Chart Exports**: Export individual charts as PNG/SVG
3. **Real-time Updates**: WebSocket integration for live data
4. **Advanced Filters**: Dynamic filtering within charts
5. **Custom Themes**: Multiple color themes for charts

### Performance Improvements

1. **Virtualization**: For large datasets
2. **Web Workers**: Offload data processing
3. **Chart Splitting**: Break large charts into smaller components
4. **Caching**: Enhanced caching strategies for chart data

## Best Practices

### DOs

- ✅ Use consistent color schemes across charts
- ✅ Implement proper loading and error states
- ✅ Make charts responsive and accessible
- ✅ Provide clear labels and descriptions
- ✅ Optimize data fetching with caching

### DON'Ts

- ❌ Don't use chart types inappropriate for the data
- ❌ Don't overload charts with too much data
- ❌ Don't ignore accessibility requirements
- ❌ Don't skip error handling
- ❌ Don't use hardcoded dimensions

## Troubleshooting

### Common Issues

1. **Charts Not Rendering**: Check data structure and ResponsiveContainer
2. **Performance Issues**: Limit data points and implement memoization
3. **Styling Problems**: Verify Tailwind classes and CSS custom properties
4. **Accessibility Failures**: Test with screen readers and keyboard navigation

### Debug Tools

- React Query DevTools for data fetching
- React DevTools for component inspection
- Browser DevTools for performance profiling
- Accessibility testing tools for a11y validation