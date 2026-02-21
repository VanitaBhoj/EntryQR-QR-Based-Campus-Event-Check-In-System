# 🚀 Quick Start Guide

## Prerequisites Installation

### 1. Install Node.js
- Download from [nodejs.org](https://nodejs.org)
- Choose LTS version (v18 or higher recommended)
- Verify installation: `node --version` and `npm --version`

### 2. Install MongoDB

#### Option A: Local MongoDB
- Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- Follow installation guide for your OS
- Verify: `mongod --version`

#### Option B: MongoDB Atlas (Cloud - Recommended)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster
4. Generate connection string
5. Copy to `.env` file

### 3. Download Project
```bash
# Extract the qrcheckin.zip file
# or git clone the repository
cd qrcheckin
```

## Step-by-Step Setup

### Step 1: Install Dependencies

```bash
# Backend dependencies
npm install

# Frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Configure Environment

```bash
# Copy example file
cp .env.example .env

# Edit .env file with your settings
# - MongoDB URI
# - JWT Secret
# - Email service choice
```

### Step 3: Start MongoDB (if using local)

```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Step 4: Start Backend Server

```bash
npm start
```

You should see:
```
Server running on port 5000
Connected to MongoDB
📧 Using Ethereal test email service
```

### Step 5: Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v7.3.1  ready in 100 ms

➜  Local:        http://localhost:5173/
```

**Admin Dashboard opens automatically! ✅**

## First-Time Setup Walkthrough

### 1. Register Admin Account
- Click "Create Admin Account"
- Enter Name, Email, Password
- Click "Register"
- Login with credentials

### 2. Create Test Event
- Fill in event details
- Click "Create Event"
- Event appears in dropdown

### 3. Upload Test Participants
Create a `test-participants.csv`:
```csv
name,email,studentId
Alice Johnson,alice@example.com,STU001
Bob Smith,bob@example.com,STU002
Carol Wilson,carol@example.com,STU003
```

- Click "Upload CSV"
- Select the file
- QR codes generate automatically
- Check console for Ethereal email preview link

### 4. Test Scanner
- Go to Scanner tab
- Click "🟢 Turn Camera ON"
- Paste your JWT token (from login)
- Point camera at your computer screen showing a QR code
- Check-in displays on screen

### 5. View Your QR
- Go to "My QR" tab
- Enter your email and event ID
- Your QR code displays
- Click "Print QR" if needed

## Ethereal Email Testing

When using `EMAIL_SERVICE=ethereal`:

1. Check server console for test email links
2. Ethereal creates temporary email account
3. Click preview link to see email
4. Account lasts 1 week
5. Perfect for development!

**To use real emails:**
- Update `.env` with Gmail, SendGrid, or other service
- Restart server

## Troubleshooting

### "Cannot connect to MongoDB"
```
Solution: 
1. Verify MongoDB is running (mongod command)
2. Check MongoDB URI in .env
3. If using Atlas, whitelist your IP
```

### "Port 5000 already in use"
```
Solution:
1. Kill process: lsof -i :5000 (Mac/Linux)
2. Or change PORT in .env and app.js
```

### "Frontend won't load"
```
Solution:
1. Verify backend is running on port 5000
2. Clear browser cache
3. Check browser console for errors
4. Ensure npm run build completed for React
```

### "Camera not working"
```
Solution:
1. Use HTTPS (required for camera)
2. Check browser permissions
3. Try different browser
4. Check camera hardware
```

### "No preview link for Ethereal email"
```
Solution:
1. Check server console output
2. Search for "Preview URL"
3. Email was still sent, just no preview URL shown
4. Try sending again
```

## Development Tips

### Code Organization
```
qrcheckin/
├── controllers/        # Business logic
├── models/            # Database schemas
├── routes/            # API endpoints
├── middleware/        # Auth, error handling
├── utils/             # Helper functions
├── frontend/
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── styles.css # Styling
│   │   └── App.jsx    # Main app
```

### Useful Commands

```bash
# Backend
npm start              # Start server
npm run dev           # Start with nodemon (auto-reload)

# Frontend (in frontend/ directory)
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build

# Database
mongosh               # Connect to MongoDB directly
mongo admin           # Legacy mongo shell
```

### Testing Email Locally
```bash
# Option 1: Check Ethereal preview links in console
# Option 2: Use test CSV with example emails
# Option 3: Forward emails to Gmail inbox for testing
```

### Resetting Database
```bash
# Delete all participants for an event (caution!)
# Use MongoDB Compass or mongosh to delete records
db.participants.deleteMany({ eventId: "<event-id>" })
```

## Next Steps

After setup works:

1. **Customize UI** - Edit `frontend/src/styles.css`
2. **Add custom fields** - Modify CSV parsing
3. **Deploy to cloud** - See main README
4. **Set up real emails** - Configure email service
5. **Add event features** - Custom check-in, reports, etc

## Getting Help

**Common Issues & Solutions:**
- Check main [README.md](./README.md)
- Review server console logs
- Verify all prerequisites installed
- Test with sample data first

**Email Issues:**
- For Ethereal: Check console for test links
- For Gmail: Use app password, not regular password
- Check `.env` file email settings

**Frontend Issues:**
- Clear browser cache
- Check browser console for errors
- Ensure backend is running
- Verify API endpoints in network tab

---

**You're all set! 🎉**

Now you can:
- Register as an admin
- Create events
- Upload participants
- Generate QR codes
- Scan check-ins
- Track attendance

Happy checking in!
