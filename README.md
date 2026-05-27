# Medical Help

A simple full-stack healthcare web app: register/login, chat with an AI medical assistant, upload medical reports (PDF/images), and view a clean dashboard.

**Stack**: React + Vite + Tailwind CSS · Node.js + Express · MongoDB · Express Session · Multer · Google Gemini API.

---

## Project structure

```
medical-help/
├── backend/                # Express + MongoDB API
│   ├── models/             # Mongoose models (User, Message, Report)
│   ├── routes/             # auth, chat, upload
│   ├── middleware/         # requireAuth session guard
│   ├── uploads/            # saved files (gitignored in prod)
│   ├── server.js           # entry point
│   └── .env.example
└── frontend/               # React + Vite + Tailwind
    └── src/
        ├── pages/          # Login, Register, Dashboard, Chat, Reports
        ├── components/     # Navbar, Spinner, ProtectedRoute
        ├── context/        # AuthContext
        └── api.js          # axios instance (withCredentials)
```

---

## Prerequisites

- **Node.js** 18+
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) — or a free MongoDB Atlas cluster
- **Gemini API key** — free at <https://aistudio.google.com/app/apikey>

---

## 1. Backend setup

```bash
cd backend
cp .env.example .env       # then edit .env with your values
npm install
npm run dev                # starts http://localhost:5000
```

Required env vars (`backend/.env`):

| Variable          | Description                                                  |
| ----------------- | ------------------------------------------------------------ |
| `MONGO_URI`       | e.g. `mongodb://127.0.0.1:27017/medical-help`                |
| `SESSION_SECRET`  | long random string                                           |
| `GEMINI_API_KEY`  | from Google AI Studio                                        |
| `CLIENT_ORIGIN`   | `http://localhost:5173` in dev                               |
| `PORT`            | default `5000`                                               |
| `NODE_ENV`        | `development` locally, `production` when deployed            |

---

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev                # starts http://localhost:5173
```

Vite is configured to proxy `/api` and `/uploads` to `http://localhost:5000`, so the session cookie just works.

Open <http://localhost:5173>, register an account, and you're in.

---

## API reference

All endpoints are prefixed with `/api`. Auth uses the `mh.sid` session cookie.

### Auth
| Method | Path             | Body                          | Notes                       |
| ------ | ---------------- | ----------------------------- | --------------------------- |
| POST   | `/auth/register` | `{ name, email, password }`   | Auto-logs in                |
| POST   | `/auth/login`    | `{ email, password }`         |                             |
| POST   | `/auth/logout`   |                               |                             |
| GET    | `/auth/me`       |                               | Returns current user or 401 |

### Chat
| Method | Path            | Body                          | Notes                                          |
| ------ | --------------- | ----------------------------- | ---------------------------------------------- |
| GET    | `/chat/history` |                               | Returns all messages (oldest first)            |
| DELETE | `/chat/history` |                               | Clears all messages                            |
| POST   | `/chat`         | `{ content, reportId? }`      | If `reportId`, the report text is sent to AI   |

### Upload
| Method | Path           | Form data        | Notes                              |
| ------ | -------------- | ---------------- | ---------------------------------- |
| POST   | `/upload`      | `file` (single)  | PDF/JPG/PNG/WEBP up to 10 MB       |
| GET    | `/upload`      |                  | Lists current user's reports       |
| DELETE | `/upload/:id`  |                  | Deletes report + file from disk    |

Uploaded files are served from `/uploads/<storedName>`.

---

## How AI report summarization works

1. User uploads a PDF → backend extracts text with `pdf-parse` and stores it on the `Report`.
2. In the Chat page, the user picks a report from the dropdown and asks something like "Summarize this report".
3. The frontend POSTs `{ content, reportId }` to `/api/chat`. The backend appends the report's extracted text to the user message before sending it to Gemini.

Image-only reports (JPG/PNG) are stored but not auto-extracted in this starter — you can extend `routes/upload.js` to use OCR (e.g. `tesseract.js`) or send the image directly to a vision model.

---

## Deployment guide

The frontend and backend deploy separately.

### Backend (Render / Railway / Fly.io / any Node host)

1. Push the repo to GitHub.
2. Create a Web Service pointing at `backend/`.
   - **Build**: `npm install`
   - **Start**: `npm start`
3. Set env vars: `MONGO_URI` (MongoDB Atlas), `SESSION_SECRET`, `GEMINI_API_KEY`, `CLIENT_ORIGIN` (your frontend's URL, e.g. `https://medical-help.vercel.app`), `NODE_ENV=production`.
4. The server sets `trust proxy` and uses `secure` + `sameSite=none` cookies in production so cross-origin sessions work.
5. **Persistent uploads**: ephemeral hosts (Render free, Heroku) wipe the `uploads/` folder on restart. For production switch to S3, Cloudinary, or a mounted disk.

### Frontend (Vercel / Netlify)

1. Create a project pointing at `frontend/`.
   - **Build command**: `npm run build`
   - **Output dir**: `dist`
2. In production the dev proxy isn't active — set the API base URL in `src/api.js`:
   ```js
   const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL + '/api',
     withCredentials: true,
   });
   ```
   Then add `VITE_API_URL=https://your-backend.onrender.com` in the host's env vars and rebuild.
3. Make sure your backend's `CLIENT_ORIGIN` exactly matches your deployed frontend URL (no trailing slash).

### MongoDB Atlas (free tier)

1. Create a free cluster at <https://www.mongodb.com/atlas>.
2. Create a database user + allow your backend host's IP (or `0.0.0.0/0` for simplicity).
3. Copy the connection string into `MONGO_URI`.

---

## Notes & next steps

- This app is for educational/portfolio use. Always remind users it is **not** medical advice.
- Easy extensions: OCR for images, rate limiting (`express-rate-limit`), Helmet (`helmet`), password reset email, threaded conversations, doctor directory.
- Switching AI provider: swap `routes/chat.js` to use `openai` or `@anthropic-ai/sdk` — the rest of the app stays the same.

Happy hacking! 🩺
