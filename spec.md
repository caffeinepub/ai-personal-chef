# AI Personal Chef

## Current State
ChallengesPage has: stats (streak/points), daily challenge card, badges, and a leaderboard showing mock users ranked by points.

## Requested Changes (Diff)

### Add
- Photo upload section on the ChallengesPage: after marking daily challenge complete, user can upload a photo of the dish they cooked. Photo is stored in localStorage and displayed as a "cooking proof" gallery for streak maintenance.
- Streak history gallery showing thumbnails of past dish photos (indexed by date).

### Modify
- Daily challenge card: show upload photo button after completing the challenge. If a photo was uploaded today, show it.
- Streak display: show a small thumbnail of today's dish photo next to the streak counter if available.

### Remove
- Leaderboard section (the 🏅 Leaderboard panel with mock users) entirely.

## Implementation Plan
1. Remove the leaderboard state, mock data, and JSX from ChallengesPage.tsx.
2. Add state for dish photo (per date key, stored in localStorage as base64 data URL).
3. Add a hidden file input that triggers on button click; on change, read file as data URL, save to localStorage keyed by todayKey.
4. After completing challenge, show "Add Your Dish Photo" button/area.
5. If photo exists for today, render it in the daily challenge card.
6. Add a "My Cooking Journal" section below badges showing up to 7 days of past dish photos with their dates and dish names.
