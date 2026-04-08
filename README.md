# Congolese Community Zimbabwe Website

A professional full-stack CECAU platform built with Next.js, Tailwind CSS, MongoDB, and production-ready cloud upload support for Vercel.

## Features

- Modern public homepage with CECAU branding, editable hero content, and latest announcements
- Activities page with image-backed event cards and highlights
- Members page for leadership, ministers, and vice ministers with photo slots
- Public certificate verification route at `/certificate/[id]`
- Public verification search page at `/verify`
- Two-step certificate workflow: secure record creation, then certificate/photo upload
- QR code generation for every certificate with downloadable QR image
- Anti-fraud SHA256 hash validation using a secret environment key
- Admin login and dashboard for certificates
- Admin content dashboard for homepage, members, photos, activities, and news
- MongoDB Atlas-ready connection handling with reusable connection caching
- Cloudinary-ready upload handling for Vercel production
- Email notifications for key site events and errors when SMTP is configured
- PWA metadata for installable mobile experience

## Required Environment Variables

Copy `.env.example` to `.env.local` and fill in the real values.

```env
MONGODB_URI=
DATABASE_NAME=
APP_URL=
SESSION_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
CERTIFICATE_HASH_SECRET=
```

### Production upload settings for Vercel

```env
UPLOAD_STORAGE=cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Optional notification settings

```env
NOTIFICATION_EMAIL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

## Local Development

1. Copy `.env.example` to `.env.local`
2. Use local or Atlas MongoDB values
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Production Strategy

This project now supports two deployment modes:

1. VPS mode
   Best if you want local disk storage on the server.
2. Vercel mode
   Best if you want managed frontend hosting with MongoDB Atlas and cloud file storage.

For Vercel, use:
- `DATA_STORE=mongo`
- MongoDB Atlas for data
- Cloudinary for uploaded certificate files, photos, and content images

Do not use local disk storage for production uploads on Vercel.

## Vercel Deployment Guide

### 1. Create the required services

You need:
- A Vercel account
- A MongoDB Atlas project and cluster
- A Cloudinary account
- Your production domain name (optional but recommended)

### 2. Prepare MongoDB Atlas

1. Create a free or paid cluster
2. Create a database user
3. Allow your deployment IPs or use Atlas network access rules suitable for Vercel
4. Copy the connection string and set:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.example.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DATABASE_NAME=cecau-community
```

### 3. Prepare Cloudinary

Create a Cloudinary product environment and copy:

```env
UPLOAD_STORAGE=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Set the Vercel environment variables

In your Vercel project settings, add:

```env
DATA_STORE=mongo
MONGODB_URI=...
DATABASE_NAME=cecau-community
APP_URL=https://your-domain.vercel.app
SESSION_SECRET=your-long-random-secret
CERTIFICATE_HASH_SECRET=your-long-random-hash-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-strong-password
UPLOAD_STORAGE=cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NOTIFICATION_EMAIL=admin@example.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=admin@example.com
SMTP_PASS=your-app-password
SMTP_FROM=admin@example.com
```

### 5. Deploy to Vercel

From the project folder:

```bash
npm install
npm run build
```

Then either:
- import the project into Vercel from GitHub, or
- use the Vercel CLI

If you use the Vercel CLI:

```bash
npm install -g vercel
vercel
vercel --prod
```

### 6. Update the production app URL

If you attach a custom domain, update:

```env
APP_URL=https://your-real-domain.com
```

QR codes use `APP_URL + /certificate/[id]`, so this must always match the live public domain.

## API and Upload Behavior in Production

- All API routes return JSON errors with graceful handling
- MongoDB connections are cached and reused across requests
- Uploaded files use Cloudinary in Vercel production
- Certificate downloads still work for both uploaded PDFs and image-based certificates
- If a certificate image is uploaded, the download endpoint converts it to PDF on demand

## Admin Areas

- Certificate admin: `/admin/dashboard`
- Public content admin: `/admin/content`

## Security Notes

- Admin sessions use `SESSION_SECRET`
- Anti-fraud verification uses `CERTIFICATE_HASH_SECRET`
- Secrets are loaded from environment variables only
- Do not commit `.env.local` or production secrets to Git
- Admin credentials are never exposed to the frontend

## Build Commands

```bash
npm run build
npm start
```

## VPS Deployment Files Included

If you still want the current VPS path first, these files remain included:

- `deploy/cecau-community.service`
- `deploy/nginx-community-website.conf`
- `.env.vps.example`

That path is useful when you want server-local storage. Vercel deployment should use MongoDB Atlas plus Cloudinary.
