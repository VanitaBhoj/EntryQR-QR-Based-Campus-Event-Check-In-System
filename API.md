# 📚 API Documentation

Complete API reference for the Event QR Check-In System.

**Base URL:** `http://localhost:5000/api` (development) or `https://yourdomain.com/api` (production)

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Events](#events)
3. [Participants & QR Codes](#participants--qr-codes)
4. [Check-In](#check-in)
5. [Upload](#upload)
6. [Email](#email)

---

## 🔐 Authentication

### Register Admin

Register a new admin account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Admin",
  "email": "admin@example.com",
  "password": "SecurePassword123"
}
```

**Response (Success - 201):**
```json
{
  "message": "Admin created successfully",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Response (Error - 400):**
```json
{
  "message": "Email already registered"
}
```

---

### Login

Login as admin and get JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "SecurePassword123"
}
```

**Response (Success - 200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Admin",
    "email": "admin@example.com"
  }
}
```

**Response (Error - 401):**
```json
{
  "message": "Invalid email or password"
}
```

---

## 🎫 Events

All event endpoints require `Authorization: Bearer <token>` header.

### List All Events

Get all events created by the authenticated admin.

**Endpoint:** `GET /events`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Success - 200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Tech Fest 2026",
    "slug": "tech-fest-2026-1705681234567",
    "location": "Main Auditorium",
    "startTime": "2026-02-28T10:00:00.000Z",
    "createdBy": "507f1f77bcf86cd799439010",
    "createdAt": "2025-02-21T10:15:30.000Z"
  }
]
```

---

### Create Event

Create a new event.

**Endpoint:** `POST /events`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Tech Summit 2026",
  "slug": "tech-summit-2026-1705681234567",
  "location": "Convention Center, Room 101",
  "startTime": "2026-03-15T14:00:00Z"
}
```

**Response (Success - 201):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Tech Summit 2026",
  "slug": "tech-summit-2026-1705681234567",
  "location": "Convention Center, Room 101",
  "startTime": "2026-03-15T14:00:00.000Z",
  "createdBy": "507f1f77bcf86cd799439010",
  "createdAt": "2025-02-21T10:20:00.000Z"
}
```

---

### Get Event Details

Get details of a specific event.

**Endpoint:** `GET /events/:eventId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Tech Fest 2026",
  "location": "Main Auditorium",
  "startTime": "2026-02-28T10:00:00.000Z",
  "totalParticipants": 150,
  "checkedIn": 42
}
```

---

## 👥 Participants & QR Codes

### Get Event Participants

Get all participants and their QR codes for an event.

**Endpoint:** `GET /qr/event/:eventId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "eventId": "507f1f77bcf86cd799439011",
  "eventName": "Tech Fest 2026",
  "totalParticipants": 150,
  "checkedIn": 42,
  "participants": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "studentId": "STU001",
      "qrImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "checkedIn": true,
      "checkedInAt": "2026-02-28T10:05:30.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439021",
      "name": "Bob Smith",
      "email": "bob@example.com",
      "studentId": "STU002",
      "qrImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "checkedIn": false
    }
  ]
}
```

---

### Get Participant QR

Get QR code for a specific participant.

**Endpoint:** `GET /qr/display?email=alice@example.com&eventId=507f1f77bcf86cd799439011`

**Query Parameters:**
- `email` (required) - Participant email
- `eventId` (required) - Event ID

**Response (Success - 200):**
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "studentId": "STU001",
  "qrImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "checkedIn": true,
  "checkedInAt": "2026-02-28T10:05:30.000Z"
}
```

---

### Get Event Statistics

Get attendance statistics for an event.

**Endpoint:** `GET /qr/stats/:eventId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "eventName": "Tech Fest 2026",
  "totalParticipants": 150,
  "checkedIn": 42,
  "notCheckedIn": 108,
  "percentage": "28.0"
}
```

---

## ✅ Check-In

### Check In Participant

Scan QR code to check in a participant.

**Endpoint:** `POST /checkin/:qrToken`

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `qrToken` - Token encoded in QR code (hex string)

**Request Body:**
```json
{}
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "Check-in successful",
  "name": "Alice Johnson",
  "studentId": "STU001",
  "checkedInAt": "2026-02-28T10:05:30.000Z"
}
```

**Response (Already checked in - 400):**
```json
{
  "status": "already_checked_in",
  "message": "Participant already checked in"
}
```

**Response (Invalid QR - 404):**
```json
{
  "status": "invalid_qr",
  "message": "Invalid QR code"
}
```

---

## 📤 Upload

### Upload Participants CSV

Upload CSV file with participant list. QR codes are auto-generated. Emails are sent automatically.

**Endpoint:** `POST /upload/participants/:eventId`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (required) - CSV file with columns: name, email, studentId

**CSV Format:**
```csv
name,email,studentId
Alice Johnson,alice@example.com,STU001
Bob Smith,bob@example.com,STU002
Carol White,carol@example.com,STU003
```

**Response (Success - 201):**
```json
{
  "message": "Participants processed. New participants inserted, duplicates ignored. Emails attempted for new inserts.",
  "inserted": 3,
  "skippedInvalid": 0,
  "totalRows": 3
}
```

**Response (Error - 400):**
```json
{
  "message": "CSV file required"
}
```

---

## 📧 Email

All email endpoints require `Authorization: Bearer <token>` header and admin role.

### Send QR Codes to All Participants

Send QR code emails to all (or unsent) participants of an event.

**Endpoint:** `POST /mail/send/:eventId`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "notSentOnly": true
}
```

**Query Parameters:**
- `notSentOnly` - If true, only send to participants who haven't received emails (default: true)

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "Emails sent successfully to 5 participant(s)",
  "sent": 5,
  "failed": 0,
  "eventName": "Tech Fest 2026",
  "eventId": "507f1f77bcf86cd799439011"
}
```

**Response (Partial failure - 200):**
```json
{
  "status": "success",
  "message": "Emails sent successfully to 4 participant(s)",
  "sent": 4,
  "failed": 1,
  "failedEmails": [
    {
      "email": "invalid@example.com",
      "error": "Invalid email address"
    }
  ],
  "eventName": "Tech Fest 2026"
}
```

---

### Send Email to Single Participant

Send QR code email to one participant.

**Endpoint:** `POST /mail/send-single`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "participantId": "507f1f77bcf86cd799439020"
}
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "Email sent successfully to alice@example.com",
  "email": "alice@example.com",
  "participantName": "Alice Johnson"
}
```

---

### Resend Failed Emails

Retry sending emails to participants who didn't receive them.

**Endpoint:** `POST /mail/resend/:eventId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "Resent emails to 2 participant(s)",
  "resent": 2,
  "failed": 0
}
```

---

### Get Email Status

Check email sending status for an event.

**Endpoint:** `GET /mail/status/:eventId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "eventName": "Tech Fest 2026",
  "eventId": "507f1f77bcf86cd799439011",
  "totalParticipants": 150,
  "emailsSent": 145,
  "emailsNotSent": 5,
  "percentage": "96.7"
}
```

---

## 🔄 Error Responses

All errors follow this format:

```json
{
  "status": "error",
  "message": "Descriptive error message"
}
```

### Common Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400  | Bad Request | Invalid input data |
| 401  | Unauthorized | Missing/invalid token |
| 403  | Forbidden | Insufficient permissions |
| 404  | Not Found | Resource doesn't exist |
| 500  | Internal Server Error | Server error |

---

## 🔑 Authentication

All protected endpoints require JWT token in header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token is obtained from `/auth/login` endpoint.

---

## 📊 Data Models

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  passwordHash: String,
  role: String, // "admin"
  createdAt: Date,
  updatedAt: Date
}
```

### Event
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String,
  location: String,
  startTime: Date,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Participant
```javascript
{
  _id: ObjectId,
  eventId: ObjectId,
  name: String,
  email: String,
  studentId: String,
  qrTokenHash: String,
  qrImage: String, // Base64 DataURL
  emailSent: Boolean,
  checkedIn: Boolean,
  checkedInAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 💡 Usage Examples

### Complete Workflow

```bash
# 1. Register admin
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "SecurePassword123"
  }'

# 2. Login
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123"
  }' | jq -r '.token')

# 3. Create event
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Fest 2026",
    "slug": "tech-fest-2026-1705681234567",
    "location": "Auditorium",
    "startTime": "2026-02-28T10:00:00Z"
  }'

# 4. Upload participants
curl -X POST http://localhost:5000/api/upload/participants/EVENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@participants.csv"

# 5. Send QR emails
curl -X POST http://localhost:5000/api/mail/send/EVENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notSentOnly": true}'

# 6. Check attendee status
curl -X GET "http://localhost:5000/api/qr/stats/EVENT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔒 Rate Limiting

The API implements rate limiting:
- **100 requests per 15 minutes** per IP address
- Rate limit headers in response:
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1705681234
  ```

---

## 📄 Pagination

List endpoints support pagination:

**Query Parameters:**
- `limit` - Results per page (default: 50, max: 100)
- `skip` - Number of results to skip (default: 0)

**Example:**
```
GET /api/events?limit=20&skip=40
```

---

**Last Updated:** February 21, 2026

For issues or questions, refer to main README.md or SETUP.md files.
