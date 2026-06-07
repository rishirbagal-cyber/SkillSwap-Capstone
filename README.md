# SkillSwap

A peer-to-peer learning platform where students exchange skills by teaching what they know and learning what they don't. Users connect based on their strengths and weaknesses, complete quizzes after sessions, earn points, and grow together through collaborative learning.

## What it does

- Match students based on complementary skill sets
- Let users teach topics they are strong in and learn topics they struggle with
- Post-session quizzes to reinforce learning and verify knowledge transfer
- Points system to reward active participation and teaching
- AI-powered recommendations using Google Gemini

## Tech Stack

- React 19 with TypeScript
- Vite for build tooling
- Firebase for authentication and database
- Google Gemini AI (@google/genai)
- Recharts for data visualization
- Lucide React for icons

## Getting Started

Clone the repository:

```bash
git clone https://github.com/Rishikesh-Bagal/SkillSwap-Capstone.git
cd SkillSwap-Capstone
```

Install dependencies:

```bash
npm install
```

Set up environment variables:

1. Create a `.env.local` file in the root directory for the frontend:
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_API_BASE=http://localhost:5000
```

2. Create a `.env` file in the `server` directory for the backend:
```env
GEMINI_API_KEY=your_gemini_key
```

Run the backend server:

```bash
cd server
npm install
npm start
```

Run the frontend development server (in a new terminal):

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Project Structure
SkillSwap-Capstone/
├── components/        # Reusable UI components
├── server/            # Backend logic
├── services/          # API and Firebase service files
├── App.tsx            # Root component
├── MainApp.tsx        # Main app layout and routing
├── geminiService.ts   # Gemini AI integration
├── types.ts           # TypeScript type definitions
└── constants.tsx      # App-wide constants

## License

This project was built as a capstone project. Feel free to explore and learn from the code.