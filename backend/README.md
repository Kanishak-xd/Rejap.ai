# Rejap.ai Backend

Backend API server for Rejap.ai learning platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Set up the database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

4. Start the development server:
```bash
npm run dev
```

## Database Schema

The project uses Prisma with PostgreSQL. The schema includes:
- Users (with Google OAuth support)
- Levels
- Modules
- Content Items
- Quizzes and Quiz Questions
- User Progress Tracking
- User Quiz Attempts
- User Level Status

## API Routes

- `GET /health` - Health check endpoint
- `GET /api` - API information

More routes will be added as development progresses.


