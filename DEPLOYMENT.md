# 🚀 Production Deployment Guide

This guide covers deploying the Event QR Check-In System to production environments.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] MongoDB database set up (Atlas or self-hosted)
- [ ] Email service credentials obtained
- [ ] JWT secret generated (strong, random)
- [ ] Frontend built: `npm run build`
- [ ] All tests passing
- [ ] HTTPS certificate obtained (Let's Encrypt)
- [ ] Domain name configured
- [ ] Database backups configured
- [ ] Error monitoring set up (optional: Sentry, LogRocket)

## Environment Setup for Production

### 1. Generate Secure JWT Secret

```bash
# On your local machine
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use in your `.env` file.

### 2. MongoDB Setup

#### Using MongoDB Atlas (Recommended)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create account and organization
3. Create new project
4. Build a cluster:
   - Choose free tier or paid plan
   - Select region closest to your server
   - Configure replica set for reliability
5. Create database user:
   - Go to Database Access
   - Add new user with strong password
6. Whitelist your server IP:
   - Go to Network Access
   - Add your server IP address
7. Get connection string:
   - Click Connect
   - Copy connection string
   - Replace `<password>` and `<username>`

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/qrcheckin?retryWrites=true&w=majority
```

#### Using Self-Hosted MongoDB

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y mongodb-org

# Create data directory
sudo mkdir -p /var/lib/mongodb/data

# Start daemon
sudo systemctl start mongod
sudo systemctl enable mongod

# Secure with firewall
sudo ufw allow 27017/tcp  # Only from app server
```

### 3. Email Service Setup

#### Option A: Gmail (Recommended for small scale)

1. Enable 2-Step Verification on Google Account
2. Generate App Password:
   - Go to myaccount.google.com/apppasswords
   - Select Mail → Windows Computer
   - Copy 16-character password
3. Add to `.env`:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=16-character-app-password
   ```

#### Option B: SendGrid (Recommended for high volume)

1. Create SendGrid account at sendgrid.com
2. Create API key with Mail Send permission
3. Verify Sender Identity
4. Add to `.env`:
   ```
   EMAIL_SERVICE=sendgrid
   EMAIL_API_KEY=SG.xxxxxxxxxxxxx
   EMAIL_FROM=noreply@yourdomain.com
   ```

#### Option C: AWS SES

1. Create AWS account
2. Verify domain in SES
3. Create IAM user with SES permissions
4. Get Access Key and Secret Key
5. Request production access (increase sending limits)
6. Add to `.env`:
   ```
   EMAIL_SERVICE=ses
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   AWS_SES_REGION=us-east-1
   ```

## Deployment Methods

### Method 1: Railway (Easiest)

Railway automatically handles most production setup.

1. **Sign up at railway.app**

2. **Connect GitHub repository:**
   - Connect GitHub account
   - Select qrcheckin repository
   - Authorize Railway

3. **Create services:**
   - Go to New → Database → MongoDB
   - Go to New → Web Service → GitHub
   - Select frontend and backend repos

4. **Configure environment:**
   ```
   Set all variables from .env in Railway dashboard
   PORT=5000 (automatically exposed)
   MONGODB_URI=provided by MongoDB service
   ```

5. **Deploy:**
   - Push to GitHub
   - Railway auto-deploys
   - Get automatic HTTPS
   - Domain: project-name.railway.app

### Method 2: Vercel + Dokku (Budget-Friendly)

**Frontend on Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

**Backend on Dokku:**
```bash
# On your VPS (Ubuntu 20+)
wget https://raw.githubusercontent.com/dokku/dokku/master/bootstrap.sh
sudo DOKKU_TAG=v0.34.14 bash bootstrap.sh

# Create app
dokku apps:create qrcheckin

# Set environment
dokku config:set qrcheckin \
  MONGODB_URI=... \
  JWT_SECRET=... \
  EMAIL_SERVICE=gmail \
  EMAIL_USER=... \
  EMAIL_PASS=...

# Deploy via Git
git remote add dokku dokku@yourserver.com:qrcheckin
git push dokku main:master
```

### Method 3: Docker + Any Cloud

**Create Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm install && npm run build

WORKDIR /app
EXPOSE 5000

CMD ["npm", "start"]
```

**Create docker-compose.yml:**
```yaml
version: '3'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - EMAIL_SERVICE=${EMAIL_SERVICE}
    depends_on:
      - mongo

  mongo:
    image: mongo:6
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}

volumes:
  mongo-data:
```

**Deploy to AWS/GCP/Azure:**
```bash
docker build -t qrcheckin .
docker run -p 5000:5000 ... qrcheckin
```

### Method 4: Traditional VPS (DigitalOcean, Linode)

**Initial Setup:**
```bash
# SSH into your VPS
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install MongoDB
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# Install Nginx
apt install -y nginx

# Install PM2 (process manager)
npm install -g pm2
```

**Configure Nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Start App with PM2:**
```bash
cd /home/user/qrcheckin
npm install
pm2 start server.js --name qrcheckin
pm2 startup
pm2 save

# Check status
pm2 status
```

**Setup HTTPS with Let's Encrypt:**
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Post-Deployment

### 1. Verify Deployment

```bash
# Test API endpoints
curl https://yourdomain.com/api/health

# Check logs
pm2 logs qrcheckin

# Monitor performance
pm2 monit
```

### 2. Configure Backups

**MongoDB Backups:**
```bash
# Create backup directory
mkdir -p /backups/mongodb

# Add cron job (run daily)
crontab -e

# Add line:
0 2 * * * mongodump --out /backups/mongodb/$(date +\%Y-\%m-\%d) --gzip

# Keep 30 days of backups
0 3 * * * find /backups/mongodb -type d -mtime +30 -exec rm -rf {} +
```

**Automated backups to S3:**
```bash
# Install AWS CLI
apt install -y awscli

# Configure AWS credentials
aws configure

# Backup script
#!/bin/bash
mongodump --gzip --archive | aws s3 cp - s3://your-bucket/backups/mongodb-$(date +%Y-%m-%d).gz
```

### 3. Setup Monitoring

**Error Tracking (Sentry):**
```bash
# Install package
npm install @sentry/node

# Add to app.js
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: "https://your-key@sentry.io/project" });
```

**Performance Monitoring (New Relic):**
```bash
npm install newrelic
# Add to top of server.js before other requires
require('newrelic');
```

**Server Monitoring:**
```bash
# Install monitoring tools
apt install -y htop netdata

# Access Netdata at :19999
```

### 4. Setup Email Notifications

**Alert on errors (Gmail):**
```javascript
// Add to error handler
async function sendErrorAlert(error) {
  if (process.env.NODE_ENV === 'production') {
    await sendQRMail({
      to: 'admin@yourdomain.com',
      subject: 'QR Check-In System Error',
      html: `<pre>${error.message}</pre>`
    });
  }
}
```

### 5. Regular Maintenance

**Daily:** Monitor error logs and performance
**Weekly:** Check database size and backup completion
**Monthly:** Security updates and dependency updates
**Quarterly:** Load testing and disaster recovery drills

## Security Best Practices

### 1. API Security

```javascript
// Add rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

### 2. CORS Configuration

```javascript
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 3. Database Security

```javascript
// Use connection pooling
// Encrypt data at rest
// Regular backups
// IP whitelisting in MongoDB Atlas
```

### 4. Environment Security

```bash
# Never commit .env file
# Rotate secrets regularly
# Use strong JWT_SECRET
# Audit access logs
# Monitor failed login attempts
```

## Troubleshooting Production

### High Memory Usage

```bash
# Check process memory
ps aux | grep node

# Increase Node memory
NODE_OPTIONS=--max-old-space-size=2048 npm start

# Profile memory leaks
node --inspect=0.0.0.0 server.js
```

### Database Connection Issues

```bash
# Test connection
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/database"

# Check connection limits
db.adminCommand({connectionStatus: 1})
```

### Email Sending Failures

```bash
# Test email credentials
# Check rate limits on email service
# Verify sender address is whitelisted
# Check spam folder on test email
```

### HTTPS Certificate Issues

```bash
# Renew certificate before expiry
certbot renew --dry-run

# Check certificate
openssl s_client -connect yourdomain.com:443

# Force HTTPS redirect
```

## Rollback Plan

**If deployment fails:**

1. Check error logs
2. Rollback to previous version: `git revert <commit>`
3. Restore database backup: `mongorestore /backups/mongodb/latest`
4. Redeploy: `git push`
5. Test all functionality

## Performance Optimization

### 1. Database Optimization

```javascript
// Add indexes (run once)
db.participants.createIndex({ eventId: 1, email: 1 })
db.participants.createIndex({ qrTokenHash: 1 })
```

### 2. Caching

```javascript
import Redis from 'redis';
// Cache event stats for 5 minutes
// Cache participant lists
```

### 3. CDN for Frontend

```
Deploy frontend to Cloudflare, AWS CloudFront, or Vercel
Cache images, CSS, JS files
```

### 4. Database Query Optimization

```javascript
// Use projection to fetch only needed fields
Participant.find({eventId}, 'name email qrImage')

// Pagination for large result sets
Participant.find().limit(50).skip(skip)
```

## Scaling Strategies

**As your system grows:**

1. **Phase 1:** Single server (current setup)
2. **Phase 2:** Separate frontend/backend servers
3. **Phase 3:** Load balancer + multiple backend instances
4. **Phase 4:** Microservices architecture
5. **Phase 5:** Kubernetes orchestration

---

**Deployment successful! 🎉**

Your Event QR Check-In System is now live and ready for real events!
