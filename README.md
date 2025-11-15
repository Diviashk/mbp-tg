# 🚀 Shift Spark - Telegram Mini App

A mobile-first Telegram Mini App for employees to manage their shift schedules, report absences, and update shift preferences.

## ✨ Features

- 📅 **Report Absence**: Select single dates or date ranges with an intuitive calendar
- ⭐ **Update Preferences**: Choose preferred shifts (Morning/Evening/Night) by day
- 🎨 **Telegram Native UI**: Automatically adapts to user's Telegram theme (light/dark)
- 📱 **Mobile-Optimized**: Large touch targets, haptic feedback, and smooth animations
- 🔒 **Secure**: Integrates with Telegram authentication

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Calendar**: react-calendar
- **Telegram**: @twa-dev/sdk
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- A Telegram Bot (created via [@BotFather](https://t.me/botfather))
- FastAPI backend (or any REST API that matches the interface)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Diviashk/mbp-tg.git
cd mbp-tg
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and set your backend URL:

```env
VITE_API_URL=https://your-fastapi-backend.com/api
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` folder.

## 📱 Telegram Bot Setup

### Step 1: Create a Bot with BotFather

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` and follow the prompts
3. Save your bot token (you'll need this for your backend)

### Step 2: Create a Mini App

1. Send `/newapp` to BotFather
2. Select your bot
3. Provide:
   - **Title**: Shift Spark
   - **Short name**: shiftspark (must be unique)
   - **Description**: Manage your shift schedule
   - **Photo**: Upload an icon (512x512 recommended)
   - **Web App URL**: Your deployed URL (e.g., `https://mbp-tg.vercel.app`)

### Step 3: Test Your Mini App

1. Open your bot in Telegram
2. Look for the menu button (≡) or keyboard button
3. Tap to launch the Mini App

## 🔌 Backend API Integration

Your FastAPI backend should implement these endpoints:

```typescript
// Get employee by Telegram user ID
GET /api/employees/telegram/{telegramUserId}

// Get upcoming shifts
GET /api/employees/{employeeId}/shifts/upcoming

// Submit absence
POST /api/absences
{
  "employeeId": "string",
  "startDate": "2025-11-20",
  "endDate": "2025-11-22",
  "reason": "sick",
  "customReason": "optional string"
}

// Update preferences
PUT /api/employees/{employeeId}/preferences
{
  "preferences": [
    {
      "employeeId": "string",
      "shiftType": "morning",
      "days": ["monday", "tuesday", "wednesday"]
    }
  ]
}

// Get preferences
GET /api/employees/{employeeId}/preferences
```

## 📁 Project Structure

```
mbp-tg/
├── src/
│   ├── components/
│   │   ├── HomeScreen.tsx           # Main landing page
│   │   ├── ReportAbsence.tsx        # Absence reporting
│   │   ├── UpdatePreference.tsx     # Shift preferences
│   │   └── ui/
│   │       ├── TouchButton.tsx      # Large touch button
│   │       ├── CalendarPicker.tsx   # Date selector
│   │       ├── ReasonChip.tsx       # Reason selector
│   │       └── ShiftToggle.tsx      # Day toggle grid
│   ├── hooks/
│   │   └── useTelegram.ts           # Telegram WebApp hook
│   ├── services/
│   │   └── api.ts                   # Backend API service
│   ├── types/
│   │   └── index.ts                 # TypeScript types
│   ├── App.tsx                      # Main app component
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Global styles
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## 🎨 UI Components

### TouchButton
Large, tap-friendly buttons with haptic feedback
- 72px minimum height
- Active scale animation
- Supports primary/secondary variants

### CalendarPicker
Mobile-optimized calendar with single date or range selection
- Large touch targets (52px per day)
- Visual feedback for selection
- Prevents dates in the past

### ReasonChip
Quick-select chips for absence reasons
- Icon + label
- Toggle selection
- Visual active state

### ShiftToggle
Grid of day toggles for shift preferences
- 4-column responsive grid
- Checkmark for selected days
- Select/Clear all functionality

## 🔧 Customization

### Theme Colors

The app automatically uses Telegram's theme. To customize defaults, edit the CSS variables in `src/index.css`:

```css
:root {
  --tg-theme-bg-color: #ffffff;
  --tg-theme-button-color: #2481cc;
  /* ... more variables */
}
```

### Shift Types

To modify shift types, edit `src/types/index.ts`:

```typescript
export type ShiftType = 'morning' | 'evening' | 'night';
```

And update the display info in `UpdatePreference.tsx`.

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Add environment variable: `VITE_API_URL`
4. Deploy

### Deploy to Netlify

1. Build the project: `npm run build`
2. Drag the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop)
3. Configure environment variables in site settings

### Update Bot with New URL

After deployment, update your Mini App URL in BotFather:
1. Send `/myapps` to BotFather
2. Select your app
3. Edit → Web App URL
4. Enter your new URL

## 🐛 Troubleshooting

### App shows "Loading..." forever
- Check browser console for errors
- Verify your backend API is accessible
- Ensure CORS is properly configured on your backend

### Calendar doesn't show
- Check that `react-calendar` CSS is imported
- Verify Tailwind is processing the styles

### Haptic feedback not working
- Haptics only work in Telegram app, not in browser
- Test on actual Telegram mobile app

### Theme colors not applying
- Ensure app is opened via Telegram (not direct browser)
- Check that Telegram Web App SDK is loaded (`window.Telegram.WebApp`)

## 📝 Development Notes

### Mock Data
The app includes fallback mock data if the backend is unavailable. This allows you to develop and test the UI without a working backend.

### Testing in Browser
While developing, you can test in browser. However, some features won't work:
- Haptic feedback
- Theme colors (will use defaults)
- Back button
- Main button

For full testing, use the Telegram mobile app.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT

## 🙋 Support

For issues or questions:
- Open an issue on GitHub
- Contact via Telegram: [@your_username]

## 🎯 Roadmap

- [ ] Add notification preferences
- [ ] Implement shift swap requests
- [ ] Add analytics dashboard
- [ ] Multi-language support
- [ ] Dark/light theme toggle override

---

Built with ❤️ using React + Telegram Mini Apps
