# RevisePDF - Professional PDF Processing Platform

A powerful, subscription-based PDF processing platform built with Next.js, Supabase, and Stripe. Transform, edit, and optimize your PDFs with secure, cloud-based processing tools.

## 🚀 Features

### PDF Processing
- **Merge PDFs**: Combine multiple PDF files into one
- **Split PDFs**: Extract specific pages from PDF documents
- **Compress PDFs**: Reduce file sizes while maintaining quality
- **Add Watermarks**: Brand your documents with custom watermarks
- **Rotate PDFs**: Adjust page orientation as needed

### Subscription Management
- **File Size Limits**: Tier-based maximum file size restrictions
- **Storage Quotas**: Track and manage storage usage per user
- **Real-time Validation**: Instant feedback on upload limits
- **Usage Analytics**: Monitor processing history and storage consumption

### Security & Performance
- **Secure Processing**: Files are processed securely and automatically cleaned up
- **User Authentication**: Powered by Supabase Auth with OAuth support
- **Row Level Security**: Database-level security for user data isolation
- **Fast Processing**: Optimized PDF processing with instant downloads

### Subscription Tiers

| Plan | Price | Max File Size | Total Storage | Features |
|------|-------|---------------|---------------|----------|
| **Basic** | $9/month | 10MB | 100MB | Basic PDF processing, Email support |
| **Pro** | $19/month | 50MB | 1GB | Advanced processing, Priority support, Batch operations |
| **Enterprise** | $49/month | 100MB | 10GB | Premium processing, API access, Team collaboration |

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes with serverless functions
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with OAuth providers
- **Payments**: Stripe Checkout and Customer Portal
- **File Storage**: Supabase Storage with automatic cleanup
- **PDF Processing**: pdf-lib for client-side and server-side processing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account
- Heroku account (for deployment)

### 1. Clone and Install

```bash
git clone https://github.com/Calum-Kerr/revisepdf_next_auth.git
cd revisepdf_next_auth
npm install
```

### 2. Environment Setup

Copy the environment variables:

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your credentials:

```env
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
```

### 3. Database Setup

The database schema is automatically applied via Supabase migrations. Key tables include:

- `user_storage`: Track storage usage and limits per user
- `pdf_processing_history`: Log all PDF processing activities
- `subscriptions`: Manage user subscription status
- `products` & `prices`: Stripe product and pricing data

### 4. Stripe Configuration

#### Create Products and Prices

Use the provided fixtures to set up subscription tiers:

```bash
stripe fixtures fixtures/stripe-fixtures.json
```

Or manually create products in your [Stripe Dashboard](https://dashboard.stripe.com/products).

#### Set Up Webhooks

1. Create a webhook endpoint at `your-domain.com/api/webhooks`
2. Select all events or these specific events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🚀 Deployment

### Heroku Deployment

1. **Create Heroku App**:
```bash
heroku create your-app-name
```

2. **Set Environment Variables**:
```bash
heroku config:set NEXT_PUBLIC_SITE_URL=https://your-app-name.herokuapp.com
heroku config:set NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# ... set all other environment variables
```

3. **Deploy**:
```bash
git push heroku main
```

The app includes:
- `Procfile` for Heroku process definition
- `heroku.yml` for container deployment
- `app.json` for one-click deployment

### Alternative Deployment Options

- **Vercel**: Deploy with the Vercel CLI or GitHub integration
- **Railway**: Connect your GitHub repository
- **DigitalOcean App Platform**: Use the app spec configuration

## 🔧 Development

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── upload/        # File upload endpoint
│   │   ├── process-pdf/   # PDF processing endpoint
│   │   └── webhooks/      # Stripe webhooks
│   ├── dashboard/         # User dashboard
│   └── pricing/           # Pricing page
├── components/            # React components
│   └── ui/               # UI components
│       ├── Dashboard/     # Main dashboard
│       ├── FileUpload/    # File upload component
│       ├── StorageIndicator/ # Storage usage display
│       └── Pricing/       # Pricing component
├── utils/                # Utility functions
│   ├── pdf-processing.ts  # PDF manipulation
│   ├── subscription-helpers.ts # Subscription logic
│   └── supabase/         # Supabase client configuration
├── middleware/           # Custom middleware
│   └── subscription-limits.ts # Subscription enforcement
└── supabase/            # Database migrations and config
```

### Key Features Implementation

#### File Upload with Validation
```typescript
// Validates file size against user's subscription tier
const validation = await validateFileUpload(userId, fileSize);
if (!validation.canUpload) {
  // Handle limit exceeded
}
```

#### PDF Processing
```typescript
// Process PDF with various operations
const result = await processPDF(pdfBuffer, {
  type: 'watermark',
  watermarkText: 'RevisePDF'
});
```

#### Storage Management
```typescript
// Update user's storage usage
await updateStorageUsage(userId, fileSize);
```

### Testing

Run the test suite:
```bash
npm test
```

Test subscription limits:
```bash
npm run test:subscriptions
```

## 📝 API Documentation

### Upload Endpoint
```
POST /api/upload
Content-Type: multipart/form-data

Body: { file: PDF file }
```

### Process PDF Endpoint
```
POST /api/process-pdf
Content-Type: application/json

Body: {
  type: 'merge' | 'split' | 'compress' | 'watermark' | 'rotate',
  files: string[],
  options: ProcessingOptions
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [docs](./docs) folder for detailed guides
- **Issues**: Report bugs on [GitHub Issues](https://github.com/Calum-Kerr/revisepdf_next_auth/issues)
- **Discussions**: Join the conversation in [GitHub Discussions](https://github.com/Calum-Kerr/revisepdf_next_auth/discussions)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for backend infrastructure
- [Stripe](https://stripe.com/) for payment processing
- [pdf-lib](https://pdf-lib.js.org/) for PDF manipulation
- [Tailwind CSS](https://tailwindcss.com/) for styling
