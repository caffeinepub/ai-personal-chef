# AI Personal Chef

## Current State
- 64 recipes in `src/frontend/src/data/recipes.ts` with cuisine tags like "Tamil Nadu", "South Indian", "Indian", "Italian", etc.
- "South Indian" and "Indian" cuisines are not mapped to specific states/regions
- No dedicated regional browsing page exists
- Navigation has: Home, Planner, Challenges, Budget, Nutrition, Saved, Profile
- App uses TanStack Router with routes defined in `App.tsx`

## Requested Changes (Diff)

### Add
- New page `RegionalPage.tsx` at route `/regional` showing recipes grouped by: Kerala, Tamil Nadu, Karnataka, Telangana
- New recipes for underrepresented regions (Kerala: 6+, Karnataka: 4+, Telangana: 4+)
- Navigation link "Regions" in desktop header and mobile bottom nav
- Route registration in `App.tsx`

### Modify
- `data/recipes.ts`: Reassign existing recipes to specific regional cuisine tags:
  - Aviyal → "Kerala"
  - Appam with Vegetable Stew → "Kerala"
  - Idli with Sambar, Masala Dosa, Plain Dosa, Medu Vada → "Tamil Nadu" (already South Indian, assign specifically)
  - Ven Pongal, Rasam, Upma, Meen Kuzhambu → "Tamil Nadu"
  - Generic "South Indian" tags → assign to Tamil Nadu or Kerala as appropriate
  - Add new recipes with cuisine: "Karnataka" and cuisine: "Telangana"
- `App.tsx`: Add regionalRoute and link in both desktop nav and mobile bottom nav (replace one existing less-used link, or add as 6th desktop nav item)

### Remove
- Nothing removed

## Implementation Plan
1. Update `data/recipes.ts`:
   - Reassign "South Indian" cuisine to specific states (Aviyal, Appam → Kerala; Dosa/Idli/Vada/Pongal/Rasam/Upma → Tamil Nadu)
   - Add 6 Kerala recipes (e.g., Kerala Fish Curry, Puttu & Kadala Curry, Kerala Beef Fry, Olan, Erissery, Thoran)
   - Add 4 Karnataka recipes (e.g., Bisi Bele Bath, Akki Roti, Mysore Masala Dosa, Chitranna)
   - Add 4 Telangana recipes (e.g., Hyderabadi Biryani, Pesarattu, Gongura Mutton, Mirchi Ka Salan)
2. Create `src/frontend/src/pages/RegionalPage.tsx`:
   - Four region tabs/sections: Kerala, Tamil Nadu, Karnataka, Telangana
   - Each section has a banner with region name and recipe count
   - Recipe cards listed under each region (name, veg/non-veg badge, cook time, description snippet)
   - Clicking a recipe navigates to `/recipe/$id`
   - Sticky region tab bar at the top for quick navigation
3. Update `App.tsx`:
   - Import RegionalPage, add `regionalRoute` at path `/regional`
   - Add "Regions" nav link in desktop header
   - Mobile bottom nav: replace one tab or add below (use Map icon)
