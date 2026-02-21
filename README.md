"# 🎫 Event QR Check-In System

A modern, professional web application for managing event registration and check-in using QR codes. Perfect for conferences, workshops, university events, and any gathering where participant tracking is needed.

## ✨ Features

- 🔐 **Admin Dashboard** - Manage events, upload participant lists, and track attendance
- 📱 **QR Code Generation** - Automatic QR code generation for each participant
- 📧 **Email Integration** - Send QR codes to participants via Ethereal (test) or your email service
- 📷 **QR Scanner** - Real-time QR code scanning with camera control for check-in
- 📊 **Attendance Tracking** - Live attendance statistics and reporting
- 📥 **CSV Upload** - Bulk import participants from CSV files
- 📤 **CSV Export** - Export attendance records for further analysis
- 🎨 **Professional UI** - Classical color scheme with fully responsive design
- 🔒 **Secure Authentication** - JWT-based admin authentication
- 📱 **Mobile Friendly** - Works seamlessly on phones and tablets

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   cd qrcheckin
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/qrcheckin
   
   # JWT
   JWT_SECRET=your-secret-key-here
   
   # Email Service (Choose one)
   # Option 1: Use Ethereal (Free testing service)
   EMAIL_SERVICE=ethereal
   
   # Option 2: Use Gmail
   # EMAIL_SERVICE=gmail
   # EMAIL_USER=your-email@gmail.com
   # EMAIL_PASS=your-app-password
   
   # Server Port
   PORT=5000
   ```

5. **Start the backend server**
   ```bash
   npm start
   ```
   Server runs on: `http://localhost:5000`

6. **Start the frontend (in another terminal)**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on: `http://localhost:5173`
   
   The admin dashboard will open automatically.

## 📝 Usage Guide

### 1. Admin Registration & Login

1. Navigate to the **Admin Dashboard** (opens by default)
2. Click "Create Admin Account" to register
3. Enter your details and create password (min 6 characters)
4. Login with your email and password

### 2. Create an Event

1. In the **Admin Dashboard**, fill in:
   - Event name (e.g., "Tech Fest 2026")
   - Location (e.g., "Main Auditorium")
   - Start time (must be in the future)
2. Click **"Create Event"**
3. Select your event from the dropdown

### 3. Add Participants

Prepare a CSV file with the following columns:
```
name,email,studentId
John Doe,john@example.com,STU001
Jane Smith,jane@example.com,STU002
```

Then:
1. Click **"Upload CSV"**
2. Select your CSV file
3. QR codes are generated automatically
4. Click **"📧 Send QR Emails"** to email the codes to all participants

### 4. Check-In at Event

#### For Volunteers/Staff:
1. Go to **Scanner** page
2. Click **"🟢 Turn Camera ON"**
3. Enter your JWT token (received after admin login or from admin)
4. Point camera at participant QR code
5. System shows confirmation with participant name

#### For Participants:
1. Go to **My QR** page
2. Enter your email and event ID
3. Your QR code displays on screen
4. Show it to the volunteer for scanning

### 5. View Statistics

- Admin dashboard shows real-time:
  - Total participants
  - Checked-in count and percentage
  - Not yet checked-in count

### 6. Export Results

- Click **"Export CSV"** to download attendance records
- File contains: Name, Email, Student ID, Check-in Status, Check-in Time

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register admin account
- `POST /api/auth/login` - Login admin account

### Events
- `GET /api/events` - List all admin's events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event details

### Participants & QR
- `GET /api/qr/event/:eventId` - Get all QR codes for event
- `GET /api/qr/display` - Get single participant QR by email
- `GET /api/qr/stats/:eventId` - Get event statistics
- `POST /api/checkin/:qrToken` - Check in participant

### Upload
- `POST /api/upload/participants/:eventId` - Upload participants CSV

### Email
- `POST /api/mail/send/:eventId` - Send QR emails to all participants
- `POST /api/mail/send-single` - Send email to single participant
- `POST /api/mail/resend/:eventId` - Resend failed emails
- `GET /api/mail/status/:eventId` - Get email send status

## 📧 Email Configuration

### Using Ethereal (Testing)
Ethereal is a fake SMTP service for testing emails. Automatically creates temporary credentials.

**Automatic setup:** Just set `EMAIL_SERVICE=ethereal` in .env

### Using Gmail
1. Enable "2-Step Verification" on your Google account
2. Create an "App Password" at myaccount.google.com/apppasswords
3. Use the app password in `.env`

### Using Other Email Services
- **SendGrid**: Set EMAIL_SERVICE=sendgrid and provide API key
- **AWS SES**: Configure AWS credentials
- **Any SMTP service**: Manually configure in `email.util.js`

## 🎨 Customization

### Color Scheme
Edit `frontend/src/styles.css` to change the classical color palette:
- Primary (Navy): `#1a365d`
- Secondary (Brown): `#744210`
- Accent (Gold): `#b8860b`

### Event Fields
To add custom fields (phone, registration number, etc.):
1. Update CSV upload columns in `ParticipantSchema`
2. Modify upload controller to handle new fields
3. Update email templates

## 📱 Features by Page

### Admin Dashboard
- Create events
- Upload participant CSV
- View statistics
- Send QR code emails
- Export attendance CSV

### Scanner Page
- Toggle camera on/off
- Scan participant QRs
- Real-time check-in feedback
- JWT token management

### My QR Page
- View personal QR code
- Check-in status
- Print QR code
- Share QR code

## 🛡️ Security Features

- JWT token authentication for admins
- Password hashing with bcryptjs
- Role-based access control
- QR token uniqueness enforcement
- HTTPS ready (configure in production)
- CORS handling
- Input validation

## 📊 Database Schema

### User Model
```
{
  name: String,
  email: String (unique),
  passwordHash: String,
  role: String (admin),
  createdAt: Date
}
```

### Event Model
```
{
  name: String,
  slug: String (unique),
  location: String,
  startTime: Date,
  createdBy: ObjectId (User reference),
  createdAt: Date
}
```

### Participant Model
```
{
  eventId: ObjectId (Event reference),
  name: String,
  email: String,
  studentId: String,
  qrTokenHash: String (unique),
  qrImage: String (Base64 DataURL),
  emailSent: Boolean,
  checkedIn: Boolean,
  checkedInAt: Date,
  createdAt: Date
}
```

## 🚢 Deployment

### Prepare for Production

1. **Update environment variables**
   ```env
   NODE_ENV=production
   MONGODB_URI=your-production-db-uri
   JWT_SECRET=strong-random-secret
   EMAIL_SERVICE=your-real-email-service
   EMAIL_USER=your-email@domain.com
   EMAIL_PASS=your-secure-password
   ```

2. **Build frontend**
   ```bash
   cd frontend
   npm run build
   cd ..
   ```

3. **Set up HTTPS**
   - Use nginx or Caddy for reverse proxy
   - Install SSL certificate (Let's Encrypt recommended)

4. **Database backup**
   - Set up MongoDB backup schedule
   - Test restore procedures

5. **Monitoring**
   - Set up error logging (Sentry, LogRocket)
   - Monitor server performance
   - Alert on critical errors

### Deploy to Services

**Heroku:**
```bash
git push heroku main
```

**Railway/Render:**
- Connect GitHub repository
- Set environment variables in dashboard
- Deploy automatically on push

**AWS/GCP/Azure:**
- Use managed services for MongoDB
- Deploy Node app to compute instance
- Use CDN for frontend assets

## 🐛 Troubleshooting

### Camera not working
- Ensure HTTPS is enabled (required for camera access)
- Check browser permissions
- Use Chrome/Firefox/Safari (not IE)
- Try different camera device if available

### Emails not sending
- **Ethereal:** Check console for test email preview URL
- **Gmail:** Verify app password, not regular password
- **Other services:** Check API keys and rate limits
- Enable SMTP debugging in `email.util.js`

### Frontend not loading
- Ensure MongoDB is running
- Build frontend: `cd frontend && npm run build`
- Check port conflicts (default 5000/5173)

### QR code not scanning
- Ensure QR code is bright/clear
- Good lighting conditions
- Camera lens is clean
- Device orientation is not inverted

## 📚 Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Nodemailer for emails
- QRCode generation

**Frontend:**
- React 19
- React Router v7
- html5-qrcode for scanning
- Vite for bundling
- CSS3 with classical design

## 📄 License

This project is open source. Feel free to use and modify for your events.

## 🤝 Contributing

Found a bug or have a feature request? Feel free to open an issue or submit a pull request.

## 💡 Tips

- **Security:** Always use strong JWT secrets in production
- **Email testing:** Use Ethereal for development, real service for production
- **CSV format:** Ensure emails are lowercase for proper matching
- **QR printing:** Generate QR before events for offline registration
- **Backup:** Regularly backup your MongoDB database

## 📞 Support

For issues or questions:
1. Check this README
2. Review API error messages
3. Check MongoDB connection
4. Verify email service credentials
5. Test with sample data first

---

**Made with ❤️ for event management**" 
