# Activity Streak Feature - Quick Start Guide

## 🔥 What is the Activity Streak Feature?

The Activity Streak feature encourages users to analyze GitHub profiles consistently by tracking consecutive days of activity, similar to LeetCode's streak system. Every day you analyze a profile, your streak increases!

## 🎯 Key Benefits

- **Motivation**: Gamified daily engagement
- **Competition**: Leaderboard to compete with others
- **Progress Tracking**: See your consistency over time
- **Visual Feedback**: Fire emoji indicators 🔥
- **Levels**: Progress from Beginner to Legend

## 📱 User Experience

### For Users Analyzing Profiles

1. **Analyze a GitHub Profile**
   - Visit the GitHub Insights page
   - Enter any GitHub username
   - Click "Analyze Profile"

2. **Streak Updates Automatically**
   - First analysis of the day: Streak increments ✅
   - Already analyzed today: No change, but total count increases
   - Missed a day: Streak resets to 1 ⚠️

3. **Visual Indicators**
   - **Main Card**: Full streak details in Overview tab
   - **Small Badge**: Next to username (🔥 + number)
   - **Leaderboard**: See your ranking among all users

### Streak Levels

| Streak Days | Level | Emoji |
|------------|-------|-------|
| 0 | New | 🔥 |
| 1-6 | Beginner | 🔥 |
| 7-29 | Consistent | 🔥🔥 |
| 30-99 | Dedicated | 🔥🔥🔥 |
| 100-364 | Master | 🔥🔥🔥🔥 |
| 365+ | Legend | 🔥🔥🔥🔥 |

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+ installed
- MongoDB running
- Environment variables configured

### Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies (if not already installed)
npm install

# Ensure MongoDB is running
# The streak model will be created automatically on first use

# Start the server
npm run dev
```

The server should start on `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```

The client should start on `http://localhost:5173`

## 🧪 Testing the Feature

### Test Scenario 1: First Time User

1. Open browser to `http://localhost:5173`
2. Navigate to GitHub Insights
3. Analyze any profile (e.g., "octocat")
4. Check the Overview tab - you should see:
   - Activity Streak card showing "1 day streak"
   - 🔥 indicator next to profile name
5. Open browser console and run:
   ```javascript
   console.log(JSON.parse(localStorage.getItem('activityStreak')));
   ```
   You should see your streak data

### Test Scenario 2: Same Day Multiple Analyses

1. Analyze another profile (e.g., "torvalds")
2. Streak should remain at 1
3. Total analyses should increment

### Test Scenario 3: Next Day Continuation

To test this without waiting:
```javascript
// Open browser console
// Modify last activity date to yesterday
const streak = JSON.parse(localStorage.getItem('activityStreak'));
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
streak.lastActivityDate = yesterday.toISOString();
localStorage.setItem('activityStreak', JSON.stringify(streak));

// Now analyze a profile - streak should increment to 2
```

### Test Scenario 4: Streak Break

```javascript
// Set last activity to 3 days ago
const streak = JSON.parse(localStorage.getItem('activityStreak'));
const threeDaysAgo = new Date();
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
streak.lastActivityDate = threeDaysAgo.toISOString();
localStorage.setItem('activityStreak', JSON.stringify(streak));

// Analyze a profile - streak should reset to 1
```

### Test Scenario 5: Leaderboard

1. Create multiple test entries:
```bash
# In terminal
curl -X POST http://localhost:8000/api/v1/streak/record \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user1",
    "username": "user1",
    "analyzedProfile": "octocat"
  }'

# Repeat with different usernames to populate leaderboard
```

2. Visit Leaderboard page
3. Scroll to "Streak Leaderboard" section
4. See rankings

## 🎨 Component Examples

### ActivityStreakBadge (Full Card)

```jsx
import { ActivityStreakBadge } from "@/components/ActivityStreak";

// In your component
<ActivityStreakBadge 
  username="guest_octocat" 
/>
```

Displays:
- Current streak with fire emoji
- Longest streak record
- Total analyses
- Activity status message
- Progress bar to next milestone

### StreakIndicator (Small Badge)

```jsx
import { StreakIndicator } from "@/components/ActivityStreak";

// In your component
<StreakIndicator 
  username="guest_octocat" 
/>
```

Displays:
- Small 🔥 icon
- Streak number
- Animated pulse when active

### StreakLeaderboard

```jsx
import { StreakLeaderboard } from "@/components/StreakLeaderboard";

// In your component
<StreakLeaderboard limit={20} />
```

Displays:
- Tabs for Current/Longest streaks
- Top 3 with medals
- User rankings
- Activity status

## 📊 API Endpoints

### Record Activity
```http
POST /api/v1/streak/record
Content-Type: application/json

{
  "userId": "user123",
  "username": "user123",
  "analyzedProfile": "octocat"
}
```

### Get Streak Status
```http
GET /api/v1/streak/status?username=user123
```

### Get Leaderboard
```http
GET /api/v1/streak/leaderboard?type=current&limit=20
```

### Get Activity History
```http
GET /api/v1/streak/history?username=user123&limit=30
```

### Get Statistics
```http
GET /api/v1/streak/stats?username=user123
```

## 🐛 Common Issues & Solutions

### Issue: Streak not showing
**Solution**: Check browser console for errors. Verify localStorage permissions.

### Issue: Streak not incrementing
**Solution**: Ensure you haven't already analyzed a profile today. Check `lastActivityDate` in localStorage.

### Issue: Leaderboard empty
**Solution**: Create some test data using the API endpoints or analyze profiles multiple times.

### Issue: Component not rendering
**Solution**: Verify all imports are correct and components are properly exported.

## 💡 Tips for Testing

1. **Use Browser DevTools**
   - Check Network tab for API calls
   - Check Console for any errors
   - Use Application tab to view localStorage

2. **Test Different Users**
   - Use incognito mode for different user sessions
   - Clear localStorage to start fresh

3. **Mock Different Dates**
   - Modify localStorage dates for testing
   - Test edge cases (midnight boundary, etc.)

4. **Database Inspection**
   ```bash
   # Connect to MongoDB
   mongosh
   
   # Switch to database
   use your_database_name
   
   # View streak records
   db.activitystreaks.find().pretty()
   
   # Count total streaks
   db.activitystreaks.count()
   ```

## 🚀 Deployment Checklist

- [ ] Database indexes created
- [ ] Environment variables set
- [ ] CORS origins configured
- [ ] API rate limiting reviewed
- [ ] Error handling tested
- [ ] Mobile responsiveness checked
- [ ] Accessibility verified
- [ ] Performance tested with large datasets

## 📈 Monitoring

After deployment, monitor:
- API response times for streak endpoints
- Database query performance
- User engagement metrics
- Streak retention rates
- Leaderboard position changes

## 🎉 Success Metrics

Track these KPIs:
- **Daily Active Users**: Users with active streaks
- **Avg Streak Length**: Average days per user
- **Retention Rate**: Users maintaining 7+ day streaks
- **Analyses Per Day**: Total profile analyses
- **Leaderboard Engagement**: Views of leaderboard page

---

## Need Help?

- Check the full documentation: `STREAK_FEATURE.md`
- Review component source code
- Test using the scenarios above
- Use browser dev tools for debugging

**Happy Streaking! 🔥**
