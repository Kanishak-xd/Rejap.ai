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
# Edit .env with your database credentials and OAuth settings
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

### Auth Models (Auth.js)
- **users** - User accounts
- **accounts** - OAuth account connections
- **sessions** - User sessions
- **verification_tokens** - Email verification tokens

### Application Models
- **levels** - Learning levels
- **modules** - Learning modules within levels
- **content_items** - Content within modules (text, video, images, code)
- **quizzes** - Quizzes for modules
- **quiz_questions** - Questions within quizzes
- **user_module_progress** - Track user progress through modules
- **user_quiz_attempts** - Store quiz attempt results
- **user_level_status** - Track user level completion and unlocking

## Authentication

The backend uses Auth.js (formerly NextAuth.js) with Google OAuth provider.

### Auth Endpoints

- `GET /api/auth/signin` - Sign in page
- `GET /api/auth/callback/google` - Google OAuth callback
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session
- `GET /api/auth/me` - Get current user with level status

### First Login Behavior

On first successful Google login:
1. A new user row is created in the `users` table
2. User's `user_level_status` is initialized to `null` (no entries in the table)
3. User will need to complete onboarding to get assigned a level

## API Routes

- `GET /health` - Health check endpoint
- `GET /api` - API information
- `GET /api/auth/*` - Authentication endpoints (handled by Auth.js)
- `GET /api/me` - Get current authenticated user
- `GET /api/quiz` - Fetch quiz for a module (generates questions via AI if missing)
- `POST /api/quiz/submit` - Submit quiz answers, get AI feedback, and update progress
- `GET /api/quiz/diagnostic` - Get 10 balanced questions for initial assessment
- `POST /api/quiz/diagnostic` - Submit diagnostic quiz and get assigned a level
- `GET /api/learning/path` - Get the full learning path with locked/unlocked status
- `GET /api/user/progress` - Get detailed user progress across all modules

## AI Integration

The backend integrates with **Groq AI (Llama 3.3 70B)** for:
- **Quiz Generation**: Dynamically creating questions based on module content.
- **Explain Answer**: Providing supportive, English-language explanations for incorrect answers.
- **Performance Analysis**: Identifying strengths and weak areas based on quiz results.
- **Motivational Coaching**: Recommending next steps and providing encouragement.

## Environment Variables

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - Secret for encrypting session data
- `AUTH_URL` - Base URL of the application
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GROQ_API_KEY` - API key for Groq AI integration
- `PORT` - Server port (default: 3000)
