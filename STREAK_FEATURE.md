# Activity Streak Feature - Implementation Documentation

## Overview
The Activity Streak feature tracks consecutive days of profile analysis activity, similar to LeetCode's fire indicator. Users earn and maintain streaks by analyzing GitHub profiles daily, encouraging consistent engagement with the platform.

## Features Implemented

### Backend

#### 1. **Database Model** (`server/src/models/activityStreak.model.js`)
- Tracks user activity streaks with MongoDB schema
- Fields:
  - `userId`: Reference to user (supports guest users)
  - `username`: Username identifier
  - `currentStreak`: Current consecutive days
  - `longestStreak`: Personal best record
  - `lastActivityDate`: Last analysis date
  - `activityDates`: Array of all activity dates
  - `totalAnalyses`: Total profile analyses performed
  - `analyzedProfiles`: History of analyzed GitHub profiles

#### 2. **Controller** (`server/src/controllers/activityStreak.controller.js`)
Endpoints implemented:
- `POST /api/v1/streak/record` - Record new activity and update streak
- `GET /api/v1/streak/status` - Get current streak status
- `GET /api/v1/streak/history` - Get user's activity history
- `GET /api/v1/streak/leaderboard` - Get top users by streak
- `GET /api/v1/streak/stats` - Get detailed streak statistics
- `POST /api/v1/streak/reset` - Reset streak (admin/testing)

#### 3. **Routes** (`server/src/routes/activityStreak.routes.js`)
- Public routes for viewing streaks
- Protected routes for recording activity
- Integrated with authentication middleware

#### 4. **Automatic Tracking**
- Integrated into `getUserInsights` in `github.controller.js`
- Automatically records activity when profiles are analyzed
- Works for both authenticated and guest users

### Frontend

#### 1. **Library** (`client/src/lib/activityStreak.js`)
Utility functions:
- `recordActivity()` - Record activity on server
- `getStreakStatus()` - Fetch streak status
- `getActivityHistory()` - Get activity history
- `getStreakLeaderboard()` - Fetch leaderboard
- `getStreakStats()` - Get detailed statistics
- `updateLocalStreak()` - Update localStorage for guests
- `getStreakEmoji()` - Get emoji based on streak count
- `getStreakLevel()` - Get level badge (Beginner/Consistent/Dedicated/Master/Legend)

#### 2. **Components**

##### `ActivityStreakBadge` (`client/src/components/ActivityStreak.jsx`)
Full streak card showing:
- Current streak with fire emoji
- Longest streak record
- Total analyses count
- Activity status (today/active/inactive)
- Progress to next milestone (7/30/100/365 days)
- Last activity date
- Compact mode available

##### `StreakIndicator` (`client/src/components/ActivityStreak.jsx`)
Small inline badge showing:
- Fire icon with streak count
- Animated pulse effect when active
- Minimal space footprint

##### `StreakLeaderboard` (`client/src/components/StreakLeaderboard.jsx`)
Leaderboard display featuring:
- Two tabs: Current Streaks & Longest Streaks
- Top 3 with medal icons (🥇🥈🥉)
- User info with activity status
- Total analyses and last activity date
- Active/inactive indicators

#### 3. **Integration Points**

1. **GitHubInsights Page**
   - Full `ActivityStreakBadge` displayed in overview tab
   - `StreakIndicator` in profile summary next to username
   - Automatic streak update on profile analysis

2. **Leaderboard Page**
   - `StreakLeaderboard` section below profile score leaderboard
   - Shows top 20 users by default

3. **Extension App**
   - `StreakIndicator` next to username in stats display
   - LocalStorage-based streak tracking for extension users
   - Automatic update on profile analysis

## How It Works

### Streak Logic
1. **Daily Activity**: Analyzing any GitHub profile counts as daily activity
2. **Streak Maintenance**: Must analyze at least one profile each day to maintain streak
3. **Grace Period**: None - missing a day breaks the streak
4. **Reset**: Streak resets to 1 on next activity after breaking

### Streak Calculation
```javascript
// If last activity was yesterday → increment streak
// If last activity was today → no change
// If last activity was 2+ days ago → reset to 1
```

### Levels & Milestones
- **New** (0 days): 🔥
- **Beginner** (1-6 days): 🔥
- **Consistent** (7-29 days): 🔥🔥
- **Dedicated** (30-99 days): 🔥🔥🔥
- **Master** (100-364 days): 🔥🔥🔥🔥
- **Legend** (365+ days): 🔥🔥🔥🔥

### Storage Strategy
- **Authenticated Users**: MongoDB via API
- **Guest Users**: LocalStorage + API (guest_username prefix)
- **Extension Users**: LocalStorage only (sync on full site visit)

## Testing

### Backend Testing

1. **Install Dependencies**
```bash
cd server
npm install
```

2. **Start Server**
```bash
npm run dev
```

3. **Test Endpoints**

```bash
# Record activity
curl -X POST http://localhost:8000/api/v1/streak/record \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "username": "test_user_123",
    "analyzedProfile": "octocat"
  }'

# Get streak status
curl http://localhost:8000/api/v1/streak/status?username=test_user_123

# Get leaderboard
curl http://localhost:8000/api/v1/streak/leaderboard?type=current&limit=10

# Get activity history
curl http://localhost:8000/api/v1/streak/history?username=test_user_123&limit=30

# Get statistics
curl http://localhost:8000/api/v1/streak/stats?username=test_user_123
```

### Frontend Testing

1. **Install Dependencies**
```bash
cd client
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

3. **Test Flow**
   1. Navigate to GitHubInsights page
   2. Analyze any GitHub profile
   3. Check for streak update in:
      - Overview tab (full card)
      - Profile summary (small indicator)
   4. Visit Leaderboard page to see streak leaderboard
   5. Analyze multiple profiles to increase streak

4. **Test LocalStorage**
```javascript
// Open browser console
// Check local streak
const streak = JSON.parse(localStorage.getItem('activityStreak'));
console.log(streak);

// Clear streak for testing
localStorage.removeItem('activityStreak');
```

### Edge Cases to Test

1. **Same Day Multiple Analyses**
   - Should not increment streak
   - Should increment totalAnalyses

2. **Consecutive Days**
   - Analyze profile today and tomorrow
   - Streak should increment from 1 to 2

3. **Missed Day**
   - Analyze today, skip tomorrow, analyze day after
   - Streak should reset to 1

4. **Midnight Boundary**
   - Test analysis just before and after midnight
   - Should be treated as different days

5. **Guest vs Authenticated**
   - Both should track separately
   - Guest uses localStorage, auth uses API

## Database Indexes

Ensure these indexes exist for optimal performance:
```javascript
// Compound index
{ userId: 1, username: 1 }

// For sorting leaderboard
{ currentStreak: -1, updatedAt: -1 }
{ longestStreak: -1, updatedAt: -1 }

// For filtering
{ lastActivityDate: -1 }
```

## API Response Formats

### Streak Status
```json
{
  "statusCode": 200,
  "message": "Streak status retrieved successfully",
  "data": {
    "currentStreak": 5,
    "longestStreak": 10,
    "totalAnalyses": 50,
    "lastActivityDate": "2025-10-30T00:00:00.000Z",
    "hasActivityToday": true,
    "isActive": true,
    "daysUntilReset": 1
  }
}
```

### Record Activity
```json
{
  "statusCode": 200,
  "message": "Activity recorded successfully",
  "data": {
    "currentStreak": 6,
    "longestStreak": 10,
    "totalAnalyses": 51,
    "hasActivityToday": true,
    "isActive": true,
    "updateResult": {
      "streakChanged": true,
      "newStreak": 6,
      "isNewRecord": false
    }
  }
}
```

### Leaderboard
```json
{
  "statusCode": 200,
  "message": "Streak leaderboard retrieved successfully",
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "username": "john_doe",
        "currentStreak": 100,
        "longestStreak": 150,
        "totalAnalyses": 500,
        "lastActivityDate": "2025-10-30T00:00:00.000Z",
        "isActive": true
      }
    ],
    "type": "current"
  }
}
```

## Performance Considerations

1. **Caching**: Consider caching leaderboard for 5-10 minutes
2. **Batch Updates**: Group multiple analyses in short time spans
3. **Indexes**: Ensure proper database indexes are created
4. **Rate Limiting**: Already handled by express-rate-limit middleware

## Future Enhancements

1. **Weekly/Monthly Streaks**: Track different time periods
2. **Streak Freezes**: Allow users to "freeze" streak (1-2 per month)
3. **Achievements**: Unlock badges at milestones (7, 30, 100 days)
4. **Social Sharing**: Share streak achievements on Twitter/LinkedIn
5. **Notifications**: Remind users to maintain their streak
6. **Streak Recovery**: One-time recovery within 24 hours
7. **Team Streaks**: Collaborative streak tracking
8. **Analytics**: Detailed charts of activity patterns

## Troubleshooting

### Streak Not Updating
1. Check browser console for errors
2. Verify API endpoint is reachable
3. Check localStorage permissions
4. Ensure date/time is correct

### Leaderboard Empty
1. Verify database connection
2. Check if any streaks exist in database
3. Review API logs for errors

### Extension Issues
1. Clear extension storage
2. Reload extension
3. Check extension console for errors

## Files Modified/Created

### Backend
- ✅ Created: `server/src/models/activityStreak.model.js`
- ✅ Created: `server/src/controllers/activityStreak.controller.js`
- ✅ Created: `server/src/routes/activityStreak.routes.js`
- ✅ Modified: `server/src/app.js` (added streak routes)
- ✅ Modified: `server/src/controllers/github.controller.js` (added automatic tracking)

### Frontend
- ✅ Created: `client/src/lib/activityStreak.js`
- ✅ Created: `client/src/components/ActivityStreak.jsx`
- ✅ Created: `client/src/components/StreakLeaderboard.jsx`
- ✅ Modified: `client/src/pages/GitHubInsights.jsx` (integrated streak display)
- ✅ Modified: `client/src/pages/Leaderboard.jsx` (added streak leaderboard)
- ✅ Modified: `client/src/ExtensionApp.jsx` (added streak indicator)

## Summary

This implementation provides a complete, production-ready activity streak feature that:
- ✅ Tracks consecutive days of profile analysis
- ✅ Works for both authenticated and guest users
- ✅ Displays prominently with fire emoji indicators
- ✅ Includes competitive leaderboard
- ✅ Handles all edge cases (same day, missed days, etc.)
- ✅ Integrates seamlessly with existing features
- ✅ Provides both detailed and compact views
- ✅ Supports both web app and browser extension
- ✅ Uses efficient database queries with proper indexing
- ✅ Includes comprehensive API endpoints

The feature is ready for testing and deployment! 🔥
