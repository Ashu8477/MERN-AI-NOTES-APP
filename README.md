# 🚀 Nano Notes — AI Powered MERN Notes App

Nano Notes is a modern AI-powered notes application built using the MERN stack with intelligent note summarization, action item extraction, public sharing, autosave, analytics dashboard, and advanced search/filtering.

---

## ✨ Features

### 🔐 Authentication

- User Signup/Login
- JWT Authentication
- Protected Routes

### 📝 Notes Management

- Create, Edit, Delete Notes
- Auto Save Notes
- Tags & Categories
- Search & Filter Notes

### 🤖 AI Features

- AI Note Summarization
- AI Action Item Extraction
- AI Suggested Titles
- Ollama + Llama3 Integration

### 📊 Productivity Dashboard

- Total Notes Analytics
- AI Usage Statistics
- Most Used Tags
- Most Used Categories

### 🌍 Public Sharing

- Share Notes Publicly
- Unique Public Share Links
- Public Note View Without Login

### 🎨 UI/UX

- Modern Dark Theme
- Responsive Layout
- Premium SaaS Inspired Design

---

# 🛠️ Tech Stack

## Frontend

- React
- Vite
- Axios
- React Router DOM

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

## AI

- Ollama
- Llama3

---



# ⚙️ Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Ashu8477/MERN-AI-NOTES-APP.git
cd MERN-AI-NOTES-APP
```

---

## 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env`

```env
PORT=5000
MONGO_URI=YOUR_MONGO_URI
JWT_SECRET=YOUR_SECRET
```

Run Backend:

```bash
npm run dev
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 4️⃣ Install Ollama

Download:
https://ollama.com/download

Install model:

```bash
ollama pull llama3
```

Run Ollama:

```bash
ollama serve
```

---

# 📡 API Routes

## Auth

- POST `/api/auth/register`
- POST `/api/auth/login`

## Notes

- GET `/api/notes`
- POST `/api/notes`
- PUT `/api/notes/:id`
- DELETE `/api/notes/:id`

## AI

- POST `/api/ai/notes/:id/summarize`

## Share

- POST `/api/notes/:id/share`
- GET `/api/notes/shared/:shareId`

---

# 🚀 Future Improvements

- Markdown Editor
- Archive Notes
- Drag & Drop Notes
- Theme Toggle
- Rich Text Editing
- AI Chat Assistant

---

# 👨‍💻 Author

Ashu Kumar

---

# ⭐ If you like this project, give it a star!
