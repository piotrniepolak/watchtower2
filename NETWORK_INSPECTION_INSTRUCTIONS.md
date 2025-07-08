# Network Inspection Instructions for Trefis API Discovery

## Step-by-Step Process

### 1. Open Browser DevTools
- Chrome/Edge: Press F12 or Cmd+Option+I
- Firefox: Press Ctrl+Shift+I or Cmd+Option+I

### 2. Navigate to Trefis Topic Pages
**For Actionable Analyses:**
```
https://www.trefis.com/data/topic/actionable-analyses
```

**For Featured Analyses:**
```
https://www.trefis.com/data/topic/featured
```

### 3. Configure Network Tab
1. Click on the **Network** tab in DevTools
2. Filter for **XHR** or **Fetch** requests only
3. Clear existing logs (trash icon)
4. Reload the page (F5 or Ctrl+R)

### 4. Identify JSON API Calls
Look for requests that:
- Return JSON data (not HTML)
- Have response payload containing analysis arrays
- Include analysis objects with properties like:
  ```json
  {
    "title": "Company Analysis Title",
    "url": "/data/companies/SYMBOL/analysis-path",
    "value": 85.5
  }
  ```

### 5. Extract Request Details
For each discovered endpoint, copy:

**URL:** Complete request URL including query parameters
```
https://www.trefis.com/api/discovered-path?param1=value1&param2=value2
```

**Headers:** Any special headers (right-click request → Copy → Copy request headers)
```
Authorization: Bearer abc123
X-Trefis-Token: xyz789
Cookie: session=cookie_value
```

### 6. Test in Console
Verify the endpoint works by testing in DevTools Console:
```javascript
fetch('PASTE_DISCOVERED_URL_HERE', {
  headers: {
    'Authorization': 'Bearer TOKEN_IF_NEEDED',
    'X-Trefis-Token': 'TOKEN_IF_NEEDED',
    'Cookie': 'COOKIE_IF_NEEDED'
  }
})
.then(r => r.json())
.then(console.log)
```

## What to Look For

### Actionable Analyses Endpoint
- Should return array of actionable investment analyses
- Look for requests when the actionable analyses load
- May include sector filtering or pagination

### Featured Analyses Endpoint  
- Should return array of featured company analyses
- Look for requests when featured content loads
- May have different URL structure than actionable

### Common Header Patterns
- `Authorization: Bearer [token]`
- `X-Trefis-Token: [api-key]`
- `X-API-Key: [api-key]`
- `Cookie: [session-data]`
- `X-Requested-With: XMLHttpRequest`

## Expected Response Format
```json
[
  {
    "title": "Apple: iPhone 15 Impact Analysis",
    "url": "/data/companies/AAPL/no-login-required/iphone-15-analysis",
    "value": 92.3,
    "sector": "technology"
  },
  {
    "title": "Microsoft: Azure Growth Strategy",
    "url": "/data/companies/MSFT/no-login-required/azure-strategy",
    "value": 88.7,
    "sector": "technology"
  }
]
```

## Share Results
Once you've discovered the endpoints, share:

1. **Actionable endpoint URL and headers**
2. **Featured endpoint URL and headers**  
3. **Sample response data structure**

Example format:
```
Actionable endpoint:
https://www.trefis.com/api/topic/actionable?sector=all&limit=50

Required headers:
{
  "X-Trefis-Token": "discovered_token_here",
  "Cookie": "session=discovered_session_here"
}

Featured endpoint:
https://www.trefis.com/api/topic/featured?sector=all&limit=50

Sample response:
[{"title": "...", "url": "...", "value": 85.2}]
```

## Ready for Integration
Once you provide the real endpoint details, I'll immediately:
1. Update server/trefis-service.ts with the real URLs and headers
2. Remove all placeholder code
3. Test the integration
4. Verify frontend display works correctly