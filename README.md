# Rejap.ai: Smart Japanese Learning Platform

Rejap.ai is an AI-powered Japanese learning platform designed to provide a personalized, adaptive, and fully responsive learning experience. From a smart diagnostic quiz to a dynamic learning path hub, Rejap.ai helps you master Japanese at your own pace with intelligent feedback and structured progression.

---

## Screenshots

- **Home Page**:
  ![Home Page](https://res.cloudinary.com/dykzzd9sy/image/upload/v1767292043/3bb3d861-6e08-4e74-b0ee-a6e339a11f3d.png)
  
- **Learning Path Hub**:
  ![Learning Path Hub](https://res.cloudinary.com/dykzzd9sy/image/upload/v1767293143/d9de23b8-a4f9-48c8-b593-71f489b9dd21.png)
  
- **AI Diagnostic Quiz**:
  ![AI Diagnostic Quiz](https://res.cloudinary.com/dykzzd9sy/image/upload/v1767292793/5bacdf78-27ad-49cb-96a8-ec8e2e234ea0.png)
  ![AI Diagnostic Quiz Result](https://res.cloudinary.com/dykzzd9sy/image/upload/v1767292880/61efa6f8-ad30-492b-866b-955788c669c6.png)
  
- **Quiz & AI Feedback**:
  ![Quiz & AI Feedback](https://res.cloudinary.com/dykzzd9sy/image/upload/v1767293079/0090d946-c485-470f-854d-84a394a41c7c.png)

---

## Key Features

- **AI Diagnostic Quiz**: A 10-question assessment (3 Beginner, 4 Intermediate, 3 Advanced) that automatically assigns your starting proficiency level.
- **Smart Learning Path**: A centralized hub to track progress across levels (Beginner, Intermediate, Advanced) and modules.
- **Dynamic Unlocking**: Automatically unlocks all preceding levels and modules when a proficiency level is assigned or achieved.
- **Full Responsiveness**: Optimized for mobile, tablet, and desktop viewports, featuring a responsive sidebar (drawer on mobile) and fluid layouts.
- **AI-Powered Feedback**: Instant, intelligent explanations for quiz answers to help you understand your mistakes and learn faster.

---

## Tech Stack

### Frontend
- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4.1
- **UI Components**: Shadcn UI
- **Routing**: React Router DOM

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: PostgreSQL
- **ORM**: Prisma
- **AI Integration**: Groq AI (Llama 3)
- **Authentication**: Google OAuth 2.0

---


## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Groq API Key (for AI features)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Kanishak-xd/Rejap.ai.git
   cd rejap-ai
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create .env and add:
   # DATABASE_URL, GROQ_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   # Create .env and add:
   # VITE_API_URL=http://localhost:3000/api
   npm run dev
   ```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
