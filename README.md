# 🎬 ScreenScoop
### *The inside scoop on films*

ScreenScoop is a film review platform where critics can write reviews, rate films, build a watchlist, and explore what others are watching. Built as a microservices project and deployed on Render + Vercel.

---

## ✨ Features

- **Google OAuth** login
- **Write & publish** film reviews with a rich text editor
- **Rate films** out of 10 — per-author average shown on profiles
- **Watchlist** — save reviews to come back to later
- **Genre filtering** and search across all reviews
- **Public profiles** — browse any critic's reviews and stats
- **AI writing assistant** — Gemini API to improve writing and fix grammar
- **Responsive UI** with a cinematic dark theme

---

## 🏗️ Architecture

ScreenScoop is split into three independent microservices, each containerised with Docker and deployed on Render.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Service  │     │  Author Service  │     │  Blog Service   │
│   (MongoDB)     │     │  (PostgreSQL)    │     │  (PostgreSQL)   │
│                 │     │                  │     │                 │
│ - Auth / JWT    │     │ - Create blog    │     │ - Get all blogs │
│ - Profile CRUD  │     │ - Update blog    │     │ - Comments      │
│ - Avatar upload │     │ - Delete blog    │     │ - Saved blogs   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                 │
                      ┌──────────────────┐
                      │  Next.js Frontend │
                      │  (Vercel)         │
                      └──────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| Next.js 14 | React framework, routing, SSR |
| Tailwind CSS | Styling |
| Context API | Global state management |
| JWT (cookies) | Auth token storage |
| Google OAuth | Login via `@react-oauth/google` |
| Axios | HTTP client |

### Backend (all three services)
| Tech | Purpose |
|------|---------|
| Node.js + Express | REST API framework |
| Docker | Containerisation |
| Render | Deployment (Docker images) |

### Databases
| Service | Database |
|---------|---------|
| User Service | MongoDB Atlas |
| Author Service | PostgreSQL (Neon serverless) |
| Blog Service | PostgreSQL (Neon serverless) |

### External APIs
| API | Purpose |
|-----|---------|
| Google Cloud Console | OAuth 2.0 authentication |
| Google Gemini | AI writing assistant in review editor |

---

## 📡 API Overview

### User Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/login` | Google OAuth login |
| GET | `/api/v1/me` | Get current user |
| POST | `/api/v1/user/update` | Update profile |
| POST | `/api/v1/user/update/pic` | Update avatar |
| GET | `/api/v1/user/:id` | Get public profile |

### Author Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/blog` | Create a review |
| POST | `/api/v1/blog/:id` | Update a review |
| DELETE | `/api/v1/blog/:id` | Delete a review |

### Blog Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/blog/all` | Get all reviews (with search/filter) |
| GET | `/api/v1/blog/:id` | Get single review |
| GET | `/api/v1/blog/saved/all` | Get saved blogs |
| POST | `/api/v1/blog/save` | Save / unsave a blog |
| GET | `/api/v1/blog/:id/comments` | Get comments |
| POST | `/api/v1/blog/:id/comment` | Add comment |
| DELETE | `/api/v1/blog/comment/:id` | Delete comment |

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- Docker
- MongoDB Atlas URI
- Neon PostgreSQL URI
- Google Cloud OAuth credentials
- Google Gemini API key

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create a `.env.local` file:
```env
NEXT_PUBLIC_USER_SERVICE=http://localhost:4001
NEXT_PUBLIC_AUTHOR_SERVICE=http://localhost:4002
NEXT_PUBLIC_BLOG_SERVICE=http://localhost:4003
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### Services (Docker)

```bash
# Build and run each service
docker build -t user-service ./user-service
docker run -p 4001:4001 user-service

docker build -t author-service ./author-service
docker run -p 4002:4002 author-service

docker build -t blog-service ./blog-service
docker run -p 4003:4003 blog-service
```

---

## 📁 Frontend Structure

```
frontend/
├── app/
│   ├── blog/
│   │   ├── [id]/          # Single review page
│   │   ├── edit/[id]/     # Edit review
│   │   ├── new/           # Write new review
│   │   └── saved/         # Watchlist page
│   ├── blogs/             # All reviews (main feed)
│   ├── profile/
│   │   ├── page.tsx       # Own profile
│   │   └── [id]/          # Public profile
│   └── login/
├── components/
│   ├── BlogCard.tsx        # Reusable review card
│   ├── navbar.tsx
│   ├── sidebar.tsx
│   └── RichTextEditor.tsx
└── context/
    └── AppContext.tsx      # Global state
```

---

## 🌐 Deployment

| Part | Platform | Method |
|------|----------|--------|
| Frontend | Vercel | Git push auto-deploy |
| All 3 services | Render | Docker image deploy |
| User DB | MongoDB Atlas | Cloud |
| Blog & Author DB | Neon | Serverless PostgreSQL |

---

*Built by Rithvik Kumar*