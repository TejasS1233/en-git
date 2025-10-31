# 🔥 Activity Streak Feature

## New Feature Added: Consecutive Days Streak Tracking!

Track your consistency in analyzing GitHub profiles with our new **Activity Streak** feature - just like LeetCode's fire indicator! 

### What's New?

- **🔥 Fire Streak Indicators**: Visual streak counter with animated fire emoji
- **📊 Streak Leaderboard**: Compete with others for the longest streak
- **🏆 Achievement Levels**: Progress from Beginner to Legend
- **📈 Progress Tracking**: See your daily consistency and milestones
- **⚡ Real-time Updates**: Instant feedback when you analyze profiles

---

## Features Overview

### 1. Activity Streak Badge
A beautiful card showing:
- Current consecutive days streak
- Personal best (longest streak)
- Total profile analyses count
- Activity status and reminders
- Progress to next milestone

**Displayed on:** GitHub Insights Overview tab

### 2. Streak Indicator
Small inline badge showing:
- Fire emoji with streak count
- Pulse animation when active
- Minimal, non-intrusive design

**Displayed on:** 
- Profile summary (next to username)
- Browser extension popup
- Leaderboard entries

### 3. Streak Leaderboard
Competitive rankings featuring:
- Current streaks leaderboard
- All-time longest streaks
- Top 3 with medals (🥇🥈🥉)
- User activity status
- Total analyses count

**Displayed on:** Global Leaderboard page

---

## How It Works

### Streak Rules

1. **Daily Activity**: Analyze any GitHub profile to count for the day
2. **Consecutive Days**: Must analyze at least once per day to maintain streak
3. **Streak Break**: Missing a day resets your streak to 0
4. **Multiple Analyses**: Analyzing multiple profiles in one day counts as one activity
5. **Midnight Reset**: New day starts at 00:00:00 local time

### Streak Levels

| Days | Level | Badge |
|------|-------|-------|
| 0 | New | 🔥 |
| 1-6 | Beginner | 🔥 |
| 7-29 | Consistent | 🔥🔥 |
| 30-99 | Dedicated | 🔥🔥🔥 |
| 100-364 | Master | 🔥🔥🔥🔥 |
| 365+ | Legend | 🔥🔥🔥🔥 |

### Milestones

Reach these milestones to level up:
- **Week Warrior**: 7 days
- **Month Master**: 30 days
- **Century Club**: 100 days
- **Year Legend**: 365 days

---

## Usage

### Web Application

1. Visit the GitHub Insights page
2. Analyze any GitHub profile
3. Check your streak badge in the Overview tab
4. See your ranking on the Leaderboard page

### Browser Extension

1. Click the extension icon
2. Enter a GitHub username
3. Click "Analyze"
4. See your streak indicator next to the username

### Guest Users

Don't have an account? No problem!
- Your streak is tracked locally in your browser
- Data persists across sessions
- Upgrade to a full account anytime to sync across devices

---

## API Endpoints

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

---

## Technical Implementation

### Backend
- **Model**: `server/src/models/activityStreak.model.js`
- **Controller**: `server/src/controllers/activityStreak.controller.js`
- **Routes**: `server/src/routes/activityStreak.routes.js`
- **Database**: MongoDB with optimized indexes

### Frontend
- **Library**: `client/src/lib/activityStreak.js`
- **Components**: 
  - `client/src/components/ActivityStreak.jsx`
  - `client/src/components/StreakLeaderboard.jsx`
- **Integration**: GitHubInsights, Leaderboard, Extension

### Key Technologies
- React for UI components
- MongoDB for data persistence
- LocalStorage for guest users
- REST API for client-server communication

---

## Documentation

- 📘 **Full Documentation**: [STREAK_FEATURE.md](STREAK_FEATURE.md)
- 🚀 **Quick Start Guide**: [STREAK_QUICKSTART.md](STREAK_QUICKSTART.md)
- 🏗️ **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- ✅ **Testing Guide**: [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)
- 📝 **Summary**: [SUMMARY.md](SUMMARY.md)

---

## Benefits

### For Users
- **Motivation**: Gamified daily engagement
- **Consistency**: Build a habit of analyzing profiles
- **Competition**: See how you rank against others
- **Achievement**: Unlock levels and milestones
- **Tracking**: Monitor your progress over time

### For the Platform
- **Engagement**: Increased daily active users
- **Retention**: Users return daily to maintain streaks
- **Virality**: Users share achievements on social media
- **Analytics**: Better understanding of user behavior
- **Community**: Competitive element builds community

---

## Examples

### Example 1: First Time User
```
Day 1: Analyze "octocat" 
       → Streak: 🔥 1
Day 2: Analyze "torvalds"
       → Streak: 🔥🔥 2
Day 3: Analyze "gvanrossum"
       → Streak: 🔥🔥🔥 3
```

### Example 2: Streak Break
```
Day 1: Analyze profile → Streak: 5
Day 2: Analyze profile → Streak: 6
Day 3: MISSED!
Day 4: Analyze profile → Streak: 1 (Reset)
```

### Example 3: Multiple Analyses
```
Day 1: 
  - Analyze "octocat" → Streak: 1
  - Analyze "torvalds" → Streak: 1 (no change)
  - Analyze "tj" → Streak: 1 (no change)
  Total Analyses: 3
```

---

## Screenshots

### Streak Badge (Full Card)
```
┌────────────────────────────────────┐
│  🔥 Analysis Streak                │
│  Keep analyzing profiles daily!    │
├────────────────────────────────────┤
│                                    │
│  Current Streak:    25 days   🔥🔥🔥│
│  Level: Consistent                 │
│                                    │
│  Best Streak:       100 days       │
│  Total Analyses:    500            │
│                                    │
│  ⚡ Next milestone: 30 days        │
│  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░] 83%       │
│                                    │
│  ✓ Activity recorded today!        │
└────────────────────────────────────┘
```

### Streak Indicator (Inline)
```
John Doe  🔥 25  @johndoe
```

### Leaderboard Entry
```
🥇  @alice      🔥 100 days  (Active)
    500 analyses • Last: Today

🥈  @bob        🔥 95 days   (Active)
    450 analyses • Last: Today

🥉  @charlie    🔥 80 days   (Inactive)
    380 analyses • Last: 2 days ago
```

---

## Best Practices

### For Users

1. **Analyze Daily**: Make it a habit to analyze at least one profile per day
2. **Set Reminders**: Use notifications to remind yourself
3. **Check Leaderboard**: Stay motivated by seeing your rank
4. **Share Progress**: Share your milestones on social media
5. **Learn & Grow**: Use insights from profiles you analyze

### For Developers

1. **Monitor Performance**: Track API response times
2. **Check Indexes**: Ensure database queries are optimized
3. **Handle Errors**: Gracefully handle network failures
4. **Cache Data**: Use localStorage for guest users
5. **Test Edge Cases**: Test midnight boundaries, streak breaks

---

## Troubleshooting

### Streak Not Updating
- Check browser console for errors
- Verify localStorage is enabled
- Clear cache and reload page
- Check network tab for API calls

### Wrong Streak Count
- Check system date/time settings
- Clear localStorage and start fresh
- Verify timezone is correct
- Contact support if persists

### Leaderboard Not Showing
- Check internet connection
- Verify API endpoints are accessible
- Check MongoDB connection
- Review server logs for errors

---

## Future Enhancements

Potential features for future releases:

- 🔔 **Notifications**: Remind users to maintain streak
- ❄️ **Streak Freeze**: One-time freeze option per month
- 🏅 **Badges**: Unlock special badges at milestones
- 📱 **Mobile App**: Native mobile app with push notifications
- 👥 **Team Streaks**: Collaborative streak tracking
- 📊 **Analytics**: Detailed charts and insights
- 🎁 **Rewards**: Exclusive features for high streaks
- 🔗 **Social Sharing**: Share achievements on Twitter/LinkedIn

---

## Contributing

We welcome contributions! If you'd like to improve the streak feature:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## Support

Need help?

- 📖 **Documentation**: Check the docs folder
- 💬 **Discord**: Join our community server
- 🐛 **Issues**: Report bugs on GitHub
- 📧 **Email**: support@engit.com

---

## License

This feature is part of the en-git project and is licensed under the MIT License.

---

## Acknowledgments

Inspired by:
- LeetCode's daily streak system
- Duolingo's learning streaks
- GitHub's contribution graph

Built with ❤️ by the en-git team

---

**Start your streak today! 🔥**

[Get Started](https://en-git.vercel.app) | [View Demo](https://en-git.vercel.app/insights) | [Documentation](./STREAK_FEATURE.md)
