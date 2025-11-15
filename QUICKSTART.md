# ⚡ Quick Start Guide

## Get Your Telegram Mini App Running in 5 Minutes!

### Step 1: Upload Files to GitHub

1. Go to https://github.com/Diviashk/mbp-tg
2. Upload/replace these files with the ones in this folder

### Step 2: Install Dependencies

```bash
cd mbp-tg
npm install
```

This will install:
- React 18
- TypeScript
- Tailwind CSS
- Telegram Web App SDK
- React Calendar
- Date-fns
- Lucide React (icons)

### Step 3: Create .env File

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=https://your-backend-url.com/api
```

For now, you can leave this - the app has mock data for testing!

### Step 4: Start Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

⚠️ **Note**: Some features (haptics, theme) only work in Telegram app!

### Step 5: Deploy to Vercel

Option A: Using Vercel CLI
```bash
npm install -g vercel
vercel
```

Option B: Using Vercel Website
1. Go to https://vercel.com
2. Import your GitHub repo
3. Click Deploy
4. Copy your deployment URL (e.g., `https://mbp-tg.vercel.app`)

### Step 6: Connect to Your Telegram Bot

1. Open Telegram, search for `@BotFather`
2. Send: `/myapps`
3. Select your bot → Edit Mini App
4. Update URL to your Vercel URL
5. Done! 🎉

Test it: Open your bot in Telegram and tap the menu button!

---

## File Structure Overview

```
mbp-tg/
├── src/
│   ├── components/        # React components
│   │   ├── HomeScreen.tsx          # Main page
│   │   ├── ReportAbsence.tsx       # Report absence flow
│   │   ├── UpdatePreference.tsx    # Update preferences flow
│   │   └── ui/                     # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API integration
│   └── types/            # TypeScript definitions
├── package.json          # Dependencies
├── tailwind.config.js    # Styling config
└── vite.config.ts        # Build config
```

---

## What Each File Does

**Core Files:**
- `src/App.tsx` - Main app with routing & state
- `src/main.tsx` - Entry point
- `index.html` - HTML template with Telegram script

**Components:**
- `HomeScreen.tsx` - Landing page with action buttons
- `ReportAbsence.tsx` - Calendar-based absence reporting
- `UpdatePreference.tsx` - Shift preference selection

**UI Components:**
- `TouchButton.tsx` - Large tap-friendly buttons (72px height)
- `CalendarPicker.tsx` - Mobile-optimized date picker
- `ReasonChip.tsx` - Selectable reason chips
- `ShiftToggle.tsx` - Day selection grid

**Utilities:**
- `hooks/useTelegram.ts` - Telegram WebApp integration
- `services/api.ts` - Backend API calls
- `types/index.ts` - TypeScript type definitions

---

## Testing Locally with Telegram

### Option 1: Using ngrok (Recommended)

1. Install ngrok: https://ngrok.com/download

2. Start your dev server:
   ```bash
   npm run dev
   ```

3. In another terminal:
   ```bash
   ngrok http 5173
   ```

4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

5. Update your Mini App URL in BotFather

6. Test in Telegram mobile app!

### Option 2: Deploy First, Then Test

Just deploy to Vercel and test with the production URL.

---

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for TypeScript errors
npm run lint
```

---

## Key Features Implemented

✅ **Home Screen** with action buttons
✅ **Report Absence** with calendar (single day or range)
✅ **Update Preferences** with shift toggles
✅ **Telegram Theme Integration** (auto dark/light mode)
✅ **Haptic Feedback** on interactions
✅ **Back Button** integration
✅ **Main Button** for form submission
✅ **Loading States** during API calls
✅ **Error Handling** with user-friendly messages
✅ **Mobile-Optimized** with large touch targets
✅ **Mock Data** for testing without backend

---

## Next Steps

1. **Test the UI** - Make sure everything looks good
2. **Connect Backend** - Update VITE_API_URL in .env
3. **Customize** - Adjust colors, text, shift types as needed
4. **Deploy** - Push to production
5. **Share** - Let your team start using it!

---

## Need Help?

1. Check `README.md` for detailed docs
2. Check `TELEGRAM_SETUP.md` for bot setup
3. Look at browser console for errors
4. Test with mock data first (no backend needed)

---

## Pro Tips 💡

- The app works without a backend (uses mock data)
- Test in actual Telegram app, not just browser
- Use ngrok for local testing with real Telegram
- HTTPS is required for Telegram Mini Apps
- Haptic feedback only works in Telegram app
- Theme colors auto-adapt to user's Telegram theme

---

**Ready to go? Start with Step 1! 🚀**
