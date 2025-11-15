# 🎨 UI Design Reference

## Visual Guide to Your Telegram Mini App

This document shows what each screen looks like and how users interact with it.

---

## 🏠 HOME SCREEN

```
┌─────────────────────────────────────┐
│                                     │
│        👋 Welcome, Divyashree!      │
│        Manage your shift schedule   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│   ┌───────────────────────────┐   │
│   │  📅  Report Absence       │   │  ← 72px height
│   └───────────────────────────┘   │     Blue, prominent
│                                     │
│   ┌───────────────────────────┐   │
│   │  ⭐  Update Preference    │   │  ← 72px height
│   └───────────────────────────┘   │     Gray, secondary
│                                     │
├─────────────────────────────────────┤
│                                     │
│   📆 My Upcoming Shifts             │
│   ┌───────────────────────────┐   │
│   │ Mon, Nov 18          🌅   │   │
│   │ Morning (06:00-14:00)     │   │
│   ├───────────────────────────┤   │
│   │ Wed, Nov 20          🌆   │   │
│   │ Evening (14:00-22:00)     │   │
│   └───────────────────────────┘   │
│                                     │
│   ┌───────────────────────────┐   │
│   │ 💡 Tap any button to      │   │
│   │ update your availability  │   │
│   └───────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### User Flow from Home:
- Tap "Report Absence" → Goes to absence screen
- Tap "Update Preference" → Goes to preference screen
- View upcoming shifts at a glance
- No scrolling needed for main actions

---

## 📅 REPORT ABSENCE SCREEN

```
┌─────────────────────────────────────┐
│ ←  📅 Report Absence                │  ← Back button (Telegram native)
│    Select date(s) and reason        │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────┬─────────────┐    │
│  │📅 Single Day│📆 Date Range│    │  ← Mode toggle
│  └─────────────┴─────────────┘    │
│                                     │
│  ┌─────────────────────────────┐  │
│  │   November 2025              │  │
│  │ Su Mo Tu We Th Fr Sa         │  │
│  │              1  2             │  │
│  │  3  4  5  6  7  8  9         │  │  ← Calendar
│  │ 10 11 12 13 14 15 16         │  │    52px per cell
│  │ 17 [18] 19 20 21 22 23       │  │    [18] = selected
│  │ 24 25 26 27 28 29 30         │  │
│  └─────────────────────────────┘  │
│                                     │
│  Selected Date:                     │
│  Monday, November 18, 2025          │
│                                     │
│  Select Reason                      │
│  ┌───────────────────────────┐    │
│  │ 🤒  Sick Leave            │    │  ← 56px height
│  └───────────────────────────┘    │     chips
│  ┌───────────────────────────┐    │
│  │ 🏖️  Vacation              │    │
│  └───────────────────────────┘    │
│  ┌───────────────────────────┐    │
│  │ 👨‍👩‍👧  Family Emergency      │    │
│  └───────────────────────────┘    │
│  ┌───────────────────────────┐    │
│  │ ✏️  Other                 │    │
│  └───────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
│  [Submit Absence]                   │  ← Telegram Main Button
└─────────────────────────────────────┘
```

### Features:
- **Toggle between single day or date range**
- **Large calendar** with 52px touch targets
- **Visual selection** - selected dates are highlighted
- **Reason chips** - tap to select, shows checkmark
- **Custom reason** field appears if "Other" selected
- **Submit button** appears in Telegram's bottom bar when ready

### Interactions:
1. User taps calendar date → Date highlights
2. User taps reason chip → Chip turns blue
3. Submit button appears at bottom
4. User taps Submit → Success message → Back to home

---

## ⭐ UPDATE PREFERENCE SCREEN

```
┌─────────────────────────────────────┐
│ ←  ⭐ Shift Preferences              │
│    Select your preferred shifts      │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 💡 Tip: Selecting more days   │ │  ← Info banner
│  │ increases your chances!        │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🌅 Morning Shift   [Select All]│ │
│  │ 6 AM - 2 PM                    │ │
│  │                                │ │
│  │  ┌───┬───┬───┬───┐           │ │  ← Day toggles
│  │  │✓Mon│✓Tue│ Wed│✓Thu│        │ │    4 per row
│  │  └───┴───┴───┴───┘           │ │    56px height
│  │  ┌───┬───┬───┐               │ │
│  │  │ Fri│ Sat│ Sun│             │ │
│  │  └───┴───┴───┘               │ │
│  │                                │ │
│  │ 3 days selected                │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🌆 Evening Shift  [Select All] │ │
│  │ 2 PM - 10 PM                   │ │
│  │                                │ │
│  │  ┌───┬───┬───┬───┐           │ │
│  │  │ Mon│✓Tue│✓Wed│ Thu│        │ │
│  │  └───┴───┴───┴───┘           │ │
│  │  ┌───┬───┬───┐               │ │
│  │  │✓Fri│ Sat│ Sun│             │ │
│  │  └───┴───┴───┘               │ │
│  │                                │ │
│  │ 3 days selected                │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🌙 Night Shift    [Select All] │ │
│  │ 10 PM - 6 AM                   │ │
│  │                                │ │
│  │  ┌───┬───┬───┬───┐           │ │
│  │  │ Mon│ Tue│ Wed│ Thu│         │ │
│  │  └───┴───┴───┴───┘           │ │
│  │  ┌───┬───┬───┐               │ │
│  │  │ Fri│ Sat│ Sun│             │ │
│  │  └───┴───┴───┘               │ │
│  │                                │ │
│  │ 0 days selected                │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Summary                        │ │
│  │ 🌅 Morning: 3 days             │ │
│  │ 🌆 Evening: 3 days             │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
│  [Save Preferences]                 │  ← Telegram Main Button
└─────────────────────────────────────┘
```

### Features:
- **Three shift sections** (Morning/Evening/Night)
- **Quick select all** button per shift
- **Visual toggle grid** - selected days show checkmark
- **Counter** shows days selected per shift
- **Summary** at bottom shows total selections
- **Scrollable** - user can scroll through all shifts

### Interactions:
1. User taps day → Day highlights with checkmark
2. User taps "Select All" → All days for that shift select
3. Summary updates in real-time
4. Save button appears when at least one day selected
5. User taps Save → Success message → Back to home

---

## 🎨 Design Tokens

### Colors (Adapts to Telegram Theme)
- **Primary (Button)**: `#2481cc` (Telegram blue)
- **Text**: Adapts to light/dark theme
- **Background**: Adapts to light/dark theme
- **Secondary BG**: Slightly darker/lighter than main BG
- **Hint Text**: Muted gray

### Typography
- **Headers**: 24px, bold
- **Subheaders**: 18px, semibold
- **Body**: 16px, normal
- **Small**: 14px, normal

### Spacing
- **Screen padding**: 16px
- **Component gaps**: 16-24px
- **Touch targets**: Minimum 56px height
- **Primary buttons**: 72px height

### Animations
- **Button tap**: Scale to 95%
- **Haptic feedback**: Light/Medium/Heavy
- **Transitions**: 200ms ease

---

## 📱 Mobile Optimization

### Touch Targets
- All tappable elements ≥ 56px
- Primary buttons: 72px height
- Calendar cells: 52px

### Accessibility
- Large text (16px minimum prevents iOS zoom)
- High contrast in both themes
- Clear visual feedback on selection
- Loading states for all async actions

### Performance
- Lazy load components
- Optimized bundle size
- Fast initial load
- Smooth 60fps animations

---

## 🌈 Theme Support

The app automatically adapts to:
- **Light mode**: White BG, black text
- **Dark mode**: Dark BG, white text
- **Telegram colors**: Uses user's Telegram theme

No configuration needed - it just works!

---

## ✨ Unique Features

1. **Zero configuration**: Works out of the box
2. **Offline-friendly**: Mock data for testing
3. **Native feel**: Haptics + Telegram buttons
4. **Mobile-first**: Designed for thumb usage
5. **Fast**: Optimized React + Vite build
6. **Type-safe**: Full TypeScript coverage

---

## 💡 UX Principles

1. **One task per screen** - No confusion
2. **Large touch targets** - Easy for collar workers
3. **Visual feedback** - Always show what's selected
4. **Clear CTAs** - Obvious next steps
5. **Error prevention** - Can't submit invalid data
6. **Quick actions** - 2-3 taps to complete any task

---

This is your complete UI! Clean, simple, and optimized for mobile workers. 🎯
