# 🚀 RevisePDF Deployment Guide

This guide will help you deploy RevisePDF to Heroku with proper security practices.

## 📋 Prerequisites

- Heroku CLI installed
- Supabase account and project
- Stripe account
- Git repository access

## 🔐 Environment Variables Setup

### 1. Copy Environment Template
```bash
cp .env.local.example .env.local
```

### 2. Configure Supabase
Get these values from your Supabase project dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your project's anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Your project's service role key

### 3. Configure Stripe
Get these values from your Stripe dashboard:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your publishable key
- `STRIPE_SECRET_KEY`: Your secret key
- `STRIPE_WEBHOOK_SECRET`: Your webhook signing secret

## 🚀 Heroku Deployment

### 1. Login to Heroku
```bash
heroku login
```

### 2. Create Heroku App
```bash
heroku create your-app-name
```

### 3. Set Environment Variables
```bash
# Basic configuration
heroku config:set NODE_ENV=production
heroku config:set NEXT_PUBLIC_SITE_URL=https://your-app-name.herokuapp.com

# Supabase configuration
heroku config:set NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
heroku config:set NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Stripe configuration
heroku config:set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
heroku config:set STRIPE_SECRET_KEY=your-stripe-secret-key
heroku config:set STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

### 4. Deploy
```bash
heroku git:remote -a your-app-name
git push heroku main
```

## 🔧 Post-Deployment Setup

### 1. Set up Stripe Products
```bash
stripe fixtures fixtures/stripe-fixtures.json
```

### 2. Configure Stripe Webhook
- Point webhook to: `https://your-app-name.herokuapp.com/api/webhooks`
- Select all events or specific subscription events

### 3. Test the Application
- Visit your app URL
- Test user registration
- Test PDF upload and processing
- Verify subscription limits

## 🔒 Security Notes

- Never commit `.env.local` or any file containing secrets
- Use environment variables for all sensitive configuration
- Regularly rotate API keys and secrets
- Monitor your Heroku app logs for any security issues

## 📊 Monitoring

```bash
# View app logs
heroku logs --tail

# Check app status
heroku ps

# Open app in browser
heroku open
```
