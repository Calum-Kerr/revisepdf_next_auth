#!/bin/bash

# RevisePDF Heroku Deployment Script
echo "🚀 Deploying RevisePDF to Heroku..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed. Please install it first:"
    echo "   curl https://cli-assets.heroku.com/install.sh | sh"
    exit 1
fi

# Check if user is logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "🔐 Please log in to Heroku first:"
    echo "   heroku login"
    exit 1
fi

# Create Heroku app
APP_NAME="revisepdf-$(date +%s)"
echo "📱 Creating Heroku app: $APP_NAME"
heroku create $APP_NAME

# Set environment variables
echo "⚙️  Setting environment variables..."
heroku config:set NODE_ENV=production --app $APP_NAME
heroku config:set NEXT_PUBLIC_SITE_URL=https://$APP_NAME.herokuapp.com --app $APP_NAME

# Supabase configuration (you'll need to add these)
echo "🔧 Please add your Supabase configuration:"
echo "   heroku config:set NEXT_PUBLIC_SUPABASE_URL=your-supabase-url --app $APP_NAME"
echo "   heroku config:set NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key --app $APP_NAME"
echo "   heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key --app $APP_NAME"

# Stripe configuration (you'll need to add these)
echo "💳 Please add your Stripe configuration:"
echo "   heroku config:set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... --app $APP_NAME"
echo "   heroku config:set STRIPE_SECRET_KEY=sk_test_... --app $APP_NAME"
echo "   heroku config:set STRIPE_WEBHOOK_SECRET=whsec_... --app $APP_NAME"

# Add git remote
heroku git:remote -a $APP_NAME

# Deploy
echo "🚀 Deploying to Heroku..."
git add .
git commit -m "Deploy RevisePDF to Heroku" || echo "No changes to commit"
git push heroku main

echo "✅ Deployment complete!"
echo "🌐 Your app is available at: https://$APP_NAME.herokuapp.com"
echo "📊 View logs: heroku logs --tail --app $APP_NAME"
echo "⚙️  Manage app: https://dashboard.heroku.com/apps/$APP_NAME"

echo ""
echo "🔧 Next steps:"
echo "1. Add your Stripe keys using the commands above"
echo "2. Set up Stripe webhook pointing to: https://$APP_NAME.herokuapp.com/api/webhooks"
echo "3. Create Stripe products using: stripe fixtures fixtures/stripe-fixtures.json"
echo "4. Test the application!"
