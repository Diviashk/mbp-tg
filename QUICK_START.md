# 🏃‍♂️ Quick Start Guide - Local Development & Testing

## Option 1: Quick Test Without Backend (Recommended for Initial Testing)

Your app is already configured to work with **mock data** when the backend is unavailable. This is perfect for UI testing!

### Steps:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser** (for quick UI testing):
   ```
   http://localhost:5173
   ```

4. **Test the UI**:
   - Home screen will show with mock employee data
   - Try clicking "Report Absence"
   - Try selecting dates and reasons
   - Try "Update Preference"
   - All UI interactions will work!

**Note**: API calls will fail gracefully and use mock data, so you can test the entire UI flow.

---

## Option 2: Test in Telegram with ngrok

To test the **actual Telegram Mini App experience** (with theme, haptic feedback, etc.):

### Steps:

1. **Install ngrok** (if not already installed):
   - Download from: https://ngrok.com/download
   - Or use: `brew install ngrok` (Mac) or `choco install ngrok` (Windows)

2. **Start your dev server**:
   ```bash
   npm run dev
   ```

3. **In a new terminal, start ngrok**:
   ```bash
   ngrok http 5173
   ```

4. **Copy the HTTPS URL** from ngrok output:
   ```
   Forwarding   https://abc123.ngrok-free.app -> http://localhost:5173
   ```

5. **Configure in BotFather**:
   - Open Telegram
   - Send `/myapps` to @BotFather
   - Select your app
   - Choose "Edit Mini App"
   - Paste the ngrok URL: `https://abc123.ngrok-free.app`

6. **Test in Telegram**:
   - Open your bot
   - Click the menu button (☰)
   - Your Mini App will open!
   - Test haptic feedback, theme colors, etc.

**Important**: Each time you restart ngrok, you get a new URL and must update BotFather.

---

## Option 3: Full Integration with Backend

### Prerequisites:
- FastAPI backend running
- Backend URL (e.g., `http://localhost:8000`)

### Steps:

1. **Create `.env` file** in project root:
   ```bash
   VITE_API_URL=http://localhost:8000/api
   ```

2. **Update backend CORS** to allow your frontend:
   ```python
   # In your FastAPI app
   from fastapi.middleware.cors import CORSMiddleware

   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "http://localhost:5173",  # Vite dev server
           "https://*.ngrok-free.app"  # ngrok tunnels
       ],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

3. **Start backend**:
   ```bash
   # In your backend directory
   uvicorn main:app --reload
   ```

4. **Start frontend**:
   ```bash
   # In this directory
   npm run dev
   ```

5. **Test API integration**:
   - The app will now make real API calls
   - Check browser console for network requests
   - Verify responses in Network tab

---

## 🧪 Testing Checklist

### UI Testing (Browser - Option 1)
- [ ] Home screen displays
- [ ] "Report Absence" button works
- [ ] Calendar picker opens
- [ ] Date selection works (single & range)
- [ ] Reason chips are selectable
- [ ] "Update Preference" button works
- [ ] Day toggles work for all shifts
- [ ] Submit buttons appear when forms are valid
- [ ] Back navigation works

### Telegram Integration Testing (ngrok - Option 2)
- [ ] Mini App opens from Telegram menu
- [ ] Theme colors match Telegram theme (try light & dark)
- [ ] Haptic feedback works on button taps
- [ ] Main button (bottom) appears when form is valid
- [ ] Back button (top left) works
- [ ] App expands to full screen
- [ ] Closing confirmation works

### API Testing (Full integration - Option 3)
- [ ] Employee data loads from backend
- [ ] Absence submission succeeds
- [ ] Preference update succeeds
- [ ] Error messages display on API failures
- [ ] Loading states show during API calls
- [ ] Success alerts appear after submission

---

## 🔍 Development Tips

### Hot Reload
Vite has built-in hot module replacement. Just save your files and changes appear instantly!

### Browser DevTools
1. Open DevTools (F12 or Right Click → Inspect)
2. Use Console to see logs
3. Use Network tab to monitor API calls
4. Use Application tab to check local storage

### Telegram DevTools (Desktop Only)
1. Open Telegram Desktop
2. Right-click in the Mini App
3. Click "Inspect Element"
4. Full DevTools available!

### Testing on Mobile
1. Use ngrok to get HTTPS URL
2. Configure in BotFather
3. Open Telegram on your phone
4. Open the bot and launch Mini App
5. This gives you the most realistic testing experience

---

## 🐛 Common Development Issues

### Issue: `npm install` fails
**Solution**: Make sure you're using Node.js v16 or higher. Check with `node --version`

### Issue: Port 5173 already in use
**Solution**: Kill the process or use a different port:
```bash
npm run dev -- --port 3000
```

### Issue: ngrok URL changes every time
**Solution**: Free ngrok accounts get random URLs. Either:
- Restart and update BotFather each time
- Upgrade to ngrok Pro for static domains
- Use local browser testing for development

### Issue: Theme colors not showing in browser
**Solution**: Theme colors only work when opened via Telegram. In browser, default colors are used.

### Issue: Mock data not appearing
**Solution**: Check browser console for errors. The app creates mock data automatically when API fails.

---

## 🎯 Quick Test Scenarios

### Scenario 1: Report Single Day Absence
1. Click "Report Absence"
2. Keep "Single Day" selected
3. Click a date on calendar
4. Select a reason (e.g., "Sick Leave")
5. Click "Submit Absence" (bottom button in Telegram)
6. Should see success message

### Scenario 2: Report Date Range Absence
1. Click "Report Absence"
2. Toggle to "Date Range"
3. Click start date
4. Click end date
5. Select reason
6. Submit
7. Check success message

### Scenario 3: Update Preferences
1. Click "Update Preference"
2. Select days for Morning shift (e.g., Mon, Tue, Wed)
3. Select days for Evening shift (e.g., Thu, Fri)
4. Leave Night shift empty
5. Click "Save Preferences"
6. Check success message

---

## 📱 Testing on Different Devices

### iOS Testing
1. Use Telegram iOS app
2. Open bot
3. Tap menu button
4. Test all gestures (tap, swipe, etc.)
5. Check Safari compatibility

### Android Testing
1. Use Telegram Android app
2. Open bot
3. Tap menu button
4. Test on different screen sizes
5. Check Chrome compatibility

### Desktop Testing
1. Use Telegram Desktop
2. Open bot
3. Click menu button
4. Right-click for DevTools
5. Test keyboard navigation

---

## 🚀 Ready to Deploy?

Once you've tested locally and everything works:

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Preview production build**:
   ```bash
   npm run preview
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```

4. **Update BotFather** with production URL

5. **Test in production** with real users

---

## 📚 Additional Resources

- **Vite docs**: https://vitejs.dev/guide/
- **React DevTools**: https://react.dev/learn/react-developer-tools
- **Telegram Bot API**: https://core.telegram.org/bots/api
- **ngrok documentation**: https://ngrok.com/docs

---

## ✅ You're All Set!

Your development environment is ready. Start with **Option 1** (browser testing) to iterate quickly on UI, then move to **Option 2** (Telegram testing) to test the full experience.

Happy coding! 🎉
