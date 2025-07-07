# Trefis Integration Setup Guide

## Overview
The Watchtower platform integrates authentic Trefis financial analysis data through reverse-engineered JSON endpoints. This requires manual discovery of real API endpoints since Trefis doesn't provide public documentation.

## Current Status
- ✅ Service architecture implemented in `server/trefis-service.ts`
- ✅ Frontend components ready in `client/src/components/trefis/`
- ✅ API routes configured in `server/routes.ts`
- ❌ **Real JSON endpoints not yet discovered** (requires manual network inspection)

## Setup Instructions

### Step 1: Network Inspection
1. Open browser DevTools (F12)
2. Navigate to https://www.trefis.com/data/topic/actionable-analyses
3. Open Network tab, filter for XHR/Fetch requests
4. Reload the page and look for JSON requests that return analysis data
5. Repeat for https://www.trefis.com/data/topic/featured
6. Note the exact URLs, headers, and response formats

### Step 2: Update Service Configuration
Edit `server/trefis-service.ts` and update the `REAL_ENDPOINTS` object:

```typescript
const REAL_ENDPOINTS = {
  actionable: `https://www.trefis.com/api/DISCOVERED_PATH/actionable?sector=${sector}`,
  featured: `https://www.trefis.com/api/DISCOVERED_PATH/featured?sector=${sector}`
};
```

### Step 3: Add Required Headers
Update the `headers` object with any authentication or session headers discovered:

```typescript
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Authorization': 'Bearer DISCOVERED_TOKEN',  // Add if required
  'Cookie': 'session=DISCOVERED_SESSION',      // Add if required
  'X-Trefis-Token': 'DISCOVERED_API_KEY',     // Add if required
};
```

### Step 4: Update Response Parsing
If the JSON response format differs from expected, update `parseAnalysesFromJson()` function to handle the actual response structure.

### Step 5: Test Integration
1. Restart the application: `npm run dev`
2. Navigate to any sector page (Defense, Health, Energy)
3. Check the Trefis analyses sections
4. Verify error messages provide clear feedback

## Current Implementation Features

### Caching
- 24-hour cache for each sector's data
- Cache files stored in `/data/trefis-{sector}.cache.json`
- Automatic cache invalidation

### Error Handling
- Clear error messages for setup requirements
- Detailed logging for debugging
- Graceful degradation when endpoints fail

### Frontend Components
- **TrefisAnalyses**: Displays actionable and featured analyses for each sector
- **TrefisOverview**: Homepage component showing best/worst performers across all sectors
- Professional UI with loading states and error handling

### API Routes
- `GET /api/trefis?sector={sector}&type=actionable`
- `GET /api/trefis?sector={sector}&type=featured`
- `GET /api/trefis?sector={sector}&type=bestWorst`

## Expected Data Format

The service expects JSON responses in this format:

```json
[
  {
    "title": "Company Analysis Title",
    "url": "/data/companies/SYMBOL/analysis-path",
    "value": 85.5  // Performance score for best/worst calculation
  }
]
```

## Testing Without Real Endpoints

Currently, the system will show informative error messages with setup instructions when real endpoints are not configured. This maintains the strict no-fallback policy while providing clear guidance for next steps.

## Troubleshooting

### Common Issues
1. **CORS errors**: May need to handle cross-origin requests
2. **Authentication required**: Add discovered session/token headers
3. **Rate limiting**: Implement appropriate delays between requests
4. **Response format**: Update parsing logic for actual response structure

### Debug Information
Check server logs for detailed endpoint testing information:
- Endpoint URLs being tested
- Response status codes  
- Authentication headers
- Response parsing results

## Next Steps
1. Perform network inspection on Trefis topic pages
2. Discover working JSON API endpoints
3. Update service configuration with real endpoints
4. Test authentication requirements
5. Verify data parsing and display