# 🤖 Telegram Bot Setup Guide

## Step-by-Step Guide to Connect Your Mini App

### Part 1: Configure Your Mini App URL in BotFather

1. **Open Telegram** and search for `@BotFather`

2. **Send the command**: `/myapps`

3. **Select your existing bot** from the list

4. **Choose**: `Edit Mini App`

5. **If you haven't created a Mini App yet**:
   - Send `/newapp` instead
   - Select your bot
   - Fill in the details:
     - **Title**: Shift Spark Employee Portal
     - **Short name**: shiftspark (or your preferred name)
     - **Description**: Manage shift schedules, report absences, and update preferences
     - **Photo**: Upload a 512x512 icon (optional but recommended)

6. **Set Web App URL**:
   - For Vercel: `https://mbp-tg.vercel.app`
   - For development (using ngrok): `https://your-subdomain.ngrok.io`

### Part 2: Test Your Mini App

There are two ways to open your Mini App:

#### Method 1: Menu Button (Recommended)
1. Open your bot chat in Telegram
2. Look for the menu button (☰) next to the message input
3. Tap it to launch the Mini App

#### Method 2: Inline Button
Create a message with an inline button that opens the Mini App.

Send this to your bot (or have your backend send it):

```
Open the Shift Spark app to manage your schedule!
[button: 🚀 Open App | url: https://t.me/YOUR_BOT_USERNAME/YOUR_APP_SHORT_NAME]
```

### Part 3: Development Testing with ngrok

For local development, you need to expose your local server:

1. **Install ngrok**: https://ngrok.com/download

2. **Start your dev server**:
   ```bash
   npm run dev
   ```

3. **In another terminal, start ngrok**:
   ```bash
   ngrok http 5173
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **Update your Mini App URL** in BotFather with this ngrok URL

6. **Test in Telegram mobile app**

⚠️ **Important**: Each time you restart ngrok, you'll get a new URL and need to update BotFather.

### Part 4: Setting Up the Menu Button

To make your Mini App easily accessible:

1. Send `/mybots` to BotFather
2. Select your bot
3. Choose **Bot Settings** → **Menu Button**
4. Select **Edit Menu Button URL**
5. Enter your Mini App URL
6. Set button text (e.g., "📅 Manage Schedule")

Now users will see a menu button in the chat that directly opens your Mini App!

### Part 5: Backend Integration

Your backend needs to:

1. **Verify Telegram init data** for security
2. **Handle employee lookup** by Telegram user ID
3. **Process absence requests**
4. **Update shift preferences**

Example FastAPI endpoint to verify Telegram data:

```python
from telegram import Update
from telegram.ext import Application
import hashlib
import hmac

def verify_telegram_data(init_data: str, bot_token: str) -> dict:
    """Verify Telegram WebApp init data"""
    try:
        data = dict(item.split('=', 1) for item in init_data.split('&'))
        received_hash = data.pop('hash', None)
        
        if not received_hash:
            return None
            
        data_check_string = '\n'.join(
            f"{k}={v}" for k, v in sorted(data.items())
        )
        
        secret_key = hmac.new(
            b"WebAppData",
            bot_token.encode(),
            hashlib.sha256
        ).digest()
        
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if calculated_hash == received_hash:
            return data
            
        return None
    except Exception:
        return None
```

### Part 6: Production Deployment Checklist

Before going live:

- [ ] Deploy to Vercel/Netlify (stable URL)
- [ ] Update Mini App URL in BotFather
- [ ] Set up your backend API
- [ ] Configure CORS on backend
- [ ] Test on multiple devices
- [ ] Set up SSL certificate (HTTPS required)
- [ ] Enable error logging
- [ ] Test with real Telegram users

### Part 7: User Authentication Flow

1. **User opens Mini App** from Telegram
2. **Telegram passes init data** with user info
3. **App calls backend** with Telegram user ID
4. **Backend verifies** the init data signature
5. **Backend returns** employee data
6. **App displays** personalized interface

### Part 8: Troubleshooting

**Problem**: Mini App shows blank screen
- Check browser console for errors
- Verify the URL is HTTPS
- Check CORS headers on backend

**Problem**: Theme not loading
- App must be opened via Telegram, not direct browser
- Check that Telegram WebApp SDK is loaded

**Problem**: Can't see menu button
- Update your bot's menu button URL in BotFather
- Try closing and reopening the chat

**Problem**: Backend connection fails
- Check `VITE_API_URL` in your `.env`
- Verify CORS is configured
- Check network tab in browser devtools

### Part 9: Best Practices

1. **Always use HTTPS** - Telegram requires it
2. **Verify init data** - Security is critical
3. **Handle errors gracefully** - Show user-friendly messages
4. **Test on real devices** - Desktop Telegram behaves differently
5. **Use haptic feedback** - Makes the app feel native
6. **Respect theme colors** - Don't override Telegram's theme
7. **Add loading states** - Network requests take time
8. **Cache when possible** - Reduce API calls

### Part 10: Going Live

Once everything works:

1. **Get user feedback** from test users
2. **Fix any reported issues**
3. **Announce to your team**
4. **Monitor error logs**
5. **Collect metrics** (usage, errors, performance)
6. **Iterate based on feedback**

---

## Quick Commands Reference

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Start ngrok for testing
ngrok http 5173

# Deploy to Vercel
vercel

# Check for errors
npm run lint
```

## Support

If you run into issues:
1. Check the main README.md
2. Review Telegram Mini Apps documentation: https://core.telegram.org/bots/webapps
3. Check browser console for errors
4. Test with ngrok first before production deployment

Good luck! 🚀
