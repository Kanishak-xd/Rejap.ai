# Rejap.ai

A learning platform with structured levels, modules, and interactive quizzes.

## Project Structure

```
Rejap.ai/
├── frontend/          # React + Vite + TypeScript + Tailwind CSS + shadcn/ui
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/           # Node.js + Express + Prisma + PostgreSQL
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── ...
└── instructions.md    # Setup instructions
```

## Getting Started

### Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

### Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy .env.example to .env and update with your database credentials
cp .env.example .env
```

4. Set up the database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

5. Start the development server:
```bash
npm run dev
```

## Database Schema

The backend uses Prisma with PostgreSQL. The schema includes:

- **users** - User accounts with Google OAuth support
- **levels** - Learning levels
- **modules** - Learning modules within levels
- **content_items** - Content within modules (text, video, images, code)
- **quizzes** - Quizzes for modules
- **quiz_questions** - Questions within quizzes
- **user_module_progress** - Track user progress through modules
- **user_quiz_attempts** - Store quiz attempt results
- **user_level_status** - Track user level completion and unlocking

## Development

The frontend and backend are completely decoupled and can be developed independently. The backend API will be consumed by the frontend in future development phases.

