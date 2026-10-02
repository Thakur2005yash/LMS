# LMS

A full-stack Learning Management System built with React, Vite, Node.js, and Express. This project includes course browsing, enrollment, lesson video flow, quizzes, certificates, instructor dashboards, live classes, and a student dashboard.

Repository: https://github.com/Thakur2005yash/LMS

## Features

- Student and instructor roles
- Course catalog with search and filtering
- Course detail pages and lesson view
- Progress tracking and enrollment logic
- Quiz system with grading
- Certificate generation and verification
- Dashboard pages for students and instructors
- Live classes and leaderboard sections
- AI tutor and discussion area
- JWT-based authentication

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Styling: Custom CSS
- Auth: JWT + bcryptjs
- File handling: multer
- PDF generation: PDFKit

## Project Structure

```bash
LMS/
├── client/                 # Frontend React app
│   ├── src/               # Application source files
│   ├── components/        # Shared UI components
│   ├── pages/             # Page components
│   ├── dashboard/         # Student/instructor dashboards
│   ├── services/          # API helpers
│   ├── public/            # Static assets
│   ├── package.json       # Client dependencies and scripts
│   └── vite.config.js    # Vite config
├── server/                # Express backend
│   ├── controllers/       # Route handlers
│   ├── routes/            # API routes
│   ├── middleware/        # Auth and upload logic
│   ├── models/            # Data access layer
│   ├── data/              # JSON data store
│   ├── uploads/           # Uploaded media files
│   ├── seed.js            # Seed data script
│   ├── server.js          # Server entry point
│   └── package.json       # Server dependencies and scripts
├── package.json           # Root scripts for project management
├── .gitignore             # Git ignore rules
├── README.md              # Project documentation
└── LICENSE                # License file (if present in your repo)
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Thakur2005yash/LMS.git
cd LMS
```

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Run the app

Start the backend:

```bash
npm run server
```

Start the frontend:

```bash
npm run client
```

Then open:

```bash
http://localhost:5173
```

### 4. Seed demo data (optional)

```bash
npm run seed
```

## Demo Accounts

The app includes demo accounts for testing roles quickly:

- Student: student@learnhub.com / student123
- Instructor: instructor@learnhub.com / instructor123
- Admin: admin@learnhub.com / admin123

## License

This project is licensed under the MIT License.

## Author

Yashveer Thakur

GitHub: https://github.com/Thakur2005yash
