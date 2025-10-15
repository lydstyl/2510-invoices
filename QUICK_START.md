# Quick Start Guide

## First Time Setup (5 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
# Copy the example file
cp .env.example .env

# Edit .env and set your password
nano .env  # or use your preferred editor
```

Change this line:
```env
USER_PASSWORD="your-secure-password"
```

### 3. Setup database
```bash
npm run setup
```

This will:
- Generate Prisma client
- Create SQLite database
- Run migrations
- Seed with initial user and categories

### 4. Start development server
```bash
npm run dev
```

### 5. Login
- Open http://localhost:3000
- Email: `lydstyl@gmail.com` (or what you set in .env)
- Password: what you set in .env

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm test                 # Run tests in watch mode
npm test:ui              # Open Vitest UI

# Database
npm run prisma:studio    # Open visual database editor
npm run prisma:migrate   # Create new migration
npm run prisma:seed      # Re-seed database

# Build
npm run build            # Build for production
npm start                # Run production build
```

## Troubleshooting

### Database issues
If you have database issues, reset it:
```bash
rm -rf prisma/*.db prisma/*.db-journal
npm run setup
```

### Port already in use
Change the port:
```bash
PORT=3001 npm run dev
```

### Tests failing
Make sure you've generated Prisma client:
```bash
npm run prisma:generate
```
